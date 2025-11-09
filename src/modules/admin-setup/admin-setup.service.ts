import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Scope } from '../scopes/schemas/scope.schema';
import { Role } from '../roles/schemas/role.schema';
import { User } from '../users/schemas/user.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { SetupSuperadminDto } from './dto/setup-superadmin.dto';
import { RollbackSuperadminDto } from './dto/rollback-superadmin.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminSetupService {
    constructor(
        @InjectModel(Scope.name) private readonly scopeModel: Model<Scope>,
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
        private readonly auditService: AuditService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async setupSuperadmin(dto: SetupSuperadminDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        const summary = {
            scopes: [] as Array<{ name: string; status: 'created' | 'updated'; id: string }>,
            role: { status: 'created' as 'created' | 'updated', id: '' },
            user: {
                status: 'created' as 'created' | 'updated',
                id: '',
                email: dto.superadmin.email,
                password: dto.superadmin.password,
            },
            tenants: { updated: 0 },
        };

        try {
            // ensure tenant fields exist
            const tenantUpdate = await this.tenantModel.updateMany(
                {},
                {
                    $set: {
                        status: 'active',
                        suspendedAt: null,
                        suspensionReason: null,
                        suspendedBy: null,
                    },
                },
                { session },
            );
            summary.tenants.updated = tenantUpdate.modifiedCount ?? 0;

            // ensure existing scopes/roles have categories/types
            await this.scopeModel.updateMany(
                { $or: [{ category: { $exists: false } }, { category: null }] },
                { $set: { category: 'tenant' } },
                { session },
            );
            await this.roleModel.updateMany(
                { $or: [{ type: { $exists: false } }, { type: null }] },
                { $set: { type: 'tenant' } },
                { session },
            );

            // upsert global scopes
            const scopeIds: Types.ObjectId[] = [];
            for (const scopeName of dto.scopes) {
                let scopeDoc = await this.scopeModel
                    .findOne({ name: scopeName })
                    .session(session)
                    .exec();
                let status: 'created' | 'updated' = 'updated';
                if (!scopeDoc) {
                    scopeDoc = new this.scopeModel({
                        name: scopeName,
                        description: `Global permission ${scopeName}`,
                        category: 'global',
                    });
                    status = 'created';
                } else {
                    scopeDoc.category = 'global';
                    if (!scopeDoc.description) {
                        scopeDoc.description = `Global permission ${scopeName}`;
                    }
                }
                const savedScope = await scopeDoc.save({ session });
                const scopeId = savedScope._id as Types.ObjectId;
                scopeIds.push(scopeId);
                summary.scopes.push({
                    name: scopeName,
                    status,
                    id: scopeId.toHexString(),
                });
            }

            // upsert superadmin role
            let roleDoc = await this.roleModel
                .findOne({ name: 'superadmin' })
                .session(session)
                .exec();
            if (!roleDoc) {
                roleDoc = new this.roleModel({
                    name: 'superadmin',
                    availableScopes: scopeIds,
                    tenant: null,
                    type: 'global',
                });
                summary.role.status = 'created';
            } else {
                roleDoc.availableScopes = scopeIds as any;
                roleDoc.tenant = null;
                roleDoc.type = 'global';
                summary.role.status = 'updated';
            }
            const savedRole = await roleDoc.save({ session });
            const roleId = savedRole._id as Types.ObjectId;
            summary.role.id = roleId.toHexString();

            // upsert superadmin user
            let userDoc = await this.userModel
                .findOne({ email: dto.superadmin.email })
                .session(session)
                .select('+password')
                .exec();
            const passwordHash = await bcrypt.hash(dto.superadmin.password, 10);
            if (!userDoc) {
                userDoc = new this.userModel({
                    name: 'Global Admin',
                    email: dto.superadmin.email,
                    password: passwordHash,
                    role: roleId,
                    tenant: null,
                    isGlobalAdmin: true,
                    scopes: dto.scopes,
                });
                summary.user.status = 'created';
            } else {
                userDoc.password = passwordHash;
                userDoc.role = roleId as any;
                userDoc.tenant = null;
                userDoc.isGlobalAdmin = true;
                userDoc.scopes = dto.scopes;
                summary.user.status = 'updated';
            }
            await userDoc.save({ session });
            summary.user.id = userDoc._id.toHexString();

            await this.auditService.log({
                action: 'superadmin-setup',
                performedBy: null,
                metadata: {
                    scopes: summary.scopes,
                    role: summary.role,
                    user: { status: summary.user.status, email: summary.user.email },
                },
            });

            await session.commitTransaction();
            return summary;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async rollbackSuperadmin(dto: RollbackSuperadminDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        const summary = {
            scopesDeleted: 0,
            roleDeleted: false,
            userDeleted: false,
        };

        try {
            const prefix = dto.scopesPrefix || 'global.';
            const email = dto.superadminEmail || 'global.admin@flowzen.io';

            const scopeDeleteResult = await this.scopeModel.deleteMany(
                { name: { $regex: `^${prefix}` } },
                { session },
            );
            summary.scopesDeleted = scopeDeleteResult.deletedCount ?? 0;

            const roleResult = await this.roleModel
                .findOneAndDelete({ name: 'superadmin' })
                .session(session)
                .exec();
            summary.roleDeleted = !!roleResult;

            const userResult = await this.userModel
                .findOneAndDelete({ email })
                .session(session)
                .exec();
            summary.userDeleted = !!userResult;

            await this.auditService.log({
                action: 'superadmin-rollback',
                performedBy: null,
                metadata: summary,
            });

            await session.commitTransaction();
            return summary;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

