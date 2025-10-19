import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { Facility } from "src/modules/facility/schema/facility.schema";

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

    @Prop({ required: true, default: true })
        isActive: boolean;

    @Prop({ required: true, default: false })
        includeInAppoitments: boolean;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        autopopulate: { select: 'name' }
    })
        tenant: Tenant;

    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: 'Facility',
        required: false,
        default: [],
        autopopulate: { select: 'name' }
    })
        facilities?: Facility[];

    @Prop()
        avatarUrl?: string;

    readonly createdAt?: Date;
    readonly updatedAt?: Date
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Apply mongoose-autopopulate plugin
EmployeeSchema.plugin(require('mongoose-autopopulate'));