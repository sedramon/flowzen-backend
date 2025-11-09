import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';

export interface AuditLogInput {
    action: string;
    performedBy?: Types.ObjectId | string | null;
    targetType?: string;
    targetId?: Types.ObjectId | string | null;
    tenant?: Types.ObjectId | string | null;
    metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLog>,
    ) {}

    async log(entry: AuditLogInput): Promise<AuditLog> {
        try {
            const performedById =
                entry.performedBy && Types.ObjectId.isValid(entry.performedBy)
                    ? new Types.ObjectId(entry.performedBy)
                    : null;

            const tenantId =
                entry.tenant && Types.ObjectId.isValid(entry.tenant)
                    ? new Types.ObjectId(entry.tenant)
                    : undefined;

            const targetId =
                entry.targetId instanceof Types.ObjectId
                    ? entry.targetId.toHexString()
                    : entry.targetId ?? undefined;

            const doc = new this.auditLogModel({
                action: entry.action,
                performedBy: performedById,
                targetType: entry.targetType,
                targetId,
                tenant: tenantId ?? null,
                metadata: entry.metadata,
            });
            return await doc.save();
        } catch (error) {
            this.logger.error(
                `Failed to store audit log for action "${entry.action}": ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}

