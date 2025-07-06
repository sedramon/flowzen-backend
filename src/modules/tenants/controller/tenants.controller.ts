import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateTenantDto } from "../dto/CreateTenant.dto";
import { UpdateTenantLicenseDto } from "../dto/UpdateTenantLicense.dto";
import { Tenant } from "../schemas/tenant.schema";
import { TenantsService } from "../service/tenants.service";


@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService){}

    @Post()
    async create(@Body() createTenantDto: CreateTenantDto): Promise<CreateTenantDto> {
        return await this.tenantsService.create(createTenantDto);
    }

    @Get()
    async findAll(): Promise<Tenant[]> {
        return await this.tenantsService.findAll();
    }

    @Patch(':id/license')
    async updateLicense(
        @Param('id') id: string,
        @Body() updateTenantLicenseDto: UpdateTenantLicenseDto
    ) : Promise<Tenant> {
        return await this.tenantsService.updateTenantLicense(id, updateTenantLicenseDto);
    }
}