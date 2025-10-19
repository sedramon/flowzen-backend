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
export class PosSettings extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
      tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true })
      facility: string;

  @Prop({
      type: Object,
      default: {
          cash: { enabled: true, label: 'Gotovina' },
          card: { enabled: true, label: 'Kartica' },
          voucher: { enabled: false, label: 'Voucher' },
          gift: { enabled: false, label: 'Poklon bon' },
          bank: { enabled: false, label: 'Bankovni transfer' },
          other: { enabled: false, label: 'Ostalo' },
      },
  })
      paymentMethods: Record<string, any>;

  @Prop({ type: Number, default: 20 })
      defaultTaxRate: number;

  @Prop({ type: Number, default: 0 })
      maxDiscountPercent: number;

  @Prop({ type: Boolean, default: false })
      allowNegativePrice: boolean;

  @Prop({ type: String, default: 'FAC-YYYYMMDD-####' })
      receiptNumberFormat: string;

  @Prop({
      type: Object,
      default: {
          enabled: false,
          provider: 'none',
          timeout: 5000,
          retryCount: 3,
      },
  })
      fiscalization: Record<string, any>;

  @Prop({
      type: Object,
      default: {
          header: '',
          footer: '',
          showQR: false,
          showFiscalNumber: true,
      },
  })
      receiptTemplate: Record<string, any>;
}

export const PosSettingsSchema = SchemaFactory.createForClass(PosSettings);
PosSettingsSchema.plugin(require('mongoose-autopopulate'));
PosSettingsSchema.index({ tenant: 1, facility: 1 }, { unique: true });
