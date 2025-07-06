import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, UseGuards, Patch } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/CreateUser.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { UpdateUserDtoNameAndRole } from '../dto/UpdateUser.dto';
import { UsersService } from '../service/users.service';
import { Scopes } from 'src/modules/auth/scopes.decorator';
import { ScopesGuard } from 'src/modules/auth/scopes.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  getProfile() {
    return { message: 'This is a protected route', success: true };
  }

  @Scopes('scope_user_administration:create')
  @Post()
  // Ako hocemo validaciju po api endpointu
  //  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Scopes('scope_user_administration:read')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Scopes('scope_user_administration:read')
  @Get('tenant/:tenantId')
  async findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.usersService.findAllByTenant(tenantId);
  }

  @Scopes('scope_user_administration:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new HttpException('User not found', 400);
    const foundUser = await this.usersService.findOne(id);
    if (!foundUser) throw new HttpException('User not found', 404);
    return foundUser;
  }

  @Scopes('scope_user_administration:update')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDtoNameAndRole) : Promise<User> {
   return await this.usersService.update(id, updateUserDto);
  }

  @Scopes('scope_user_administration:delete')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedUser = await this.usersService.delete(id);
    return deletedUser;
  }
}
