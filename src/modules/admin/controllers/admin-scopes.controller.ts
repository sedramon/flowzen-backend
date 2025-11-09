import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { GlobalScopesGuard } from 'src/common/guards/global-scopes.guard';
import { Scopes } from 'src/common/decorators/scopes.decorator';
import { AdminScopesService } from '../services/admin-scopes.service';
import { AdminCreateScopeDto } from '../dto/admin-create-scope.dto';
import { AdminUpdateScopeDto } from '../dto/admin-update-scope.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

type RequestWithUser = Request & {
    user?: {
        userId?: string;
    };
};

@ApiTags('Global Admin - Scopes')
@Controller('admin/scopes')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AdminScopesController {
    private static requireUserId(req: RequestWithUser): string {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenException('Authenticated user context missing');
        }
        return userId;
    }

    constructor(private readonly adminScopesService: AdminScopesService) {}

    @Get()
    @Scopes('global.scopes:*')
    async list(@Query('category') category?: 'tenant' | 'global') {
        return this.adminScopesService.listScopes(category);
    }

    @Post()
    @Scopes('global.scopes:*')
    async create(
        @Body() dto: AdminCreateScopeDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminScopesController.requireUserId(req);
        return this.adminScopesService.createScope(dto, userId);
    }

    @Patch(':id')
    @Scopes('global.scopes:*')
    async update(
        @Param('id') scopeId: string,
        @Body() dto: AdminUpdateScopeDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminScopesController.requireUserId(req);
        return this.adminScopesService.updateScope(scopeId, dto, userId);
    }

    @Delete(':id')
    @Scopes('global.scopes:*')
    async delete(@Param('id') scopeId: string, @Req() req: RequestWithUser) {
        const userId = AdminScopesController.requireUserId(req);
        return this.adminScopesService.deleteScope(scopeId, userId);
    }
}

