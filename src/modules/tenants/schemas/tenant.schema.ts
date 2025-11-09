import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

@Schema({timestamps: true})
export class Tenant extends Document {
    @Prop({required: true})
        name: string

    @Prop({required: true})
        companyType: string;

    @Prop({required: true})
        street: string

    @Prop({required: true})
        city: string

    @Prop({required: true})
        country: string

    @Prop({})
        contactEmail: string

    @Prop({})
        contactPhone: string

    @Prop({required: true, unique: true})
        MIB: string

    @Prop({required: true, unique: true})
        PIB: string

    @Prop({required: true, default: false})
        hasActiveLicense: boolean

    @Prop({required: true, default: new Date()})
        licenseStartDate: Date

    @Prop({required: true, default: new Date()})
        licenseExpiryDate: Date

    @Prop({ enum: ['active', 'suspended', 'pending'], default: 'active' })
        status: 'active' | 'suspended' | 'pending'

    @Prop()
        suspendedAt?: Date

    @Prop()
        suspensionReason?: string

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
        suspendedBy?: Types.ObjectId | null

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);