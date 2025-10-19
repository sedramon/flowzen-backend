import { Body, Controller, Get, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { ScopesGuard } from "src/common/guards/scopes.guard";
import { SettingsService } from "../service/settings.service";
import { Scopes } from "src/common/decorators";
import { Settings, EffectiveSettings, RawSettingsDoc } from "../schemas/settings.schema";
import { UpsertSettingsDto } from "../dto/CreateSettings.dto";


@Controller('settings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

  @Scopes('scope_settings:read')
  @Get()
    async findSettings(
    @Query('tenant') tenantId: string,
    @Query('user') userId: string
    ): Promise<EffectiveSettings> {
        return this.settingsService.findSettings(tenantId, userId);
    }

  @Scopes('scope_settings:read')
  @Get('tenant')
  async getTenantRaw(
    @Query('tenant') tenantId: string
  ): Promise<RawSettingsDoc> {
      return this.settingsService.findTenantSettingsRaw(tenantId);
  }

  @Scopes('scope_settings:read')
  @Get('user')
  async getUserRaw(
    @Query('tenant') tenantId: string,
    @Query('user') userId: string
  ): Promise<RawSettingsDoc> {
      return this.settingsService.findUserSettingsRaw(tenantId, userId);
  }

  @Scopes('scope_settings:create')
  @Put()
  async upsertSettings(@Body() dto: UpsertSettingsDto): Promise<Settings> {
      return this.settingsService.upsertSettings(dto);
  }
}