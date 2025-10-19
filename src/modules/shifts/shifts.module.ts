import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shift, ShiftSchema } from './schemas/shift.schema';
import { ShiftController } from './controller/shifts.controller';
import { ShiftService } from './service/shifts.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Shift.name, schema: ShiftSchema }])],
    providers: [ShiftService],
    controllers: [ShiftController],
    exports: [ShiftService]
})
export class ShiftModule {}
