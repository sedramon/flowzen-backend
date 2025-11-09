import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { GlobalScopesGuard } from 'src/common/guards/global-scopes.guard';
import { Scopes } from 'src/common/decorators/scopes.decorator';
import { AdminAuditService } from '../services/admin-audit.service';
import { AdminAuditQueryDto } from '../dto/admin-audit-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Global Admin - Audit')
@Controller('admin/audit')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AdminAuditController {
    constructor(private readonly adminAuditService: AdminAuditService) {}

    @Get()
    @Scopes('global.audit:*')
    async list(@Query() query: AdminAuditQueryDto) {
        return this.adminAuditService.listLogs(query);
    }
}

