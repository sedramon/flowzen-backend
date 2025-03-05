import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { EmployeeService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/CreateEmployee.dto";
import { Employee } from "./schema/employee.schema";

@Controller('employees')
export class EmployeesController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Post()
    async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return await this.employeeService.create(createEmployeeDto);
    }

    @Get()
    async findAll(): Promise<Employee[]> {
        return await this.employeeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Employee> {
        return await this.employeeService.findOne(id);
    }
}