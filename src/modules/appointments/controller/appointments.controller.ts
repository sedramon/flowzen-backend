import { Controller, Post, Body, Get, Param, Put, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';
import { AppointmentsService } from '../service/appointments.service';
import { JwtAuthGuard } from 'src/modules/auth/auth.guard';
import { ScopesGuard } from 'src/modules/auth/scopes.guard';
import { Scopes } from 'src/modules/auth/scopes.decorator';
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
    @InjectModel(Facility.name) private facilityModel: Model<Facility>
  ) {}

  @Scopes('scope_appoitments:create')
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Scopes('scope_appoitments:read')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ): Promise<Appointment> {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.appointmentsService.findOneByTenant(id, tenantId);
  }

  @Scopes('scope_appoitments:read')
  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('facilityId') facilityId?: string,
    @Query('date') date?: string
  ): Promise<Appointment[]> {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    
    return this.appointmentsService.findAllWithFilters(tenantId, facilityId, date);
  }

  @Scopes('scope_appoitments:update')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Scopes('scope_appoitments:delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.appointmentsService.delete(id);
    return { message: 'Appointment deleted successfully' };
  }
}
