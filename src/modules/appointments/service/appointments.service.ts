import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentModel.create({
      ...createAppointmentDto,
      employeeId: new Types.ObjectId(createAppointmentDto.employeeId)
    });
  }

  async findOne(id: string): Promise<Appointment> {
    return this.appointmentModel.findById(id).populate('employee').exec();
  }
  
  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().populate('employee').exec();
  }
  
  async update(id: string, updateAppointmentDto: Partial<CreateAppointmentDto>): Promise<Appointment> {
    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateAppointmentDto,
      { new: true }
    ).populate('employee').exec();
  }

  async delete(id: string): Promise<void> {
    await this.appointmentModel.findByIdAndDelete(id).exec();
  }
}
