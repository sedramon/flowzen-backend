import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScopeModule } from './modules/scopes/scope.module';
import { RolesModule } from './modules/roles/role.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ServicesModule } from './modules/services/services.module';
import { EmployeeModule } from './modules/employees/employees.module';
import { ClientsModule } from './modules/clients/clients.module';
import { FacilityModule } from './modules/facility/facility.module';
import { ConfigModule } from '@nestjs/config';
import { ShiftModule } from './modules/shifts/shifts.module';
import { WorkingShiftsModule } from './modules/working-shifts/working-shifts.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    ScopeModule,
    RolesModule,
    TenantsModule,
    AppointmentsModule,
    ServicesModule,
    EmployeeModule,
    ClientsModule,
    FacilityModule,
    WorkingShiftsModule,
    ShiftModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    })
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
