import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SetupSuperadminDto } from './dto/setup-superadmin.dto';
import { RollbackSuperadminDto } from './dto/rollback-superadmin.dto';
import { AdminSetupService } from './admin-setup.service';
import { AdminSetupGuard } from './guards/admin-setup.guard';

@Controller('admin/setup')
export class AdminSetupController {
    constructor(private readonly adminSetupService: AdminSetupService) {}

    @Post('superadmin')
    @UseGuards(AdminSetupGuard)
    async setupSuperadmin(@Body() dto: SetupSuperadminDto) {
        return this.adminSetupService.setupSuperadmin(dto);
    }

    @Post('superadmin/rollback')
    @UseGuards(AdminSetupGuard)
    async rollbackSuperadmin(@Body() dto: RollbackSuperadminDto) {
        return this.adminSetupService.rollbackSuperadmin(dto);
    }
}

