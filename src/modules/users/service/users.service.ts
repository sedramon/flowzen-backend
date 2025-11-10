/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { Role } from 'src/modules/roles/schemas/role.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { UpdateUserDtoNameAndRole } from '../dto/UpdateUser.dto';


@Injectable()
export class UsersService {
    constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            const { role, tenant, ...userDetails } = createUserDto;
  
            // Validate the tenant ID
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
  
            // Check if the role exists for the given tenant
            const roleDocument = await this.roleModel.findOne({ name: role, tenant: tenant }).exec();
            if (!roleDocument) {
                throw new ConflictException('Role not found');
            }
  
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }
  
            // Hash the password
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = new this.userModel({
                ...userDetails,
                password: hashedPassword,
                role: roleDocument._id, // Map the role to its ObjectId
                tenant: tenantDocument._id
            });
  
            const savedUser = await newUser.save();
  
            // Populate the role and tenant fields, then exclude the password from the response
            const populatedUser = await this.userModel
                .findById(savedUser._id)
                .populate('role')
                .populate('tenant')
                .exec();
  
            const { password, ...userWithoutPassword } = populatedUser.toObject();
  
            // Modify the populated role to only include the tenant's ID
            const roleValue = userWithoutPassword.role as Role & { tenant?: any };
            if (roleValue && typeof roleValue === 'object' && 'tenant' in roleValue) {
                const tenantRef = roleValue.tenant;
                if (tenantRef && typeof tenantRef === 'object' && '_id' in tenantRef) {
                    roleValue.tenant = tenantRef._id;
                }
            }
  
            return userWithoutPassword;
  
        } catch (error) {
            // Handle duplicate email error
            if (error.code === 11000) {
                throw new ConflictException('User with this email already exists');
            }
            // Rethrow any other errors for global handling
            throw error;
        }
    }

    async update(id: string, user: UpdateUserDtoNameAndRole) {
        try {
            const { role, tenant, name } = user;
  
            // Validate ObjectIds for tenant and user
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid user ID: ${id}`);
            }

            // Check if user exists first
            const existingUser = await this.userModel.findById(id).exec();
            if (!existingUser) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
  
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            // Find role - try by ObjectId first, then by name
            let roleDocument;
            if (isValidObjectId(role)) {
                roleDocument = await this.roleModel.findOne({ _id: role, tenant: tenant }).exec();
            }
            
            if (!roleDocument) {
                roleDocument = await this.roleModel.findOne({ name: role, tenant: tenant }).exec();
            }

            if (!roleDocument) {
                // Get all available roles for this tenant to show in error message
                const availableRoles = await this.roleModel.find({ tenant: tenant }).select('name').lean().exec();
                const roleNames = availableRoles.map(r => r.name).join(', ');
                throw new NotFoundException(
                    `Role "${role}" not found for tenant "${tenantDocument.name}". ` +
                    `Available roles: ${roleNames || 'none'}`
                );
            }
  
            const userUpdate = await this.userModel.findByIdAndUpdate(
                id,
                { $set: { name, role: roleDocument._id } },
                { new: true }
            ).exec();
      
            if (!userUpdate) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
  
            const populatedUser = await this.userModel
                .findById(userUpdate._id)
                .populate('role')
                .populate('tenant')
                .exec();
  
            return populatedUser;
  
        } catch (error) {
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().populate('role').populate('tenant').exec();
    }

    async findAllByTenant(tenantId: string): Promise<User[]> {
    // Validate the tenant ID
        if (!isValidObjectId(tenantId)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }

        const tenantExists = await this.tenantModel.exists({ _id: tenantId });

        if (!tenantExists) {
            throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
        }

        return this.userModel.find({ tenant: tenantId }).populate('role').exec();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select('+password').exec();
    }

    async findOne(id: string | Types.ObjectId): Promise<User | null> {
        return this.userModel
            .findById(id)
            .populate('role')
            .populate('tenant')
            .exec();
    }



    async delete(id: string): Promise<User> {
        return this.userModel.findByIdAndDelete(id).exec();
    }
}
