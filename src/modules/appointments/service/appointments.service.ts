import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentModel.create({
      ...createAppointmentDto,
      employeeId: new Types.ObjectId(createAppointmentDto.employeeId),
      tenantId: new Types.ObjectId(createAppointmentDto.tenantId),
    });
  }

  async findOne(id: string): Promise<Appointment> {
    return this.appointmentModel.findById(id).populate('employee').exec();
  }
  
  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().populate('employee').exec();
  }

  async findAllByTenant(tenantId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .populate('employee')
      .exec();
  }

  async findOneByTenant(id: string, tenantId: string): Promise<Appointment | null> {
    return this.appointmentModel
      .findOne({ _id: id, tenantId: new Types.ObjectId(tenantId) })
      .populate('employee')
      .exec();
  }
  
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const updateData: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.tenantId) {
      updateData.tenantId = new Types.ObjectId(updateAppointmentDto.tenantId);
    }
    if (updateAppointmentDto.employeeId) {
      updateData.employeeId = new Types.ObjectId(updateAppointmentDto.employeeId);
    }
    return this.appointmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('employee').exec();
  }

  async delete(id: string): Promise<void> {
    await this.appointmentModel.findByIdAndDelete(id).exec();
  }
}
