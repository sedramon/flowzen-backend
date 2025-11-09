import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Role } from 'src/modules/roles/schemas/role.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { AdminUserQueryDto } from '../dto/admin-user-query.dto';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { AuditService } from 'src/modules/audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
        @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
        private readonly auditService: AuditService,
    ) {}

    private normalizeId(value: unknown): string | null {
        if (!value) {
            return null;
        }

        if (value instanceof Types.ObjectId) {
            return value.toHexString();
        }

        if (typeof value === 'string') {
            return value;
        }

        return null;
    }

    private sanitizeUser(user: User) {
        const { password, ...rest } = user.toObject({ virtuals: true });
        return rest;
    }

    private extractTenantId(tenant: any): string | null {
        if (!tenant) {
            return null;
        }

        if (tenant instanceof Types.ObjectId) {
            return tenant.toHexString();
        }

        if ((tenant as any)?._id) {
            const id = (tenant as any)._id;
            if (id instanceof Types.ObjectId) {
                return id.toHexString();
            }
            if (typeof id === 'string') {
                return id;
            }
        }

        return null;
    }

    private async resolveRole(
        roleInput: string,
        tenantId: string | null,
    ): Promise<Role> {
        const roleFilter: Record<string, unknown> = {};
        if (isValidObjectId(roleInput)) {
            roleFilter._id = new Types.ObjectId(roleInput);
        } else {
            roleFilter.name = roleInput;
        }

        if (tenantId) {
            roleFilter.tenant = new Types.ObjectId(tenantId);
        } else {
            roleFilter.$or = [{ tenant: null }, { tenant: { $exists: false } }];
        }

        const role = await this.roleModel
            .findOne(roleFilter)
            .populate('availableScopes')
            .exec();

        if (!role && !isValidObjectId(roleInput)) {
            throw new NotFoundException(
                `Role "${roleInput}" not found for the provided scope`,
            );
        }

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async listUsers(query: AdminUserQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 25;

        const filter: Record<string, unknown> = {};

        if (query.tenant) {
            filter.tenant = new Types.ObjectId(query.tenant);
        }

        if (query.email) {
            filter.email = query.email.toLowerCase();
        }

        if (query.isGlobalAdmin !== undefined) {
            filter.isGlobalAdmin = query.isGlobalAdmin === 'true';
        }

        const roleFilter = query.role?.trim();
        if (roleFilter) {
            const roleIds: Types.ObjectId[] = [];

            if (isValidObjectId(roleFilter)) {
                roleIds.push(new Types.ObjectId(roleFilter));
            } else {
                const roleQuery: Record<string, unknown> = { name: roleFilter };

                if (query.tenant) {
                    roleQuery.tenant = new Types.ObjectId(query.tenant);
                }

                const roleDocs = await this.roleModel
                    .find(roleQuery)
                    .select('_id')
                    .lean()
                    .exec();

                if (roleDocs.length === 0) {
                    return {
                        items: [],
                        total: 0,
                        page,
                        limit,
                        pages: 0,
                    };
                }

                roleDocs.forEach((doc) => {
                    if (doc?._id instanceof Types.ObjectId) {
                        roleIds.push(doc._id);
                    }
                });
            }

            if (roleIds.length > 0) {
                filter.role = { $in: roleIds };
            }
        }

        const search = query.search?.trim();
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { email: regex }];
        }

        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.userModel.countDocuments(filter),
        ]);

        const roleIdSet = new Set<string>();
        const tenantIdSet = new Set<string>();

        items.forEach((item) => {
            const roleValue = item.role as unknown;
            if (roleValue) {
                if (roleValue instanceof Types.ObjectId) {
                    roleIdSet.add(roleValue.toHexString());
                } else if (
                    typeof roleValue === 'string' &&
                    isValidObjectId(roleValue)
                ) {
                    roleIdSet.add(roleValue);
                }
            }

            const tenantValue = item.tenant as unknown;
            if (tenantValue) {
                if (tenantValue instanceof Types.ObjectId) {
                    tenantIdSet.add(tenantValue.toHexString());
                } else if (
                    typeof tenantValue === 'string' &&
                    isValidObjectId(tenantValue)
                ) {
                    tenantIdSet.add(tenantValue);
                }
            }
        });

        const [roles, tenants] = await Promise.all([
            roleIdSet.size > 0
                ? this.roleModel
                      .find({
                          _id: { $in: Array.from(roleIdSet).map((id) => new Types.ObjectId(id)) },
                      })
                      .lean()
                      .exec()
                : [],
            tenantIdSet.size > 0
                ? this.tenantModel
                      .find({
                          _id: {
                              $in: Array.from(tenantIdSet).map(
                                  (id) => new Types.ObjectId(id),
                              ),
                          },
                      })
                      .lean()
                      .exec()
                : [],
        ]);

        const roleMap = new Map<string, any>(
            roles.map((role: any) => [role._id.toString(), role] as [string, any]),
        );

        const tenantMap = new Map<string, any>(
            tenants.map(
                (tenant: any) => [tenant._id.toString(), tenant] as [string, any],
            ),
        );

        const sanitizedItems = items.map((item) => {
            const { password, role, tenant, ...rest } = item as any;

            let resolvedRole: Role | null | string = null;
            if (role) {
                if (role instanceof Types.ObjectId) {
                    resolvedRole = roleMap.get(role.toHexString()) ?? null;
                } else if (
                    typeof role === 'string' &&
                    isValidObjectId(role)
                ) {
                    resolvedRole = roleMap.get(role) ?? null;
                } else {
                    resolvedRole = role;
                }
            }

            let resolvedTenant: Tenant | null | string = null;
            if (tenant) {
                if (tenant instanceof Types.ObjectId) {
                    resolvedTenant = tenantMap.get(tenant.toHexString()) ?? null;
                } else if (
                    typeof tenant === 'string' &&
                    isValidObjectId(tenant)
                ) {
                    resolvedTenant = tenantMap.get(tenant) ?? null;
                } else {
                    resolvedTenant = tenant;
                }
            }

            return {
                ...rest,
                role: resolvedRole,
                tenant: resolvedTenant
                    ? {
                        _id:
                            resolvedTenant instanceof Types.ObjectId
                                ? resolvedTenant.toHexString()
                                : (resolvedTenant as any)?._id?.toString?.() ??
                                  null,
                        name:
                            (resolvedTenant as any)?.name ??
                            (typeof resolvedTenant === 'string'
                                ? resolvedTenant
                                : null),
                        isGlobal: false,
                    }
                    : {
                        _id: null,
                        name: 'Global',
                        isGlobal: true,
                    },
            };
        });

        if (!query.tenant) {
            const grouped = new Map<
                string,
                {
                    tenant: { _id: string | null; name: string | null };
                    users: any[];
                }
            >();

            sanitizedItems.forEach((user) => {
                const tenantInfo = user.tenant ?? { _id: null, name: null };
                const tenantKey = tenantInfo._id ?? 'global';

                if (!grouped.has(tenantKey)) {
                    grouped.set(tenantKey, {
                        tenant: tenantInfo,
                        users: [],
                    });
                }

                grouped.get(tenantKey)?.users.push(user);
            });

            return {
                items: Array.from(grouped.values()),
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1,
            };
        }

        return {
            items: sanitizedItems,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1,
        };
    }

    async createUser(dto: AdminCreateUserDto, performedBy: string) {
        const session = await this.userModel.db.startSession();
        session.startTransaction();

        try {
            const tenantId =
                dto.isGlobalAdmin === true ? null : dto.tenantId ?? null;

            if (tenantId === null && dto.isGlobalAdmin !== true) {
                throw new BadRequestException(
                    'Tenant ID is required for non-global users',
                );
            }

            if (tenantId !== null) {
                const tenantExists = await this.tenantModel
                    .exists({ _id: new Types.ObjectId(tenantId) })
                    .session(session);
                if (!tenantExists) {
                    throw new NotFoundException(
                        `Tenant with ID ${tenantId} not found`,
                    );
                }
            }

            const role = await this.resolveRole(dto.role, tenantId);

            const passwordHash = await bcrypt.hash(dto.password, 10);

            const user = new this.userModel({
                name: dto.name ?? dto.email,
                email: dto.email.toLowerCase(),
                password: passwordHash,
                role: role._id,
                tenant: tenantId ? new Types.ObjectId(tenantId) : null,
                isGlobalAdmin: dto.isGlobalAdmin === true,
                scopes:
                    dto.scopes && dto.scopes.length > 0
                        ? dto.scopes
                        : role.availableScopes?.map((scope: any) => scope.name) ||
                          [],
            });

            await user.save({ session });

            await session.commitTransaction();

            const populatedUser = await this.userModel
                .findById(user._id)
                .populate('role')
                .populate('tenant')
                .exec();

            const userIdForLog = this.normalizeId(populatedUser._id);
            const tenantIdForLog = this.extractTenantId(populatedUser.tenant);

            await this.auditService.log({
                action: 'global-admin.user.create',
                performedBy,
                targetType: 'User',
                targetId: userIdForLog,
                tenant: tenantIdForLog,
                metadata: {
                    email: populatedUser.email,
                    role: (populatedUser.role as Role).name,
                    tenant: tenantIdForLog,
                    isGlobalAdmin: populatedUser.isGlobalAdmin,
                },
            });

            return this.sanitizeUser(populatedUser);
        } catch (error) {
            await session.abortTransaction();
            if (error.code === 11000) {
                throw new ConflictException(
                    `User with email ${dto.email} already exists`,
                );
            }
            throw error;
        } finally {
            session.endSession();
        }
    }

    async updateUser(
        userId: string,
        dto: AdminUpdateUserDto,
        performedBy: string,
    ) {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const existingTenantId = this.extractTenantId(user.tenant);

        let tenantId: string | null =
            dto.tenantId !== undefined ? dto.tenantId : existingTenantId;

        if (dto.isGlobalAdmin === true) {
            tenantId = null;
        } else if (dto.tenantId !== undefined) {
            tenantId = dto.tenantId;
        }

        if (tenantId !== null && dto.isGlobalAdmin === true) {
            throw new BadRequestException(
                'Global administrators cannot be linked to a tenant',
            );
        }

        if (tenantId !== null) {
            const tenantExists = await this.tenantModel.exists({
                _id: new Types.ObjectId(tenantId),
            });
            if (!tenantExists) {
                throw new NotFoundException(
                    `Tenant with ID ${tenantId} not found`,
                );
            }
        }

        if (dto.role) {
            const role = await this.resolveRole(dto.role, tenantId);
            user.set('role', role._id);

            if (!dto.scopes || dto.scopes.length === 0) {
                user.scopes =
                    role.availableScopes?.map((scope: any) => scope.name) || [];
            }
        }

        if (dto.name !== undefined) {
            user.name = dto.name;
        }

        if (dto.scopes !== undefined) {
            user.scopes = dto.scopes;
        }

        if (dto.isGlobalAdmin !== undefined) {
            user.isGlobalAdmin = dto.isGlobalAdmin;
        }

        user.set('tenant', tenantId ? new Types.ObjectId(tenantId) : null);

        await user.save();

        const populated = await this.userModel
            .findById(user._id)
            .populate('role')
            .populate('tenant')
            .exec();

        const userIdForLog = this.normalizeId(populated._id);
        const tenantIdForLog = this.extractTenantId(populated.tenant);

        await this.auditService.log({
            action: 'global-admin.user.update',
            performedBy,
            targetType: 'User',
            targetId: userIdForLog,
            tenant: tenantIdForLog,
            metadata: {
                updates: dto,
            },
        });

        return this.sanitizeUser(populated);
    }

    async resetPassword(
        userId: string,
        dto: AdminResetPasswordDto,
        performedBy: string,
    ) {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.password = await bcrypt.hash(dto.password, 10);
        await user.save();

        await this.auditService.log({
            action: 'global-admin.user.reset-password',
            performedBy,
            targetType: 'User',
            targetId: this.normalizeId(user._id),
            tenant: this.extractTenantId(user.tenant),
            metadata: {},
        });

        return { message: 'Password updated successfully' };
    }

    async deleteUser(userId: string, performedBy: string) {
        const user = await this.userModel
            .findByIdAndDelete(userId)
            .populate('tenant')
            .exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        await this.auditService.log({
            action: 'global-admin.user.delete',
            performedBy,
            targetType: 'User',
            targetId: this.normalizeId(user._id),
            tenant: this.extractTenantId(user.tenant),
            metadata: {
                email: user.email,
            },
        });

        return { message: 'User deleted successfully' };
    }
}

