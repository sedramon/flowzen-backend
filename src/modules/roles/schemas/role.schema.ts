import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Role extends Document {
    @Prop({unique: true, required: true})
    name: string // Role name, e.g. admin, manager, employee

    @Prop({type: [String] ,required: true})
    availableScopes: string[];

    readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);