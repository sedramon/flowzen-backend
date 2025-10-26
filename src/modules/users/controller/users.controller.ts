import { Controller, Get, Post, Body, Param, Put, Delete, HttpException, UseGuards, Patch, Query, Req, Res } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/CreateUser.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { UpdateUserDtoNameAndRole } from '../dto/UpdateUser.dto';
import { UsersService } from '../service/users.service';
import { Scopes } from 'src/common/decorators';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class UsersController {
    constructor(
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: Connection,
    ) { }

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

  @Scopes('scope_admin_panel:read')
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

  @Post('create-test-pos-user')
  async createTestPosUser(@Query('secret') secret: string, @Res() res) {
      try {
          if (secret !== 'flowzen-setup-2025') {
              return res.status(403).json({ error: 'Forbidden' });
          }
          const result: any = {};
          // 0. Tenant - ensure active and has license
          let tenantDoc = await this.connection.collection('tenants').findOne({ name: 'Test Tenant' });
          if (!tenantDoc) {
              const insert = await this.connection.collection('tenants').insertOne({
                  name: 'Test Tenant',
                  companyType: 'd.o.o.',
                  street: 'Test St 1',
                  city: 'Test City',
                  country: 'RS',
                  contactEmail: 'test@flowzen.com',
                  contactPhone: '123456',
                  MIB: '12345678',
                  PIB: '87654321',
                  hasActiveLicense: true,
                  licenseStartDate: new Date(),
                  licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              });
              tenantDoc = await this.connection.collection('tenants').findOne({ _id: insert.insertedId });
              result.tenant = 'created';
          } else {
              await this.connection.collection('tenants').updateOne(
                  { _id: tenantDoc._id },
                  { $set: { hasActiveLicense: true, licenseStartDate: new Date(), licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } }
              );
              result.tenant = 'exists+active';
          }
          const tenantId = tenantDoc._id;

          // 1. Facility - ensure active and correct tenant
          let facilityDoc = await this.connection.collection('facilities').findOne({ name: 'Test Facility', tenant: tenantId });
          if (!facilityDoc) {
              const insert = await this.connection.collection('facilities').insertOne({
                  name: 'Test Facility',
                  tenant: tenantId,
                  address: 'Test Address',
                  city: 'Test City',
                  country: 'RS',
                  phone: '123456',
                  email: 'test-facility@flowzen.com',
                  active: true,
              });
              facilityDoc = await this.connection.collection('facilities').findOne({ _id: insert.insertedId });
              result.facility = 'created';
          } else {
              await this.connection.collection('facilities').updateOne(
                  { _id: facilityDoc._id },
                  { $set: { tenant: tenantId, active: true } }
              );
              result.facility = 'exists+active';
          }
          result.facilityId = facilityDoc._id;

          // 2. SVI scope-ovi
          const allScopes = await this.connection.collection('scopes').find({}).toArray();
          const allScopeIds = allScopes.map(s => s._id);
          result.scopes = `total: ${allScopeIds.length}`;

          // 3. Rola - vezana za tenant i sve scope-ove
          let roleDoc = await this.connection.collection('roles').findOne({ name: 'pos-test-admin', tenant: tenantId });
          if (!roleDoc) {
              const insert = await this.connection.collection('roles').insertOne({
                  name: 'pos-test-admin',
                  availableScopes: allScopeIds,
                  tenant: tenantId,
              });
              roleDoc = await this.connection.collection('roles').findOne({ _id: insert.insertedId });
              result.role = 'created';
          } else {
              await this.connection.collection('roles').updateOne(
                  { _id: roleDoc._id },
                  { $set: { availableScopes: allScopeIds, tenant: tenantId } }
              );
              result.role = 'exists+active';
          }
          const roleId = roleDoc._id;

          // 4. User - vezan za tenant i rolu, aktivan
          const userDoc = await this.connection.collection('users').findOne({ email: 'test@flowzen.com' });
          if (!userDoc) {
              const passwordHash = await bcrypt.hash('test123', 10);
              await this.connection.collection('users').insertOne({
                  name: 'Test User',
                  email: 'test@flowzen.com',
                  password: passwordHash,
                  role: roleId,
                  tenant: tenantId,
                  active: true,
              });
              result.user = 'created';
          } else {
              await this.connection.collection('users').updateOne(
                  { _id: userDoc._id },
                  { $set: { role: roleId, tenant: tenantId, active: true } }
              );
              result.user = 'exists+active';
          }
          result.message = 'SVE JE POVEZANO I AKTIVNO ZA E2E TESTOVE';
          return res.json(result);
      } catch (err) {
          return res.status(500).json({ error: 'Internal server error', details: err.message });
      }
  }
}
