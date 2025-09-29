import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
})
export class CashSession extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true, autopopulate: { select: 'name' } })
  tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true, autopopulate: { select: 'name' } })
  facility: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true, autopopulate: { select: 'firstName lastName' } })
  openedBy: string;

  @Prop({ type: Date, required: true })
  openedAt: Date;

  @Prop({ type: Number, required: true, min: 0 })
  openingFloat: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', autopopulate: { select: 'firstName lastName' } })
  closedBy?: string;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: Number, min: 0 })
  closingCount?: number;

  @Prop({
    type: Object,
    default: { cash: 0, card: 0, voucher: 0, gift: 0, bank: 0, other: 0 },
  })
  totalsByMethod: Record<string, number>;

  @Prop({ type: Number, default: 0 })
  expectedCash: number;

  @Prop({ type: Number, default: 0 })
  variance: number;

  @Prop({ type: String, enum: ['open', 'closed'], default: 'open' })
  status: 'open' | 'closed';

  @Prop({ type: String })
  note?: string;
}

export const CashSessionSchema = SchemaFactory.createForClass(CashSession);
CashSessionSchema.plugin(require('mongoose-autopopulate'));
CashSessionSchema.index({ tenant: 1, facility: 1, status: 1, openedAt: -1 });
