import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Role } from 'src/modules/roles/schemas/role.schema';
import { Scope } from 'src/modules/scopes/schemas/scope.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { AuditService } from 'src/modules/audit/audit.service';
import { AdminCreateRoleDto } from '../dto/admin-create-role.dto';
import { AdminUpdateRoleDto } from '../dto/admin-update-role.dto';

@Injectable()
export class AdminRolesService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
        @InjectModel(Scope.name) private readonly scopeModel: Model<Scope>,
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

    private parseTenantInput(input?: string | null): Types.ObjectId | null {
        if (!input || input === 'global' || input === 'null') {
            return null;
        }

        if (!isValidObjectId(input)) {
            throw new BadRequestException(`Invalid tenant ID: ${input}`);
        }

        return new Types.ObjectId(input);
    }

    private async ensureTenantExists(tenantId: Types.ObjectId | null) {
        if (!tenantId) {
            return;
        }

        const exists = await this.tenantModel.exists({ _id: tenantId }).lean();
        if (!exists) {
            throw new NotFoundException(
                `Tenant with ID ${tenantId.toHexString()} not found`,
            );
        }
    }

    private async resolveScopes(scopeIds: string[]): Promise<Types.ObjectId[]> {
        if (!scopeIds || scopeIds.length === 0) {
            return [];
        }

        const invalid = scopeIds.filter((id) => !isValidObjectId(id));
        if (invalid.length > 0) {
            throw new BadRequestException(
                `Invalid scope ID(s): ${invalid.join(', ')}`,
            );
        }

        const objectIds = scopeIds.map((id) => new Types.ObjectId(id));
        const matched = await this.scopeModel
            .find({ _id: { $in: objectIds } })
            .select('_id')
            .lean()
            .exec();

        if (matched.length !== objectIds.length) {
            throw new BadRequestException(
                'One or more provided scope IDs are invalid.',
            );
        }

        return objectIds;
    }

    async listRoles(tenant?: string, type?: 'global' | 'tenant') {
        const tenantId = this.parseTenantInput(tenant ?? undefined);

        const filter: Record<string, unknown> = {};
        if (tenant !== undefined) {
            if (tenantId) {
                filter.tenant = tenantId;
            } else {
                filter.$or = [{ tenant: null }, { tenant: { $exists: false } }];
            }
        }
        if (type) {
            if (type === 'global') {
                filter.$or = [{ tenant: null }, { tenant: { $exists: false } }];
            } else if (type === 'tenant') {
                filter.tenant = { $ne: null };
            }
        }

        const roles = await this.roleModel
            .find(filter)
            .populate('availableScopes')
            .populate('tenant', 'name')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const mapped = roles.map((role) => ({
            ...role,
            tenant: role.tenant
                ? {
                    _id: this.normalizeId(role.tenant['_id']),
                    name: role.tenant['name'] ?? null,
                    isGlobal: false,
                }
                : { _id: null, name: 'Global', isGlobal: true },
        }));

        if (tenantId || type === 'tenant') {
            return mapped;
        }

        const grouped = new Map<
            'global' | 'tenant',
            { type: 'global' | 'tenant'; roles: typeof mapped }
        >();

        grouped.set('global', { type: 'global', roles: [] });
        grouped.set('tenant', { type: 'tenant', roles: [] });

        mapped.forEach((role) => {
            const groupKey =
                role.tenant && role.tenant.isGlobal ? 'global' : 'tenant';
            grouped.get(groupKey)?.roles.push(role);
        });

        return Array.from(grouped.values());
    }

    async createRole(dto: AdminCreateRoleDto, performedBy: string) {
        const tenantId = this.parseTenantInput(dto.tenant ?? undefined);
        await this.ensureTenantExists(tenantId);

        const scopeObjectIds = await this.resolveScopes(dto.availableScopes);

        const existing = await this.roleModel
            .findOne({
                name: dto.name,
                tenant: tenantId,
            })
            .lean()
            .exec();
        if (existing) {
            throw new ConflictException(
                `Role with name "${dto.name}" already exists for the selected tenant scope.`,
            );
        }

        const role = new this.roleModel({
            name: dto.name,
            availableScopes: scopeObjectIds,
            tenant: tenantId,
            type: tenantId ? 'tenant' : 'global',
        });
        const saved = await role.save();

        const populated = await this.roleModel
            .findById(saved._id)
            .populate('availableScopes')
            .populate('tenant', 'name')
            .lean()
            .exec();

        await this.auditService.log({
            action: 'global-admin.role.create',
            performedBy,
            targetType: 'Role',
            targetId: this.normalizeId(saved._id),
            tenant: tenantId?.toHexString() ?? null,
            metadata: {
                name: dto.name,
                tenant: tenantId?.toHexString() ?? null,
                scopes: dto.availableScopes,
            },
        });

        return populated;
    }

    async updateRole(
        roleId: string,
        dto: AdminUpdateRoleDto,
        performedBy: string,
    ) {
        if (!isValidObjectId(roleId)) {
            throw new BadRequestException(`Invalid role ID: ${roleId}`);
        }

        const role = await this.roleModel.findById(roleId).exec();
        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        const tenantId =
            dto.tenant !== undefined
                ? this.parseTenantInput(dto.tenant)
                : role.tenant instanceof Types.ObjectId
                    ? role.tenant
                    : role.tenant
                        ? new Types.ObjectId(role.tenant as any)
                        : null;

        if (dto.tenant !== undefined) {
            await this.ensureTenantExists(tenantId);
        }

        let scopeObjectIds: Types.ObjectId[] | undefined;
        if (dto.availableScopes !== undefined) {
            scopeObjectIds = await this.resolveScopes(dto.availableScopes);
        }

        if (dto.name) {
            const duplicate = await this.roleModel
                .findOne({
                    _id: { $ne: roleId },
                    name: dto.name,
                    tenant: tenantId,
                })
                .lean()
                .exec();
            if (duplicate) {
                throw new ConflictException(
                    `Role with name "${dto.name}" already exists for the selected tenant scope.`,
                );
            }
        }

        if (dto.name !== undefined) {
            role.name = dto.name;
        }
        if (scopeObjectIds !== undefined) {
            role.availableScopes = scopeObjectIds as any;
        }
        if (dto.tenant !== undefined) {
            role.tenant = (tenantId ?? null) as any;
            role.type = tenantId ? 'tenant' : 'global';
        }

        await role.save();

        const populated = await this.roleModel
            .findById(role._id)
            .populate('availableScopes')
            .populate('tenant', 'name')
            .lean()
            .exec();

        await this.auditService.log({
            action: 'global-admin.role.update',
            performedBy,
            targetType: 'Role',
            targetId: this.normalizeId(role._id),
            tenant: tenantId?.toHexString() ?? null,
            metadata: { updates: dto },
        });

        return populated;
    }

    async deleteRole(roleId: string, performedBy: string) {
        if (!isValidObjectId(roleId)) {
            throw new BadRequestException(`Invalid role ID: ${roleId}`);
        }

        const role = await this.roleModel.findByIdAndDelete(roleId).exec();
        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        await this.auditService.log({
            action: 'global-admin.role.delete',
            performedBy,
            targetType: 'Role',
            targetId: this.normalizeId(role._id),
            tenant:
                role.tenant instanceof Types.ObjectId
                    ? role.tenant.toHexString()
                    : (role.tenant && (role.tenant as any)._id)
                        ? this.normalizeId((role.tenant as any)._id)
                        : null,
            metadata: {
                name: role.name,
            },
        });

        return { message: 'Role deleted successfully' };
    }
}

