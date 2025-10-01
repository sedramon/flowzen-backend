import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { SettingsService } from '../service/settings.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

/**
 * Settings Controller
 * 
 * Upravlja POS postavkama sistema.
 * Omogućava konfiguraciju payment metoda, fiscalizacije i drugih parametara.
 */
@Controller('pos/settings')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================

  /**
   * Dohvatanje POS postavki za facility
   * GET /pos/settings?facility=:facilityId
   */
  @Get()
  async get(@Query('facility') facility: string, @Req() req) {
    return this.settingsService.getSettings(facility, req.user);
  }

  /**
   * Ažuriranje POS postavki
   * PUT /pos/settings
   */
  @Put()
  async update(@Body() dto: UpdateSettingsDto, @Req() req) {
    return this.settingsService.updateSettings(dto, req.user);
  }
}