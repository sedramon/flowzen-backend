import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Query, Types, Schema as MongooseSchema } from 'mongoose';
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";

@Schema({timestamps: true})
export class Supplier {
    @Prop({required: true})
    name: string

    @Prop({required: true})
    address: string

    @Prop({required: true})
    contactPhone: string

    @Prop({required: true})
    contactEmail: string

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
    tenant: Tenant;

    readonly createdAt?: Date
    readonly updatedAt?: Date
}

const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('tenant');
  next();
});

SupplierSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('tenant');
  next();
});

export { SupplierSchema }