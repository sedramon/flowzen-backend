import {
    Controller,
    Get,
    Put,
    Body,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { SettingsService } from '../service/settings.service';
import { UpdateSettingsDto } from '../dto/settings/update-settings.dto';
import { JwtUserPayload, PosApiResponse } from '../types';

/**
 * Settings Controller
 * 
 * Manages POS system settings and configuration.
 * Provides endpoints for configuring payment methods, fiscalization, and other parameters.
 * 
 * @example
 * ```typescript
 * // Get settings
 * GET /pos/settings?facility=64a1b2c3d4e5f6789012345a
 * 
 * // Update settings
 * PUT /pos/settings
 * {
 *   "facility": "64a1b2c3d4e5f6789012345a",
 *   "paymentMethods": {...},
 *   "fiscalization": {...}
 * }
 * ```
 */
@Controller('pos/settings')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    // ============================================================================
    // SETTINGS MANAGEMENT
    // ============================================================================

  /**
   * Get POS settings for facility
   * 
   * @param facility - Facility ID
   * @param req - Request object containing user information
   * @returns POS settings data
   * 
   * @example
   * ```typescript
   * GET /pos/settings?facility=64a1b2c3d4e5f6789012345a
   * ```
   */
  @Get()
  @HttpCode(HttpStatus.OK)
    async get(
    @Query('facility') facility: string,
    @Req() req: { user: JwtUserPayload }
    ): Promise<PosApiResponse> {
        try {
            if (!Types.ObjectId.isValid(facility)) {
                throw new BadRequestException('Invalid facility ID format');
            }

            const settings = await this.settingsService.getSettings(facility, req.user);
            return {
                success: true,
                data: settings,
                message: 'Settings retrieved successfully'
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Failed to retrieve settings');
        }
    }

  /**
   * Update POS settings
   * 
   * @param dto - Settings update data
   * @param req - Request object containing user information
   * @returns Updated settings data
   * 
   * @example
   * ```typescript
   * PUT /pos/settings
   * {
   *   "facility": "64a1b2c3d4e5f6789012345a",
   *   "paymentMethods": {
   *     "cash": { "enabled": true },
   *     "card": { "enabled": true }
   *   }
   * }
   * ```
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() dto: UpdateSettingsDto,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          const settings = await this.settingsService.updateSettings(dto, req.user);
          return {
              success: true,
              data: settings,
              message: 'Settings updated successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to update settings');
      }
  }
}