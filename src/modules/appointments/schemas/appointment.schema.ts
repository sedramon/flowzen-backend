import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  startHour: number;

  @Prop({ required: true })
  endHour: number;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  date: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
