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
export class FiscalLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
      tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sale', required: true })
      sale: string;

  @Prop({ type: String, required: true })
      correlationId: string;

  @Prop({ type: String, enum: ['pending', 'success', 'error', 'retry'], required: true })
      status: 'pending' | 'success' | 'error' | 'retry';

  @Prop({ type: String })
      fiscalNumber?: string;

  @Prop({ type: String })
      error?: string;

  @Prop({ type: Object })
      requestPayload?: any;

  @Prop({ type: Object })
      responsePayload?: any;

  @Prop({ type: String, enum: ['none', 'device', 'cloud'] })
      provider: 'none' | 'device' | 'cloud';

  @Prop({ type: Number, default: 0 })
      retryCount: number;

  @Prop({ type: Date })
      processedAt?: Date;
}

export const FiscalLogSchema = SchemaFactory.createForClass(FiscalLog);
FiscalLogSchema.plugin(require('mongoose-autopopulate'));
FiscalLogSchema.index({ tenant: 1, createdAt: -1 });
FiscalLogSchema.index({ sale: 1 });
FiscalLogSchema.index({ correlationId: 1 });
FiscalLogSchema.index({ status: 1 });
