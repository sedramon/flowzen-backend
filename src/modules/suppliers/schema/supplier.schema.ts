import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema } from 'mongoose';
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ type: String, required: true, trim: true })
      name: string

  @Prop({ type: String, required: true, trim: true })
      address: string;

  @Prop({ type: String, required: true, trim: true })
      city: string;

  @Prop({ type: String, required: true, trim: true })
      contactPhone: string;

  @Prop({
      type: String,
      trim: true,
      default: ''
  })
      contactLandline: string;

  @Prop({
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
  })
      contactEmail: string;

  @Prop({
      type: String,
      trim: true,
      default: ''
  })
      contactPerson: string;

  @Prop({
      type: String,
      trim: true,
      default: ''
  })
      pib: string;

  @Prop({
      type: String,
      trim: true,
      default: ''
  })
      remark: string;

  @Prop({
      type: Boolean,
      default: true
  })
      isActive: boolean;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
      autopopulate: true
  })
      tenant: Types.ObjectId | Tenant;

}

const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.plugin(require('mongoose-autopopulate'));

export { SupplierSchema }