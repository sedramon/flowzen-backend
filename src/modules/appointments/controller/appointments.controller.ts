import { Controller, Post, Body, Get, Param, Put, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { Appointment } from '../schemas/appointment.schema';
import { AppointmentsService } from '../service/appointments.service';
import { WaitlistService } from '../service/waitlist.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { Scopes } from 'src/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Facility } from 'src/modules/facility/schema/facility.schema';

@Controller('appointments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AppointmentsController {
    constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly waitlistService: WaitlistService,
    @InjectModel(Facility.name) private facilityModel: Model<Facility>
    ) {}

  @Scopes('scope_appointments:create')
  @Post()
    async create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        return this.appointmentsService.create(createAppointmentDto);
    }

  @Scopes('scope_appointments:create')
  @Post('bulk')
  async bulkCreate(
    @Body() body: { appointments: CreateAppointmentDto[] }
  ): Promise<Appointment[]> {
      return this.appointmentsService.bulkCreate(body.appointments || []);
  }

  @Scopes('scope_appointments:read')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('tenant') tenant: string
  ): Promise<Appointment> {
      if (!tenant) throw new BadRequestException('tenant is required');
      return this.appointmentsService.findOneByTenant(id, tenant);
  }

  @Scopes('scope_appointments:read')
  @Get()
  async findAll(
    @Query('tenant') tenant: string,
    @Query('facility') facility?: string,
    @Query('date') date?: string,
    @Query('client') clientId?: string
  ): Promise<Appointment[]> {
      if (!tenant) throw new BadRequestException('tenant is required');
    
      return this.appointmentsService.findAllWithFilters(tenant, facility, date, clientId);
  }

  @Scopes('scope_appointments:update')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ): Promise<Appointment> {
      return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Scopes('scope_appointments:delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.appointmentsService.delete(id);
      return { message: 'Appointment deleted successfully' };
  }

  // Waitlist endpoints
  @Scopes('scope_appointments:create')
  @Post('waitlist')
  async addToWaitlist(@Body() createWaitlistDto: CreateWaitlistDto) {
      return this.waitlistService.addToWaitlist(createWaitlistDto);
  }

  @Scopes('scope_appointments:read')
  @Get('waitlist/client/:clientId')
  async getClientWaitlist(
    @Param('clientId') clientId: string,
    @Query('tenant') tenant: string
  ) {
      if (!tenant) throw new BadRequestException('tenant is required');
      return this.waitlistService.getClientWaitlist(clientId, tenant);
  }

  @Scopes('scope_appointments:read')
  @Get('waitlist')
  async getAllWaitlist(
    @Query('tenant') tenant: string,
    @Query('facility') facility?: string
  ) {
      if (!tenant) throw new BadRequestException('tenant is required');
      return this.waitlistService.getAllWaitlistEntries(tenant, facility);
  }

  @Scopes('scope_appointments:delete')
  @Delete('waitlist/:id')
  async removeFromWaitlist(
    @Param('id') id: string,
    @Query('clientId') clientId: string,
    @Query('tenant') tenant: string
  ) {
      if (!clientId || !tenant) throw new BadRequestException('clientId and tenant are required');
      await this.waitlistService.removeFromWaitlist(id, clientId, tenant);
      return { message: 'Removed from waitlist successfully' };
  }

  @Scopes('scope_appointments:create')
  @Post('waitlist/notify')
  async notifyWaitlistForSlot(
    @Body() body: { employeeId: string; facilityId: string; date: string; startHour: number; endHour: number }
  ) {
      return this.waitlistService.notifyWaitlistForAvailableSlot(
          body.employeeId, 
          body.facilityId, 
          body.date, 
          body.startHour, 
          body.endHour
      );
  }

  @Scopes('scope_appointments:create')
  @Post('waitlist/claim')
  async claimAppointmentFromWaitlist(
    @Body() body: { claimToken: string; clientId: string }
  ) {
      return this.waitlistService.claimAppointmentFromWaitlist(body.claimToken, body.clientId);
  }
}
