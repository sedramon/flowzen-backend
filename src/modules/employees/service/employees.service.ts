import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Employee } from "../schema/employee.schema";
import { isValidObjectId, Model } from "mongoose";
import { CreateEmployeeDto } from "../dto/CreateEmployee.dto";
import { UpdateEmployeeDto } from "../dto/UpdateEmployee.dto";
import { Tenant } from "../../tenants/schemas/tenant.schema";

@Injectable()
export class EmployeeService {

    constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>, @InjectModel(Tenant.name) private tenantModel: Model<Tenant>) { }

    async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        try {
            const { tenant, facilities, ...employeeDetails } = createEmployeeDto;

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            // Check if tenant exists
            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            // Validate facilities array
            const facilitiesArray = facilities || [];
            if (facilitiesArray.length > 0) {
                for (const facilityId of facilitiesArray) {
                    if (!isValidObjectId(facilityId)) {
                        throw new BadRequestException(`Invalid facility ID: ${facilityId}`);
                    }
                }
            }

            const employeeData = {
                ...employeeDetails,
                tenant,
                facilities: facilitiesArray
            };

            const employee = await this.employeeModel.create(employeeData);
            
            return employee;
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        try {
            // Handle tenant object from autopopulate
            let tenantId = updateEmployeeDto.tenant;
            if (typeof updateEmployeeDto.tenant === 'object' && updateEmployeeDto.tenant !== null) {
                tenantId = (updateEmployeeDto.tenant as any)._id || (updateEmployeeDto.tenant as any).id;
            }

            // Handle facilities array
            const facilitiesArray = updateEmployeeDto.facilities || [];
            if (facilitiesArray.length > 0) {
                for (const facilityId of facilitiesArray) {
                    if (!isValidObjectId(facilityId)) {
                        throw new BadRequestException(`Invalid facility ID: ${facilityId}`);
                    }
                }
            }

            const updateData = {
                ...updateEmployeeDto,
                tenant: tenantId,
                facilities: facilitiesArray
            };

            if (tenantId && !isValidObjectId(tenantId)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
            }

            if (tenantId) {
                // Check if tenant exists
                const tenantDocument = await this.tenantModel.findById(tenantId).exec();
                if (!tenantDocument) {
                    throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
                }
            }

            return await this.employeeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        } catch (error) {
            throw error;
        }
    }

    async findAll(tenantId: string, facilityId?: string): Promise<Employee[]> {
        if (!isValidObjectId(tenantId)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenantId}`);
        }
        
        const filter: any = { tenant: tenantId };
        
        if (facilityId) {
            if (!isValidObjectId(facilityId)) {
                throw new BadRequestException(`Invalid facility ID: ${facilityId}`);
            }
            // Filter employees who work in the specified facility
            filter.facilities = facilityId;
        }
        
        return this.employeeModel.find(filter).exec();
    }

    async findOne(id: string): Promise<Employee> {
        return this.employeeModel.findById(id).exec();
    }

    async delete(id: string): Promise<void> {
        await this.employeeModel.findByIdAndDelete(id).exec();
    }
}