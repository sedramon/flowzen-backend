import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "./schemas/role.schema";
import { Model } from "mongoose";
import { CreateRoleDto } from "./schemas/dto/CreateRole.dto";
import { Scope } from "../scopes/schemas/scope.schema";
import { Tenant } from "../tenants/schemas/tenant.schema";

@Injectable()
export class RoleService{
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(Scope.name) private scopeModel: Model<Scope>,
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>
    ){
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        try {
            const { tenant, name, availableScopes, ...roleDetails } = createRoleDto;

            // Validate provided scope IDs
            if (availableScopes && availableScopes.length > 0) {
                const validScopes = await this.scopeModel
                    .find({ _id: { $in: availableScopes } })
                    .exec();
    
                if (validScopes.length !== availableScopes.length) {
                    throw new BadRequestException('One or more provided scope IDs are invalid.');
                }
            }
    
            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
    
            // Check if a role with the same tenant and name already exists
            const existingRole = await this.roleModel.findOne({ name, tenant }).exec();
            if (existingRole) {
                throw new ConflictException(
                    `Role with name "${name}" already exists for tenant with ID ${tenant}`
                );
            }
    
            
    
            // Create the role with validated data
            const newRole = new this.roleModel({
                tenant,
                name,
                availableScopes,
                ...roleDetails,
            });
            const savedRole = await newRole.save();
    
            // Populate only availableScopes since tenant is automatically populated
            const populatedRole = await this.roleModel
                .findById(savedRole._id)
                .populate('availableScopes') // Populate scopes
                .exec();
    
            return populatedRole; // Tenant is already populated via middleware
        } catch (error) {
            throw error;
        }
    }
    
    

    async findAll(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }
}
