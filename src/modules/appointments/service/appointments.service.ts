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
    return this.appointmentModel.findById(id).populate('employeeId').exec();
  }
  
  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().populate('employeeId').exec();
  }
  
}
