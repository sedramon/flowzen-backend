import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkingShiftService } from './service/working-shift.service';
import { WorkingShiftsController } from './controller/working-shifts.controller';
import { WorkingShift, WorkingShiftSchema } from './schemas/working-shift.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WorkingShift.name, schema: WorkingShiftSchema }
        ])
    ],
    controllers: [WorkingShiftsController],
    providers: [WorkingShiftService]
})
export class WorkingShiftsModule {}
