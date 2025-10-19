import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';

@Schema({ timestamps: true })
export class Facility extends Document {
  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      autopopulate: { select: 'name' }
  })
      tenant: Tenant;

  @Prop({ required: true })
      name: string;

  @Prop({ required: true })
      address: string;

  @Prop({ required: true })
      openingHour: string;

  @Prop({ required: true })
      closingHour: string;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const FacilitySchema = SchemaFactory.createForClass(Facility);

// Apply mongoose-autopopulate plugin
FacilitySchema.plugin(require('mongoose-autopopulate'));
