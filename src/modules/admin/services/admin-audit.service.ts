import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { AuditLog } from 'src/modules/audit/schemas/audit-log.schema';
import { AdminAuditQueryDto } from '../dto/admin-audit-query.dto';

@Injectable()
export class AdminAuditService {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLog>,
    ) {}

    async listLogs(query: AdminAuditQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 25;

        const filter: FilterQuery<AuditLog> = {};

        if (query.action) {
            filter.action = query.action;
        }

        if (query.targetType) {
            filter.targetType = query.targetType;
        }

        if (query.performedBy && Types.ObjectId.isValid(query.performedBy)) {
            filter.performedBy = new Types.ObjectId(query.performedBy);
        }

        if (query.tenant && Types.ObjectId.isValid(query.tenant)) {
            filter.tenant = new Types.ObjectId(query.tenant);
        }

        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (query.timeRange && query.timeRange !== 'custom') {
            switch (query.timeRange) {
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = null;
            }
            endDate = now;
        } else if (query.timeRange === 'custom') {
            startDate = query.startDate ?? null;
            endDate = query.endDate ?? null;
        } else if (query.startDate || query.endDate) {
            startDate = query.startDate ?? null;
            endDate = query.endDate ?? null;
        }

        if (startDate && endDate && startDate > endDate) {
            const tmp = startDate;
            startDate = endDate;
            endDate = tmp;
        }

        if (startDate || endDate) {
            filter.createdAt = {
                ...(startDate ? { $gte: startDate } : {}),
                ...(endDate ? { $lte: endDate } : { $lte: now }),
            };
        }

        const [items, total] = await Promise.all([
            this.auditLogModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('performedBy', 'email name')
                .populate('tenant', 'name')
                .lean()
                .exec(),
            this.auditLogModel.countDocuments(filter),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1,
        };
    }
}

