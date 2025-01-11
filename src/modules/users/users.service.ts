/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...userDetails } = createUserDto;

      const roleDocument = await this.roleModel.findOne({ name: role }).exec();
      if (!roleDocument) {
        throw new ConflictException('Role not found');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...userDetails,
        password: hashedPassword,
        role: roleDocument._id // Map the role to its ObjectId
      });

      const savedUser = await newUser.save();
      // Populate the role field and exclude the password
      const populatedUser = await this.userModel
        .findById(savedUser._id)
        .populate('role') // Populate the role field with the full Role document
        .exec();

      // Exclude the password from the response
      const { password, ...userWithoutPassword } = populatedUser.toObject();
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


  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('role').exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }
  
  async findOne(id: string | Types.ObjectId): Promise<User | null> {
    return this.userModel.findById(id).populate('role').exec();
  }
  

  async update(id: string, user: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
