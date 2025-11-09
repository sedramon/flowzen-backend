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
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminRolesService } from '../services/admin-roles.service';
import { AdminCreateRoleDto } from '../dto/admin-create-role.dto';
import { AdminUpdateRoleDto } from '../dto/admin-update-role.dto';

type RequestWithUser = Request & {
    user?: {
        userId?: string;
    };
};

@ApiTags('Global Admin - Roles')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AdminRolesController {
    private static requireUserId(req: RequestWithUser): string {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenException('Authenticated user context missing');
        }
        return userId;
    }

    constructor(private readonly adminRolesService: AdminRolesService) {}

    @Get()
    @Scopes('global.users:read')
    async list(
        @Query('tenant') tenant?: string,
        @Query('type') type?: 'global' | 'tenant',
    ) {
        return this.adminRolesService.listRoles(tenant, type);
    }

    @Post()
    @Scopes('global.users:create')
    async create(
        @Body() dto: AdminCreateRoleDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminRolesController.requireUserId(req);
        return this.adminRolesService.createRole(dto, userId);
    }

    @Patch(':id')
    @Scopes('global.users:update')
    async update(
        @Param('id') roleId: string,
        @Body() dto: AdminUpdateRoleDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminRolesController.requireUserId(req);
        return this.adminRolesService.updateRole(roleId, dto, userId);
    }

    @Delete(':id')
    @Scopes('global.users:delete')
    async delete(@Param('id') roleId: string, @Req() req: RequestWithUser) {
        const userId = AdminRolesController.requireUserId(req);
        return this.adminRolesService.deleteRole(roleId, userId);
    }
}

