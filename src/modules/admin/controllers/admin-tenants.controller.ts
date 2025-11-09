import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { GlobalScopesGuard } from 'src/common/guards/global-scopes.guard';
import { Scopes } from 'src/common/decorators/scopes.decorator';
import { AdminTenantsService } from '../services/admin-tenants.service';
import { AdminTenantQueryDto } from '../dto/admin-tenant-query.dto';
import { CreateTenantDto } from 'src/modules/tenants/dto/CreateTenant.dto';
import { UpdateTenantLicenseDto } from 'src/modules/tenants/dto/UpdateTenantLicense.dto';
import {
    AdminTenantActivateDto,
    AdminTenantSuspendDto,
} from '../dto/admin-tenant-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

type RequestWithUser = Request & {
    user?: {
        userId?: string;
    };
};

@ApiTags('Global Admin - Tenants')
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AdminTenantsController {
    private static requireUserId(req: RequestWithUser): string {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenException('Authenticated user context missing');
        }
        return userId;
    }

    constructor(
        private readonly adminTenantsService: AdminTenantsService,
    ) {}

    @Get()
    @Scopes('global.tenants:read')
    async list(@Query() query: AdminTenantQueryDto) {
        return this.adminTenantsService.listTenants(query);
    }

    @Get('overview')
    @Scopes('global.tenants:read')
    async overview() {
        return this.adminTenantsService.getOverview();
    }

    @Post()
    @Scopes('global.tenants:create')
    async create(
        @Body() dto: CreateTenantDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminTenantsController.requireUserId(req);
        return this.adminTenantsService.createTenant(dto, userId);
    }

    @Patch(':id/license')
    @Scopes('global.tenants:update')
    async updateLicense(
        @Param('id') tenantId: string,
        @Body() dto: UpdateTenantLicenseDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminTenantsController.requireUserId(req);
        return this.adminTenantsService.updateLicense(
            tenantId,
            dto,
            userId,
        );
    }

    @Patch(':id/suspend')
    @Scopes('global.tenants:suspend')
    async suspend(
        @Param('id') tenantId: string,
        @Body() dto: AdminTenantSuspendDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminTenantsController.requireUserId(req);
        return this.adminTenantsService.suspendTenant(
            tenantId,
            dto,
            userId,
        );
    }

    @Patch(':id/activate')
    @Scopes('global.tenants:activate')
    async activate(
        @Param('id') tenantId: string,
        @Body() dto: AdminTenantActivateDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminTenantsController.requireUserId(req);
        return this.adminTenantsService.activateTenant(
            tenantId,
            dto,
            userId,
        );
    }
}

