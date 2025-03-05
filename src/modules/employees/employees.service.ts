import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Employee } from "./schema/employee.schema";
import { Model } from "mongoose";
import { CreateEmployeeDto } from "./dto/CreateEmployee.dto";


@Injectable()
export class EmployeeService {

    constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>){}

    async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        try{
            const employee = await this.employeeModel.create(createEmployeeDto);
            return employee;
        } catch(error) {
            throw error;
        }
    }

    async findAll(): Promise<Employee[]> {
        return this.employeeModel.find().exec();
    }

    async findOne(id: string): Promise<Employee> {
        return this.employeeModel.findById(id).exec();
    }
}