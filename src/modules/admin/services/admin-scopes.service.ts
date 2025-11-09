import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Scope } from 'src/modules/scopes/schemas/scope.schema';
import { AdminCreateScopeDto } from '../dto/admin-create-scope.dto';
import { AdminUpdateScopeDto } from '../dto/admin-update-scope.dto';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class AdminScopesService {
    constructor(
        @InjectModel(Scope.name) private readonly scopeModel: Model<Scope>,
        private readonly auditService: AuditService,
    ) {}

    private normalizeId(value: unknown): string | null {
        if (!value) {
            return null;
        }

        if (value instanceof Types.ObjectId) {
            return value.toHexString();
        }

        if (typeof value === 'string') {
            return value;
        }

        return null;
    }

    async listScopes(category?: 'tenant' | 'global') {
        const filter: Record<string, unknown> = {};
        if (category) {
            filter.category = category;
        }

        return this.scopeModel.find(filter).sort({ name: 1 }).lean().exec();
    }

    async createScope(dto: AdminCreateScopeDto, performedBy: string) {
        try {
            const scope = await this.scopeModel.create(dto);

            const scopeId = this.normalizeId(scope._id);

            await this.auditService.log({
                action: 'global-admin.scope.create',
                performedBy,
                targetType: 'Scope',
                targetId: scopeId,
                metadata: { scope: dto },
            });

            return scope;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    `Scope with name "${dto.name}" already exists`,
                );
            }
            throw error;
        }
    }

    async updateScope(
        scopeId: string,
        dto: AdminUpdateScopeDto,
        performedBy: string,
    ) {
        const scope = await this.scopeModel
            .findByIdAndUpdate(
                scopeId,
                { $set: dto },
                { new: true, runValidators: true },
            )
            .exec();

        if (!scope) {
            throw new NotFoundException(`Scope with ID ${scopeId} not found`);
        }

        const normalizedScopeId = this.normalizeId(scope._id);

        await this.auditService.log({
            action: 'global-admin.scope.update',
            performedBy,
            targetType: 'Scope',
            targetId: normalizedScopeId,
            metadata: { updates: dto },
        });

        return scope;
    }

    async deleteScope(scopeId: string, performedBy: string) {
        const scope = await this.scopeModel.findByIdAndDelete(scopeId).exec();

        if (!scope) {
            throw new NotFoundException(`Scope with ID ${scopeId} not found`);
        }

        const normalizedScopeId = this.normalizeId(scope._id);

        await this.auditService.log({
            action: 'global-admin.scope.delete',
            performedBy,
            targetType: 'Scope',
            targetId: normalizedScopeId,
            metadata: { name: scope.name },
        });

        return { message: 'Scope deleted successfully' };
    }
}

