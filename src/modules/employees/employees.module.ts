import { Module } from "@nestjs/common";
import { EmployeeSchema } from "./schema/employee.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { EmployeeService } from "./service/employees.service";
import { TenantsModule } from "../tenants/tenants.module";
import { EmployeesController } from "./controller/employees.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Employee', schema: EmployeeSchema}]), TenantsModule],
    controllers: [EmployeesController],
    providers: [EmployeeService],
    exports: []
})
export class EmployeeModule{}