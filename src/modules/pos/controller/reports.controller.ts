import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { ReportsService } from '../service/reports.service';

/**
 * Reports Controller
 * 
 * Upravlja izveštajima u POS sistemu.
 * Omogućava generisanje dnevnih, nedeljnih, mesečnih i Z izveštaja.
 */
@Controller('pos/reports')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ============================================================================
  // DAILY REPORTS
  // ============================================================================

  /**
   * Dnevni izveštaj za facility
   * GET /pos/reports/daily?facility=:facilityId&date=:date
   */
  @Get('daily')
  async daily(@Query('facility') facility: string, @Query('date') date: string, @Req() req) {
    return this.reportsService.dailyReport(facility, date, req.user);
  }

  // ============================================================================
  // Z REPORTS
  // ============================================================================

  /**
   * Z izveštaj za sesiju
   * GET /pos/reports/session/:sessionId/z
   */
  @Get('session/:sessionId/z')
  async zReport(@Param('sessionId') sessionId: string, @Req() req) {
    return this.reportsService.zReport(sessionId, req.user);
  }
}