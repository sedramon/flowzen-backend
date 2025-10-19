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
            employee: toObjectId(createDto.employee),
            tenant: toObjectId(createDto.tenant),
            facility: toObjectId(createDto.facility),
        });
    }

    async findAll(filter: any = {}) {
        const query: any = { ...filter };
        if (query.employee) {
            query.employee = toObjectId(query.employee);
        }
        if (query.tenant) {
            query.tenant = toObjectId(query.tenant);
        }
        if (query.facility) {
            query.facility = toObjectId(query.facility);
        }
        return this.workingShiftModel.find(query).exec();
    }

    async findOne(id: string) {
        return this.workingShiftModel.findById(toObjectId(id)).exec();
    }

    async update(id: string, updateDto: UpdateWorkingShiftDto) {
        const dto: any = { ...updateDto };
        if (dto.employee) {
            dto.employee = toObjectId(dto.employee);
        }
        if (dto.tenant) {
            dto.tenant = toObjectId(dto.tenant);
        }
        if (dto.facility) {
            dto.facility = toObjectId(dto.facility);
        }
        return this.workingShiftModel.findByIdAndUpdate(toObjectId(id), dto, { new: true }).exec();
    }

    async remove(id: string) {
        return this.workingShiftModel.findByIdAndDelete(toObjectId(id)).exec();
    }

    async upsertShift(dto: CreateWorkingShiftDto) {
        return this.workingShiftModel.findOneAndUpdate(
            {
                employee: toObjectId(dto.employee),
                date: dto.date,
                tenant: toObjectId(dto.tenant),
                facility: toObjectId(dto.facility)
            },
            {
                ...dto,
                employee: toObjectId(dto.employee),
                tenant: toObjectId(dto.tenant),
                facility: toObjectId(dto.facility)
            },
            { upsert: true, new: true }
        ).exec();
    }

    async removeByEmployeeDate(employee: string, date: string, tenant: string, facility: string) {
        return this.workingShiftModel.deleteOne({
            employee: toObjectId(employee),
            date,
            tenant: toObjectId(tenant),
            facility: toObjectId(facility)
        }).exec();
    }

    async findForEmployeeMonth(employee: string, tenant: string, facility: string, month: number, year: number) {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const yearStr = year.toString();
        const dateRegex = new RegExp(`^${yearStr}-${monthStr}-\\d{2}$`);
        return this.workingShiftModel.find({
            employee: toObjectId(employee),
            tenant: toObjectId(tenant),
            facility: toObjectId(facility),
            date: { $regex: dateRegex }
        }).exec();
    }
}
