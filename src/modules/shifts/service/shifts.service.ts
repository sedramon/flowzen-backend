import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from '../schemas/shift.schema';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) {}

  async create(dto: CreateShiftDto) {
    return this.shiftModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
    });
  }

  async findAll(tenantId: string) {
    return this.shiftModel.find({ tenantId: new Types.ObjectId(tenantId) }).exec();
  }

  async findOne(id: string) {
    return this.shiftModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateShiftDto) {
    const updateData = { ...dto } as any;
    if (updateData.tenantId) {
      updateData.tenantId = new Types.ObjectId(updateData.tenantId);
    }
    return this.shiftModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string) {
    return this.shiftModel.findByIdAndDelete(id).exec();
  }
}
