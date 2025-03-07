import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Employee } from "./schema/employee.schema";
import { isValidObjectId, Model } from "mongoose";
import { CreateEmployeeDto } from "./dto/CreateEmployee.dto";
import { Tenant } from "../tenants/schemas/tenant.schema";


@Injectable()
export class EmployeeService {

    constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>, @InjectModel(Tenant.name) private tenantModel: Model<Tenant>) { }

    async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        try {
            const { tenant, ...employeeDetails } = createEmployeeDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }


            const employee = await this.employeeModel.create(createEmployeeDto);
            
            return employee;
        } catch (error) {
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