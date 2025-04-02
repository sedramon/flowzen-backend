import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";


@Schema({timestamps: true})
export class Client extends Document {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    contactPhone: string;

    @Prop()
    contactEmail: string;

    @Prop()
    address: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId, // Reference to Tenant model
        ref: 'Tenant',
        required: true,
    })
    tenant: Tenant; // Use Tenant type for populated data
    
    readonly createdAt?: Date;
    readonly updatedAt?: Date
}

export const ClientsSchema = SchemaFactory.createForClass(Client);