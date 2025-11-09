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
import { AdminUsersService } from '../services/admin-users.service';
import { AdminUserQueryDto } from '../dto/admin-user-query.dto';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

type RequestWithUser = Request & {
    user?: {
        userId?: string;
    };
};

@ApiTags('Global Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, SuperAdminGuard, GlobalScopesGuard)
export class AdminUsersController {
    private static requireUserId(req: RequestWithUser): string {
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenException('Authenticated user context missing');
        }
        return userId;
    }

    constructor(private readonly adminUsersService: AdminUsersService) {}

    @Get()
    @Scopes('global.users:read')
    async list(@Query() query: AdminUserQueryDto) {
        return this.adminUsersService.listUsers(query);
    }

    @Post()
    @Scopes('global.users:create')
    async create(
        @Body() dto: AdminCreateUserDto,
        @Req() req: RequestWithUser,
    ) {
        const userId = AdminUsersController.requireUserId(req);
        return this.adminUsersService.createUser(dto, userId);
    }

    @Patch(':id')
    @Scopes('global.users:update')
    async update(
        @Param('id') userId: string,
        @Body() dto: AdminUpdateUserDto,
        @Req() req: RequestWithUser,
    ) {
        const performedBy = AdminUsersController.requireUserId(req);
        return this.adminUsersService.updateUser(
            userId,
            dto,
            performedBy,
        );
    }

    @Patch(':id/reset-password')
    @Scopes('global.users:update')
    async resetPassword(
        @Param('id') userId: string,
        @Body() dto: AdminResetPasswordDto,
        @Req() req: RequestWithUser,
    ) {
        const performedBy = AdminUsersController.requireUserId(req);
        return this.adminUsersService.resetPassword(
            userId,
            dto,
            performedBy,
        );
    }

    @Delete(':id')
    @Scopes('global.users:delete')
    async delete(
        @Param('id') userId: string,
        @Req() req: RequestWithUser,
    ) {
        const performedBy = AdminUsersController.requireUserId(req);
        return this.adminUsersService.deleteUser(userId, performedBy);
    }
}

