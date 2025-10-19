import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema } from 'mongoose';
import { Supplier } from "src/modules/suppliers/schema/supplier.schema";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";

@Schema({ timestamps: true })
export class Article {
    @Prop({ type: String, required: true, trim: true })
        name: string;

    @Prop({ type: String, required: true, trim: true })
        unitOfMeasure: string;

    @Prop({ type: Number, required: true, min: 0 })
        price: number;

    @Prop({ type: Number, default: null, min: 0 })
        salePrice: number | null;

    @Prop({ type: Boolean, default: false })
        isOnSale: boolean;

    @Prop({ type: String, default: '', trim: true })
        code: string;

    @Prop({ type: Number, default: 0, min: 0 })
        taxRates: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Supplier', autopopulate: { maxDepth: 1}, default: null })
        supplier: Types.ObjectId | Supplier | null;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', autopopulate: true, required: true, index: true })
        tenant: Types.ObjectId | Tenant;

    @Prop({ type: Boolean, default: true })
        isActive: boolean;

    @Prop({ type: Number, default: 0 })
        stock: number;

    @Prop({ type: Number, default: 0 })
        minStock: number;

    @Prop({ type: String, default: '', trim: true })
        remark: string;
}

const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({tenant: 1, isActive: 1});

ArticleSchema.plugin(require('mongoose-autopopulate'))

export { ArticleSchema };