import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class Scope extends Document {
    @Prop({unique: true, required: true})
    name: string;

    @Prop({required: true})
    description: string;
}

export const ScopeSchema = SchemaFactory.createForClass(Scope);