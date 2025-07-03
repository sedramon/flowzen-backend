import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkingShift, WorkingShiftDocument } from '../schemas/working-shift.schema';
import { CreateWorkingShiftDto } from '../dto/create-working-shift.dto/create-working-shift.dto';
import { UpdateWorkingShiftDto } from '../dto/update-working-shift.dto/update-working-shift.dto';

function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (id instanceof Types.ObjectId) return id;
  return Types.ObjectId.createFromHexString(id);
}

@Injectable()
export class WorkingShiftService {
  constructor(
    @InjectModel(WorkingShift.name) private workingShiftModel: Model<WorkingShiftDocument>,
  ) {}

  async create(createDto: CreateWorkingShiftDto) {
    return this.workingShiftModel.create({
      ...createDto,
      employeeId: toObjectId(createDto.employeeId),
      tenantId: toObjectId(createDto.tenantId),
    });
  }

  async findAll(filter: any = {}) {
    const query: any = { ...filter };
    if (query.employeeId) {
      query.employeeId = toObjectId(query.employeeId);
    }
    if (query.tenantId) {
      query.tenantId = toObjectId(query.tenantId);
    }
    return this.workingShiftModel.find(query).exec();
  }

  async findOne(id: string) {
    return this.workingShiftModel.findById(toObjectId(id)).exec();
  }

  async update(id: string, updateDto: UpdateWorkingShiftDto) {
    const dto: any = { ...updateDto };
    if (dto.employeeId) {
      dto.employeeId = toObjectId(dto.employeeId);
    }
    if (dto.tenantId) {
      dto.tenantId = toObjectId(dto.tenantId);
    }
    return this.workingShiftModel.findByIdAndUpdate(toObjectId(id), dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.workingShiftModel.findByIdAndDelete(toObjectId(id)).exec();
  }

  async upsertShift(dto: CreateWorkingShiftDto) {
    return this.workingShiftModel.findOneAndUpdate(
      {
        employeeId: toObjectId(dto.employeeId),
        date: dto.date,
        tenantId: toObjectId(dto.tenantId)
      },
      {
        ...dto,
        employeeId: toObjectId(dto.employeeId),
        tenantId: toObjectId(dto.tenantId)
      },
      { upsert: true, new: true }
    ).exec();
  }

  async removeByEmployeeDate(employeeId: string, date: string, tenantId: string) {
    return this.workingShiftModel.findOneAndDelete({
      employeeId: toObjectId(employeeId),
      date,
      tenantId: toObjectId(tenantId)
    }).exec();
  }

  async findForEmployeeMonth(employeeId: string, tenantId: string, month: number, year: number) {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const yearStr = year.toString();
    const dateRegex = new RegExp(`^${yearStr}-${monthStr}-\\d{2}$`);
    return this.workingShiftModel.find({
      employeeId: toObjectId(employeeId),
      tenantId: toObjectId(tenantId),
      date: { $regex: dateRegex }
    }).exec();
  }
}
