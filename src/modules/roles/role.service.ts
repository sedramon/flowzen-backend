import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "./schemas/role.schema";
import { Model } from "mongoose";

@Injectable()
export class RoleService{
    constructor(@InjectModel(Role.name) private roleModel: Model<Role>){
    }

    async create(createRoleDto: any): Promise<Role> {
        try {
            const existingRole = await this.roleModel.findOne({ name: createRoleDto.name }).exec();

            if (existingRole) {
                throw new ConflictException(`Role with name ${createRoleDto.name} already exists`);
            }

            const newRole = new this.roleModel(createRoleDto);
            return await newRole.save();
        } catch(error)  {
            throw error;
        }
    }

    async findAll(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }
}
