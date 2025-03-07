import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Query } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";

@Schema({ timestamps: true })
export class Employee extends Document {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    contactEmail: string;

    @Prop({ required: true })
    contactPhone: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: true })
    jobRole: string;

    @Prop({ required: true,default: true})
    isActive: boolean;

    @Prop({ required: true, default: false })
    includeInAppoitments: boolean;

    @Prop({
        type: MongooseSchema.Types.ObjectId, // Reference to Tenant model
        ref: 'Tenant',
        required: true,
    })
    tenant: Tenant; // Use Tenant type for populated data

    readonly createdAt?: Date;
    readonly updatedAt?: Date
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);