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

  // Virtual property for populated employee
  employee?: any;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Add this line to remove 'id' virtual
AppointmentSchema.set('id', false);

// Add virtual for employee
AppointmentSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true,
});

AppointmentSchema.set('toObject', { virtuals: true });
AppointmentSchema.set('toJSON', { virtuals: true });
