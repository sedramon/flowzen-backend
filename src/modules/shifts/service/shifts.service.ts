import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftDocument } from '../schemas/shift.schema';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) {}

  async create(dto: CreateShiftDto) {
    return this.shiftModel.create(dto);
  }

  async findAll(tenantId: string) {
    return this.shiftModel.find({ tenantId }).exec();
  }

  async findOne(id: string) {
    return this.shiftModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateShiftDto) {
    return this.shiftModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.shiftModel.findByIdAndDelete(id).exec();
  }
}
