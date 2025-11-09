import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';

@Schema({ timestamps: true })
export class AuditLog extends Document {
    @Prop({ required: true })
        action: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
        performedBy?: User | MongooseSchema.Types.ObjectId | null;

    @Prop()
        targetType?: string;

    @Prop()
        targetId?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant' })
        tenant?: Tenant | MongooseSchema.Types.ObjectId | null;

    @Prop({ type: MongooseSchema.Types.Mixed })
        metadata?: Record<string, unknown>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

