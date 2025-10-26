import { Body, Controller, Get, Param, Patch, Post, UseGuards, Delete } from "@nestjs/common";
import { CreateTenantDto } from "../dto/CreateTenant.dto";
import { UpdateTenantLicenseDto } from "../dto/UpdateTenantLicense.dto";
import { Tenant } from "../schemas/tenant.schema";
import { TenantsService } from "../service/tenants.service";
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { Scopes } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller('tenants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService){}

    @Scopes('scope_admin_panel:create')
    @Post()
    async create(@Body() createTenantDto: CreateTenantDto): Promise<CreateTenantDto> {
        return await this.tenantsService.create(createTenantDto);
    }

    @Scopes('scope_admin_panel:read')
    @Get()
    async findAll(): Promise<Tenant[]> {
        return await this.tenantsService.findAll();
    }

    @Scopes('scope_admin_panel:update')
    @Patch(':id/license')
    async updateLicense(
        @Param('id') id: string,
        @Body() updateTenantLicenseDto: UpdateTenantLicenseDto
    ) : Promise<Tenant> {
        return await this.tenantsService.updateTenantLicense(id, updateTenantLicenseDto);
    }

    @Scopes('scope_admin_panel:delete')
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.tenantsService.delete(id);
        return { message: 'Tenant deleted successfully' };
    }
}