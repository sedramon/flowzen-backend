import { Module } from "@nestjs/common";
import { EmployeeSchema } from "./schema/employee.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { EmployeeService } from "./service/employees.service";
import { TenantsModule } from "../tenants/tenants.module";
import { EmployeesController } from "./controller/employees.controller";
import { WorkingShift, WorkingShiftSchema } from '../working-shifts/schemas/working-shift.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Employee', schema: EmployeeSchema },
            { name: WorkingShift.name, schema: WorkingShiftSchema }
        ]),
        TenantsModule
    ],
    controllers: [EmployeesController],
    providers: [EmployeeService],
    exports: [MongooseModule]
})
export class EmployeeModule{}