import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({
    timestamps: true
})
export class Scope extends Document {
    @Prop({unique: true, required: true})
        name: string;

    @Prop({required: true})
        description: string;

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export const ScopeSchema = SchemaFactory.createForClass(Scope);