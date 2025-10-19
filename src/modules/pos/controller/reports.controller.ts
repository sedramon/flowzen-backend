import {
    Controller,
    Get,
    Query,
    Param,
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
import { ReportsService } from '../service/reports.service';
import { JwtUserPayload, PosApiResponse } from '../types';

/**
 * Reports Controller
 * 
 * Manages reports in the POS system.
 * Provides endpoints for generating daily, weekly, monthly and Z reports.
 * 
 * @example
 * ```typescript
 * // Get daily report
 * GET /pos/reports/daily?facility=64a1b2c3d4e5f6789012345a&date=2024-01-15
 * ```
 */
@Controller('pos/reports')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // ============================================================================
    // DAILY REPORTS
    // ============================================================================

  /**
   * Generate daily report for facility
   * 
   * @param facility - Facility ID
   * @param date - Date for the report (YYYY-MM-DD format)
   * @param req - Request object containing user information
   * @returns Daily report data
   * 
   * @example
   * ```typescript
   * GET /pos/reports/daily?facility=64a1b2c3d4e5f6789012345a&date=2024-01-15
   * ```
   */
  @Get('daily')
  @HttpCode(HttpStatus.OK)
    async daily(
    @Query('facility') facility: string,
    @Query('date') date: string,
    @Req() req: { user: JwtUserPayload }
    ): Promise<PosApiResponse> {
        try {
            if (!Types.ObjectId.isValid(facility)) {
                throw new BadRequestException('Invalid facility ID format');
            }

            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
            }

            const report = await this.reportsService.dailyReport(facility, date, req.user);
            return {
                success: true,
                data: report,
                message: 'Daily report generated successfully'
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Failed to generate daily report');
        }
    }

  // ============================================================================
  // Z REPORTS
  // ============================================================================

  /**
   * Generate Z report for session
   * 
   * @param sessionId - Session ID for Z report
   * @param req - Request object containing user information
   * @returns Z report data
   * 
   * @example
   * ```typescript
   * GET /pos/reports/session/64a1b2c3d4e5f6789012345a/z
   * ```
   */
  @Get('session/:sessionId/z')
  @HttpCode(HttpStatus.OK)
  async zReport(
    @Param('sessionId') sessionId: string,
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          if (!Types.ObjectId.isValid(sessionId)) {
              throw new BadRequestException('Invalid session ID format');
          }

          const report = await this.reportsService.zReport(sessionId, req.user);
          return {
              success: true,
              data: report,
              message: 'Z report generated successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException || error instanceof NotFoundException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to generate Z report');
      }
  }
}