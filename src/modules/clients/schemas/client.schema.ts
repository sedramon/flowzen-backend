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
        type: MongooseSchema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        autopopulate: { select: 'name' }
    })
        tenant: Tenant;
    
    readonly createdAt?: Date;
    readonly updatedAt?: Date
}

export const ClientsSchema = SchemaFactory.createForClass(Client);

// Apply mongoose-autopopulate plugin
ClientsSchema.plugin(require('mongoose-autopopulate'));