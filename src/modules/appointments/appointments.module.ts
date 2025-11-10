import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './controller/appointments.controller';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { WaitlistEntry, WaitlistEntrySchema } from './schemas/waitlist.schema';
import { AppointmentsService } from './service/appointments.service';
import { WaitlistService } from './service/waitlist.service';
import { AppointmentValidationService } from './service/appointment-validation.service';
import { ClientsModule } from '../clients/clients.module';
import { ServicesModule } from '../services/services.module';
import { EmployeeModule } from '../employees/employees.module';
import { TenantsModule } from '../tenants/tenants.module';
import { FacilityModule } from '../facility/facility.module';
import { Facility, FacilitySchema } from '../facility/schema/facility.schema';
import { WorkingShift, WorkingShiftSchema } from '../working-shifts/schemas/working-shift.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Appointment.name, schema: AppointmentSchema },
            { name: WaitlistEntry.name, schema: WaitlistEntrySchema },
            { name: Facility.name, schema: FacilitySchema },
            { name: WorkingShift.name, schema: WorkingShiftSchema }
        ]),
        ClientsModule,
        ServicesModule,
        EmployeeModule,
        TenantsModule,
        FacilityModule
    ],
    controllers: [AppointmentsController],
    providers: [AppointmentsService, WaitlistService, AppointmentValidationService],
    exports: [AppointmentsService, WaitlistService, AppointmentValidationService],
})
export class AppointmentsModule {}
