import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Tenant extends Document {
    @Prop({required: true})
    name: string

    @Prop({required: true})
    companyType: string;

    @Prop({required: true})
    address: string

    @Prop({})
    contactEmail: string

    @Prop({})
    contactPhone: string

    @Prop({required: true, unique: true})
    MIB: string

    @Prop({required: true, unique: true})
    PIB: string

    @Prop({required: true, default: false})
    hasLicense: boolean

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);