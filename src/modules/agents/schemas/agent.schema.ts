import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({
    timestamps: true
})
export class Agent extends Document {
    @Prop({ required: true })
        name: string;

    @Prop({ required: true, unique: true })
        slug: string;

    @Prop({ required: true })
        description: string;

    @Prop({ required: true })
        minionImage: string;

    @Prop({ required: true })
        embedCode: string;

    @Prop({ type: [String], default: [] })
        tags: string[];

    @Prop({ default: true })
        isActive: boolean;

    @Prop({ required: false })
        workspaceId?: string;

    @Prop({ 
        enum: ['internal', 'client'], 
        required: true,
        default: 'internal'
    })
        agentType: 'internal' | 'client';

    @Prop({ required: false })
        clientId?: string;

    @Prop({ required: false, default: '#00cfff' })
        accentColor?: string;

    @Prop({ required: false, default: '#0099cc' })
        secondaryAccentColor?: string;

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

