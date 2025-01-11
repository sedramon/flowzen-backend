import { Body, Controller, Get, Post } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./schemas/dto/CreateRole.dto";
import { Role } from "./schemas/role.schema";

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

    @Get()
    async findAll(): Promise<Role[]> {
        return this.roleService.findAll();
    }
}