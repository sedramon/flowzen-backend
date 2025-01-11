import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Role extends Document {
    @Prop({unique: true, required: true})
    name: string // Role name, e.g. admin, manager, employee

    @Prop({type: [String] ,required: true})
    availableScopes: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);