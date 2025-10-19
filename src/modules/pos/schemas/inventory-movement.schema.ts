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
export class InventoryMovement extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
      tenant: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true })
      facility: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Sale' })
      sale?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
      employee: string;

  @Prop({ type: String, required: true })
      articleId: string;

  @Prop({ type: String, required: true })
      articleName: string;

  @Prop({ type: Number, required: true })
      quantity: number;

  @Prop({ type: String, enum: ['sale', 'refund', 'adjustment', 'return'], required: true })
      type: 'sale' | 'refund' | 'adjustment' | 'return';

  @Prop({ type: String, required: true })
      reason: string;

  @Prop({ type: String })
      note?: string;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
InventoryMovementSchema.plugin(require('mongoose-autopopulate'));
InventoryMovementSchema.index({ tenant: 1, facility: 1, createdAt: -1 });
InventoryMovementSchema.index({ articleId: 1 });
InventoryMovementSchema.index({ sale: 1 });
