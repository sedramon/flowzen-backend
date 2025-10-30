import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CreateRoleDto } from "../dto/CreateRole.dto";
import { Role } from "../schemas/role.schema";
import { UpdateRoleDto } from "../dto/UpdateRole.dto";
import { RoleService } from "../service/role.service";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { Scopes } from "src/common/decorators";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class RolesController {
    constructor(private readonly roleService: RoleService) {}

    @Scopes('scope_user_administration:create')
    @Post()
    async create(@Body() CreateRoleDto: CreateRoleDto): Promise<Role> {
        try{
            return await this.roleService.create(CreateRoleDto);
        }catch(error){
            throw error;
        }
    }

    @Scopes('scope_user_administration:update')
    @Patch(':roleId')
    async update(@Body() UpdateRoleDto: UpdateRoleDto, @Param('roleId') roleId: string): Promise<Role> {
        try{
            return await this.roleService.update(roleId, UpdateRoleDto);
        }catch(error){
            throw error;
        }
    }

    @Scopes('scope_user_administration:read')
    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Role[]> {
        // Tenant ID is REQUIRED - roles must be filtered by tenant
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required. Use query parameter: ?tenant=tenantId');
        }
        return this.roleService.findAllByTenant(tenantId);
    }

    @Scopes('scope_user_administration:read')
    @Get('tenant/:tenantId')
    async findAllByTenant(@Param('tenantId') tenantId: string): Promise<Role[]> {
        return this.roleService.findAllByTenant(tenantId);
    }


    @Scopes('scope_user_administration:delete')
     @Delete(':id')
    async delete(@Param('id') id: string) {
        const deletedRole = await this.roleService.delete(id);
        return deletedRole;
    }
}