import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { SuppliersService } from "../service/supplier.service";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { Scopes } from "src/common/decorators";
import { CreateSupplierDto } from "../dto/CreateSupplier.dto";
import { Supplier } from "../schema/supplier.schema";
import { Scope } from "src/modules/scopes/schemas/scope.schema";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateSupplierDto } from "../dto/UpdateSupplier.dto";

@Controller('suppliers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SupplierController {
    constructor(
        private readonly supplierService: SuppliersService
    ) { }

    @Scopes('scope_suppliers:create')
    @Post()
    async create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
        return await this.supplierService.create(createSupplierDto);
    }

    @Scopes('scope_suppliers:read')
    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Supplier[]> {
        return await this.supplierService.findAll(tenantId);
    }

    @Scopes('scope_suppliers:read')
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Supplier> {
        return await this.supplierService.findOne(id);
    }

    @Scopes('scope_suppliers:update')
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
        return await this.supplierService.update(id, updateSupplierDto);
    }

    @Scopes('scope_suppliers:delete')
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.supplierService.delete(id);
        return { message: 'Supplier deleted succesfully!' }
    }
}