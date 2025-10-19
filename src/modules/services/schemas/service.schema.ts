import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema  } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true })
      name: string;

  @Prop({ required: true })
      price: number;

  @Prop({ required: true })
      durationMinutes: number;

  @Prop({ required: true, default: true })
      isActive: boolean;

  @Prop()
      discountPrice?: number;

  @Prop()
      description?: string;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      autopopulate: { select: 'name' }
  })
      tenant: Tenant;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Apply mongoose-autopopulate plugin
ServiceSchema.plugin(require('mongoose-autopopulate'));
