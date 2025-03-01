/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/schemas/role.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { UpdateUserDtoNameAndRole } from './dto/UpdateUser.dto';

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
      // Populate the role field and exclude the password
      const populatedUser = await this.userModel
        .findById(savedUser._id)
        .populate('role') // Populate the role field with the full Role document
        .populate('tenant')
        .exec();

      // Exclude the password from the response
      const { password, ...userWithoutPassword } = populatedUser.toObject();

      // Modify the populated role to only include the tenant's ID
      if (userWithoutPassword.role && userWithoutPassword.role.tenant) {
        userWithoutPassword.role.tenant = (userWithoutPassword.role.tenant as any)._id || userWithoutPassword.role.tenant.toString();
      }

      return userWithoutPassword;

    } catch (error) {
      // Properly compare the error code
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      // Rethrow other errors for global handling
      throw error;
    }
  }

  async update(id: string, user: UpdateUserDtoNameAndRole) {
    try {
      const { role, tenant, name } = user;

      const tenantDocument = await this.tenantModel.findById(tenant).exec();
      if (!tenantDocument) {
        throw new NotFoundException(`Tenant with ID ${tenant} not found`);
      }

      const roleDocument = await this.roleModel.findOne({ name: role, tenant: tenant }).exec();
      if (!roleDocument) {
        throw new NotFoundException(`Role with name ${role} not found for tenant with ID ${tenant}`);
      }

      const userUpdate = await this.userModel.findByIdAndUpdate(
        id,
        { $set: { name, role: roleDocument._id} },
        { new: true }
      );
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return userUpdate;
      
    } catch (error) {
      throw error;
    }
  }



  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('role').exec();
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
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
    return this.userModel.findById(id).populate('role').exec();
  }



  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
