import { Body, Controller, Get, Post } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/CreateTenant.dto";
import { Tenant } from "./schemas/tenant.schema";

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
}