import { Body, Controller, Get, Param, Post, Put, UseInterceptors, UploadedFile, Query, Delete, UseGuards } from "@nestjs/common";

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { CreateEmployeeDto } from "../dto/CreateEmployee.dto";
import { UpdateEmployeeDto } from "../dto/UpdateEmployee.dto";
import { Employee } from "../schema/employee.schema";
import { EmployeeService } from "../service/employees.service";
import { InjectModel } from "@nestjs/mongoose";
import { WorkingShift } from "src/modules/working-shifts/schemas/working-shift.schema";
import { Model, Types } from "mongoose";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { Scopes } from "src/common/decorators";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('employees')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class EmployeesController {
    constructor(
      private readonly employeeService: EmployeeService, 
      @InjectModel(WorkingShift.name) private workingShiftModel: Model<WorkingShift>
    ) {}

    @Scopes('scope_employees:create')
    @Post()
    async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return await this.employeeService.create(createEmployeeDto);
    }

    @Scopes('scope_employees:update')
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        return await this.employeeService.update(id, updateEmployeeDto);
    }

    @Scopes('scope_employees:read')
    @Get('with-working-shift')
    async getEmployeesWithWorkingShift(
      @Query('tenant') tenant: string,
      @Query('date') date: string,
      @Query('facility') facility: string
    ) {
        const employees = await this.employeeService.findAll(tenant, facility).then(list =>
            list.map(e => (e.toObject ? e.toObject() : e))
        );

        const results = await Promise.all(
            employees.map(async emp => {
                const wsQuery: any = {
                    employee: Types.ObjectId.createFromHexString(emp._id.toString()),
                    tenant: Types.ObjectId.createFromHexString(tenant.toString()),
                    facility: Types.ObjectId.createFromHexString(facility),
                    date
                };

                const ws = await this.workingShiftModel.findOne(wsQuery).lean();
                return {
                    ...emp,
                    workingShift: ws
                        ? {
                            date: ws.date,
                            shiftType: ws.shiftType,
                            startHour: ws.startHour,
                            endHour: ws.endHour,
                            note: ws.note
                        }
                        : null
                };
            })
        );

        return results;
    }

    @Scopes('scope_employees:read')
    @Get()
    async findAll(
        @Query('tenant') tenantId?: string,
        @Query('facility') facilityId?: string
    ): Promise<Employee[]> {
        return await this.employeeService.findAll(tenantId, facilityId);
    }

    @Scopes('scope_employees:read')
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Employee> {
        return await this.employeeService.findOne(id);
    }

    @Scopes('scope_employees:update')
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    cb(null, uuidv4() + ext);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(new Error('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    uploadAvatar(@UploadedFile() file: Express.Multer.File) {
        return { url: `/uploads/avatars/${file.filename}` };
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return await this.employeeService.delete(id);
    }
}