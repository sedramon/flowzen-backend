import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false, transform: docToJsonTransform } })
export class Shift {
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Tenant', 
      required: true,
      autopopulate: { select: 'name' }
  })
      tenant: Tenant;

  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Facility', 
      required: true,
      autopopulate: { select: 'name' }
  })
      facility: Facility;

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

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export type ShiftDocument = Shift & Document;
const ShiftSchema = SchemaFactory.createForClass(Shift);

// Apply mongoose-autopopulate plugin
ShiftSchema.plugin(require('mongoose-autopopulate'));

function docToJsonTransform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
}

export { ShiftSchema }