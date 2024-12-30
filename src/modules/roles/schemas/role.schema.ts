import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Role extends Document {
    @Prop({unique: true, required: true})
    name: string // Role name, e.g. admin, manager, employee

    @Prop({type: [String] ,required: true})
    defaultScopes: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);