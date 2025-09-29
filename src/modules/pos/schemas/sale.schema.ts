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
export class Sale extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true })
  facility: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CashSession', required: true })
  session: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  cashier: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
  appointment?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client' })
  client?: string;

  @Prop({ type: String, required: true, unique: true })
  number: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: ['final', 'refunded', 'partial_refund'], default: 'final' })
  status: 'final' | 'refunded' | 'partial_refund';

  @Prop({
    type: [
      {
        refId: String,
        type: { type: String, enum: ['service', 'product'] },
        name: String,
        qty: Number,
        unitPrice: Number,
        discount: Number,
        taxRate: Number,
        total: Number,
      },
    ],
    default: [],
  })
  items: any[];

  @Prop({
    type: Object,
    default: { subtotal: 0, discountTotal: 0, taxTotal: 0, tip: 0, grandTotal: 0 },
  })
  summary: Record<string, number>;

  @Prop({
    type: [
      {
        method: { type: String, enum: ['cash', 'card', 'voucher', 'gift', 'bank', 'other'] },
        amount: Number,
        change: Number,
        externalRef: String,
      },
    ],
    default: [],
  })
  payments: any[];

  @Prop({
    type: Object,
    default: { status: 'pending', correlationId: '' },
  })
  fiscal: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sale' })
  refundFor?: string;

  @Prop({ type: String })
  note?: string;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
SaleSchema.plugin(require('mongoose-autopopulate'));
SaleSchema.index({ tenant: 1, facility: 1, date: -1 });
SaleSchema.index({ tenant: 1, number: 1 }, { unique: true });
SaleSchema.index({ session: 1 });
SaleSchema.index({ appointment: 1 });
SaleSchema.index({ client: 1 });
