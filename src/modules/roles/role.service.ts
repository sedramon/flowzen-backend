import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "./schemas/role.schema";
import { isValidObjectId, Model, Schema as MongooseSchema, Types } from "mongoose";
import { CreateRoleDto } from "./schemas/dto/CreateRole.dto";
import { Scope } from "../scopes/schemas/scope.schema";
import { Tenant } from "../tenants/schemas/tenant.schema";
import { UpdateRoleDto } from "./schemas/dto/UpdateRole.dto";

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(Scope.name) private scopeModel: Model<Scope>,
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>
    ) {
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        try {
            const { tenant, name, availableScopes, ...roleDetails } = createRoleDto;
    
            // Validate the tenant ID
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
    
            // Validate provided scope IDs
            if (availableScopes && availableScopes.length > 0) {
                // Validate each provided scope ID format first
                for (const scopeId of availableScopes) {
                    if (!isValidObjectId(scopeId)) {
                        throw new BadRequestException(`Invalid scope ID: ${scopeId}`);
                    }
                }
    
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
    
            return populatedRole;
        } catch (error) {
            throw error;
        }
    }

    async update(roleId: string, updateRoleDto: UpdateRoleDto) {
        const { name, availableScopes, tenant } = updateRoleDto;
      
        if (tenant && !isValidObjectId(tenant)) {
          throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
        }
      
        if (roleId && !isValidObjectId(roleId)) {
          throw new BadRequestException(`Invalid role ID: ${roleId}`);
        }
      
        if (tenant) {
          const tenantDocument = await this.tenantModel.findById(tenant).exec();
          if (!tenantDocument) {
            throw new NotFoundException(`Tenant with ID ${tenant} not found`);
          }
        }
      
        if (roleId) {
          const role = await this.roleModel.findById(roleId).exec();
          if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
          }
        }
      
        if (availableScopes) {
          // Validate each scope ID before querying
          for (const scopeId of availableScopes) {
            if (!isValidObjectId(scopeId)) {
              throw new BadRequestException(`Invalid scope ID: ${scopeId}`);
            }
          }
          
          const validScopes = await this.scopeModel.find({ _id: { $in: availableScopes } }).exec();
          if (validScopes.length !== availableScopes.length) {
            throw new BadRequestException('One or more provided scope IDs are invalid.');
          }
        }
      
        const roleUpdate = await this.roleModel.findByIdAndUpdate(
          roleId,
          { $set: { name, availableScopes } },
          { new: true }
        );
      
        const populatedRole = await this.roleModel
          .findById(roleUpdate._id)
          .populate('availableScopes') // Populate scopes
          .exec();
      
        return populatedRole;
      }



    async findAll(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }

    async delete(id: string): Promise<Role> {
        return this.roleModel.findByIdAndDelete(id).exec();
      }
}
