import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';
import { AppointmentsService } from '../service/appointments.service';
import { JwtAuthGuard } from 'src/modules/auth/auth.guard';
import { ScopesGuard } from 'src/modules/auth/scopes.guard';
import { Scopes } from 'src/modules/auth/scopes.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Scopes('scope_appoitments:create')
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Scopes('scope_appoitments:read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Scopes('scope_appoitments:read')
  @Get()
  async findAll(): Promise<Appointment[]> {
    return this.appointmentsService.findAll();
  }

  @Scopes('scope_appoitments:update')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: Partial<CreateAppointmentDto>
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
