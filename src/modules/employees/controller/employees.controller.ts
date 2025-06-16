import { Body, Controller, Get, Param, Post, Put, UseInterceptors, UploadedFile, Query, Delete } from "@nestjs/common";

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { CreateEmployeeDto } from "../dto/CreateEmployee.dto";
import { Employee } from "../schema/employee.schema";
import { EmployeeService } from "../service/employees.service";

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Post()
    async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return await this.employeeService.create(createEmployeeDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return await this.employeeService.update(id, createEmployeeDto);
    }

    @Get()
    async findAll(@Query('tenant') tenantId?: string): Promise<Employee[]> {
        return await this.employeeService.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Employee> {
        return await this.employeeService.findOne(id);
    }

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