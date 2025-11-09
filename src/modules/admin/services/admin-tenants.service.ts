import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { CreateTenantDto } from 'src/modules/tenants/dto/CreateTenant.dto';
import { UpdateTenantLicenseDto } from 'src/modules/tenants/dto/UpdateTenantLicense.dto';
import { AdminTenantQueryDto } from '../dto/admin-tenant-query.dto';
import {
    AdminTenantActivateDto,
    AdminTenantSuspendDto,
} from '../dto/admin-tenant-status.dto';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class AdminTenantsService {
    constructor(
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

    async listTenants(query: AdminTenantQueryDto) {
        const { status, search } = query;
        const page = query.page ?? 1;
        const limit = query.limit ?? 25;

        const filter: FilterQuery<Tenant> = {};

        if (status) {
            filter.status = status;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { name: regex },
                { contactEmail: regex },
                { MIB: regex },
                { PIB: regex },
            ];
        }

        const [items, total] = await Promise.all([
            this.tenantModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.tenantModel.countDocuments(filter),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1,
        };
    }

    async createTenant(
        dto: CreateTenantDto,
        performedBy: string,
    ): Promise<Tenant> {
        try {
            const tenant = await this.tenantModel.create({
                ...dto,
                status: 'active',
            });

            const tenantId = this.normalizeId(tenant._id);

            await this.auditService.log({
                action: 'global-admin.tenant.create',
                performedBy,
                targetType: 'Tenant',
                targetId: tenantId,
                tenant: tenantId,
                metadata: { tenant: tenant.toObject() },
            });

            return tenant;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    'Tenant with provided unique fields already exists',
                );
            }

            throw error;
        }
    }

    async updateLicense(
        tenantId: string,
        dto: UpdateTenantLicenseDto,
        performedBy: string,
    ): Promise<Tenant> {
        const tenant = await this.tenantModel
            .findByIdAndUpdate(
                tenantId,
                {
                    $set: {
                        hasActiveLicense: dto.hasActiveLicense,
                        licenseStartDate: dto.licenseStartDate,
                        licenseExpiryDate: dto.licenseExpiryDate,
                    },
                },
                { new: true },
            )
            .exec();

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
        }

        const normalizedTenantId = this.normalizeId(tenant._id);

        await this.auditService.log({
            action: 'global-admin.tenant.update-license',
            performedBy,
            targetType: 'Tenant',
            targetId: normalizedTenantId,
            tenant: normalizedTenantId,
            metadata: {
                license: {
                    hasActiveLicense: dto.hasActiveLicense,
                    licenseStartDate: dto.licenseStartDate,
                    licenseExpiryDate: dto.licenseExpiryDate,
                },
            },
        });

        return tenant;
    }

    async suspendTenant(
        tenantId: string,
        dto: AdminTenantSuspendDto,
        performedBy: string,
    ): Promise<Tenant> {
        const tenant = await this.tenantModel
            .findByIdAndUpdate(
                tenantId,
                {
                    $set: {
                        status: 'suspended',
                        suspendedAt: new Date(),
                        suspensionReason: dto.reason ?? null,
                        suspendedBy: new Types.ObjectId(performedBy),
                    },
                },
                { new: true },
            )
            .exec();

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
        }

        const normalizedTenantId = this.normalizeId(tenant._id);

        await this.auditService.log({
            action: 'global-admin.tenant.suspend',
            performedBy,
            targetType: 'Tenant',
            targetId: normalizedTenantId,
            tenant: normalizedTenantId,
            metadata: {
                reason: dto.reason ?? null,
            },
        });

        return tenant;
    }

    async activateTenant(
        tenantId: string,
        dto: AdminTenantActivateDto,
        performedBy: string,
    ): Promise<Tenant> {
        const tenant = await this.tenantModel
            .findByIdAndUpdate(
                tenantId,
                {
                    $set: {
                        status: 'active',
                        suspensionReason: null,
                    },
                    $unset: {
                        suspendedAt: 1,
                        suspendedBy: 1,
                    },
                },
                { new: true },
            )
            .exec();

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
        }

        const normalizedTenantId = this.normalizeId(tenant._id);

        await this.auditService.log({
            action: 'global-admin.tenant.activate',
            performedBy,
            targetType: 'Tenant',
            targetId: normalizedTenantId,
            tenant: normalizedTenantId,
            metadata: {
                note: dto.note ?? null,
            },
        });

        return tenant;
    }

    async getOverview() {
        const now = new Date();
        const inThirtyDays = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        const [total, active, suspended, pending, expiring] = await Promise.all([
            this.tenantModel.countDocuments(),
            this.tenantModel.countDocuments({ status: 'active' }),
            this.tenantModel.countDocuments({ status: 'suspended' }),
            this.tenantModel.countDocuments({ status: 'pending' }),
            this.tenantModel.countDocuments({
                hasActiveLicense: true,
                licenseExpiryDate: { $lte: inThirtyDays, $gte: now },
            }),
        ]);

        const recentTenants = await this.tenantModel
            .find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .exec();

        return {
            total,
            active,
            suspended,
            pending,
            licensesExpiringSoon: expiring,
            recentTenants,
        };
    }
}

