import { Module } from "@nestjs/common";
import { EmployeeSchema } from "./schema/employee.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { EmployeeService } from "./employees.service";
import { EmployeesController } from "./employees.controller";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Employee', schema: EmployeeSchema}]), TenantsModule],
    controllers: [EmployeesController],
    providers: [EmployeeService],
    exports: []
})
export class EmployeeModule{}