import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './controller/appointments.controller';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AppointmentsService } from './service/appointments.service';
import { ClientsModule } from '../clients/clients.module';
import { ServicesModule } from '../services/services.module';
import { EmployeeModule } from '../employees/employees.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    ClientsModule,
    ServicesModule,
    EmployeeModule,
    TenantsModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
