import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CashSession, CashSessionSchema } from './schemas/cash-session.schema';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { InventoryMovement, InventoryMovementSchema } from './schemas/inventory-movement.schema';
import { FiscalLog, FiscalLogSchema } from './schemas/fiscal-log.schema';
import { PosSettings, PosSettingsSchema } from './schemas/pos-settings.schema';
import { CashSessionService } from './service/cash-session.service';
import { SalesService } from './service/sales.service';
import { ReportsService } from './service/reports.service';
import { SettingsService } from './service/settings.service';
import { FiscalizationService } from './service/fiscalization.service';
import { CashSessionController } from './controller/cash-session.controller';
import { SalesController } from './controller/sales.controller';
import { ReportsController } from './controller/reports.controller';
import { SettingsController } from './controller/settings.controller';
import { ArticlesModule } from '../articles/articles.module';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Facility, FacilitySchema } from '../facility/schema/facility.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashSession.name, schema: CashSessionSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
      { name: FiscalLog.name, schema: FiscalLogSchema },
      { name: PosSettings.name, schema: PosSettingsSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Facility.name, schema: FacilitySchema },
    ]),
    ArticlesModule,
  ],
  controllers: [
    CashSessionController,
    SalesController,
    ReportsController,
    SettingsController,
  ],
  providers: [
    CashSessionService,
    SalesService,
    ReportsService,
    SettingsService,
    FiscalizationService,
  ],
  exports: [],
})
export class PosModule {}
