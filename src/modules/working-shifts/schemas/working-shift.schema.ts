import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkingShiftDocument = WorkingShift & Document;

@Schema({ timestamps: true })
export class WorkingShift {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, required: true }) // ISO string: '2025-06-10'
  date: string;

  @Prop({ type: String, enum: ['morning', 'afternoon', 'evening', 'full', 'custom'], required: true })
  shiftType: string;

  @Prop({ type: Number, min: 0, max: 24 })
  startHour?: number;

  @Prop({ type: Number, min: 0, max: 24 })
  endHour?: number;

  @Prop({ type: String })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
}

export const WorkingShiftSchema = SchemaFactory.createForClass(WorkingShift);
