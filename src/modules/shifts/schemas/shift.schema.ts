import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Shift {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ type: String, enum: ['morning', 'afternoon', 'evening', 'full', 'custom'], required: true })
  value: string; // enum

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  color: string;

  @Prop()
  startHour?: number; // broj

  @Prop()
  endHour?: number; // broj
}

export type ShiftDocument = Shift & Document;
export const ShiftSchema = SchemaFactory.createForClass(Shift);