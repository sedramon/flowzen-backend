import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { SettingsService } from '../service/settings.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Controller('pos/settings')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async get(@Query('facility') facility: string, @Req() req) {
    return this.settingsService.getSettings(facility, req.user);
  }

  @Put()
  async update(@Body() dto: UpdateSettingsDto, @Req() req) {
    return this.settingsService.updateSettings(dto, req.user);
  }
}
