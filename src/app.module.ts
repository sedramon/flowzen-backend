import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { envSchema } from './config/env.schema';
import { LoggerModule } from 'nestjs-pino';
import { ArticlesModule } from './modules/articles/articles.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PosModule } from './modules/pos/pos.module';
import { CommonModule } from './common/common.module';
import { RequestIdMiddleware, CsrfMiddleware } from './common/middleware';
import { AuditModule } from './modules/audit/audit.module';
import { AdminSetupModule } from './modules/admin-setup/admin-setup.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
    imports: [
        CommonModule,
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
        SuppliersModule,
        ArticlesModule,
        SettingsModule,
        PosModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: envSchema
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                level: process.env.LOG_LEVEL || 'info',
                // in dev, run logs through pino-pretty
                transport:
          process.env.NODE_ENV !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                  },
              }
              : undefined,
                serializers: {
                    req: (req) => ({
                        id: (req as any).id,
                        method: req.method,
                        url: req.url,
                        params: req.params,
                        query: req.query,
                        headers: {
                            'x-request-id': req.headers['x-request-id'] as string,
                            host: req.headers['host'] as string,
                        },
                        remoteAddress: (req as any).remoteAddress,
                        remotePort: (req as any).remotePort,
                    }),
                    res: (res) => ({ statusCode: res.statusCode }),
                    err: (err) => ({ message: err.message, stack: err.stack }),
                },
            },
        }),
        AuditModule,
        AdminSetupModule,
        AdminModule
    ],
    controllers: [AppController, HealthController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestIdMiddleware)
            .forRoutes('*'); // Apply to all routes

        consumer
            .apply(CsrfMiddleware)
            .forRoutes('*'); // Apply CSRF middleware to all routes
    }
}
