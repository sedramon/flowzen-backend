import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkingShift, WorkingShiftDocument } from '../schemas/working-shift.schema';
import { CreateWorkingShiftDto } from '../dto/create-working-shift.dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from '../dto/update-working-shift.dto/update-working-shift.dto';

@Injectable()
export class WorkingShiftService {
  constructor(
    @InjectModel(WorkingShift.name) private workingShiftModel: Model<WorkingShiftDocument>,
  ) {}

  async create(createDto: CreateWorkingShiftDto) {
    return this.workingShiftModel.create(createDto);
  }

  async findAll(filter: any = {}) {
    return this.workingShiftModel.find(filter).exec();
  }

  async findOne(id: string) {
    return this.workingShiftModel.findById(id).exec();
  }

  async update(id: string, updateDto: UpdateWorkingShiftDto) {
    return this.workingShiftModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.workingShiftModel.findByIdAndDelete(id).exec();
  }

  async upsertShift(dto: CreateWorkingShiftDto) {
    return this.workingShiftModel.findOneAndUpdate(
      {
        employeeId: dto.employeeId,
        date: dto.date,
        tenantId: dto.tenantId
      },
      dto,
      { upsert: true, new: true }
    ).exec();
  }

  async removeByEmployeeDate(employeeId: string, date: string, tenantId: string) {
    return this.workingShiftModel.findOneAndDelete({
      employeeId,
      date,
      tenantId
    }).exec();
  }

  async findForEmployeeMonth(employeeId: string, tenantId: string, month: number, year: number) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const yearStr = year.toString();
    const dateRegex = new RegExp(`^${yearStr}-${monthStr}-\\d{2}$`);
    return this.workingShiftModel.find({
      employeeId,
      tenantId,
      date: { $regex: dateRegex }
    }).exec();
  }
}
