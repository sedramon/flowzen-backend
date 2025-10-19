import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { Shift, ShiftDocument } from '../schemas/shift.schema';

@Injectable()
export class ShiftService {
    constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    ) {}

    async create(dto: CreateShiftDto) {
        return this.shiftModel.create({
            ...dto,
            tenant: new Types.ObjectId(dto.tenant),
            facility: new Types.ObjectId(dto.facility)
        });
    }

    async findAll(tenant: string, facility?: string) {
        const filter: any = { tenant: new Types.ObjectId(tenant) };
        if (facility) {
            filter.facility = new Types.ObjectId(facility);
        }
        return this.shiftModel.find(filter).exec();
    }

    async findOne(id: string) {
        return this.shiftModel.findById(id).exec();
    }

    async update(id: string, dto: UpdateShiftDto) {
        const updateData = { ...dto } as any;
        if (updateData.tenant) {
            updateData.tenant = new Types.ObjectId(updateData.tenant);
        }
        if (updateData.facility) {
            updateData.facility = new Types.ObjectId(updateData.facility);
        }
        return this.shiftModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async remove(id: string) {
        return this.shiftModel.findByIdAndDelete(id).exec();
    }
}
