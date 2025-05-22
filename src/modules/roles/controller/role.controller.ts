import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateRoleDto } from "../dto/CreateRole.dto";
import { Role } from "../schemas/role.schema";
import { UpdateRoleDto } from "../dto/UpdateRole.dto";
import { RoleService } from "../service/role.service";

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    async create(@Body() CreateRoleDto: CreateRoleDto): Promise<Role> {
        try{
            return await this.roleService.create(CreateRoleDto);
        }catch(error){
            throw error;
        }
    }

    @Patch(':roleId')
    async update(@Body() UpdateRoleDto: UpdateRoleDto, @Param('roleId') roleId: string): Promise<Role> {
        try{
            return await this.roleService.update(roleId, UpdateRoleDto);
        }catch(error){
            throw error;
        }
    }



    @Get()
    async findAll(): Promise<Role[]> {
        return this.roleService.findAll();
    }

     @Delete(':id')
      async delete(@Param('id') id: string) {
        const deletedRole = await this.roleService.delete(id);
        return deletedRole;
      }
}