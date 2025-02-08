import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';
import { AppointmentsService } from '../service/appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Get()
  async findAll(): Promise<Appointment[]> {
    return this.appointmentsService.findAll();
  }
}
