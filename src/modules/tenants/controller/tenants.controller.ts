import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Scopes } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { GlobalScopesGuard } from 'src/common/guards/global-scopes.guard';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { CreateTenantDto } from '../dto/CreateTenant.dto';
import { UpdateTenantLicenseDto } from '../dto/UpdateTenantLicense.dto';
import { Tenant } from '../schemas/tenant.schema';
import { TenantsService } from '../service/tenants.service';

@Controller('tenants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) {}

    @Scopes('global.tenants:create')
    @Post()
    async create(@Body() createTenantDto: CreateTenantDto): Promise<CreateTenantDto> {
        return await this.tenantsService.create(createTenantDto);
    }

    @Scopes('global.tenants:read')
    @Get()
    async findAll(): Promise<Tenant[]> {
        return await this.tenantsService.findAll();
    }

    @Scopes('global.tenants:update')
    @Patch(':id/license')
    async updateLicense(
        @Param('id') id: string,
        @Body() updateTenantLicenseDto: UpdateTenantLicenseDto,
    ): Promise<Tenant> {
        return await this.tenantsService.updateTenantLicense(id, updateTenantLicenseDto);
    }

    @Scopes('global.tenants:update')
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.tenantsService.delete(id);
        return { message: 'Tenant deleted successfully' };
    }
}