import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { AnalyticsService } from '../service/analytics.service';

/**
 * Analytics Controller
 * 
 * Upravlja analytics podacima u POS sistemu.
 * Omogućava generisanje analytics izveštaja za cash flow, prodaju i performanse.
 */
@Controller('pos/analytics')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ============================================================================
  // GENERAL ANALYTICS
  // ============================================================================

  /**
   * Dohvata generalne analytics podatke
   * GET /pos/analytics
   */
  @Get()
  async getAnalytics(@Query() query: any, @Req() req) {
    return this.analyticsService.getAnalytics(query, req.user);
  }

  // ============================================================================
  // CASH FLOW ANALYTICS
  // ============================================================================

  /**
   * Dohvata cash flow analytics
   * GET /pos/analytics/cash-flow
   */
  @Get('cash-flow')
  async getCashFlowAnalytics(@Query('facility') facility: string, @Query('period') period: string, @Req() req) {
    return this.analyticsService.getCashFlowAnalytics(facility, period, req.user);
  }

  // ============================================================================
  // SALES ANALYTICS
  // ============================================================================

  /**
   * Dohvata sales analytics
   * GET /pos/analytics/sales
   */
  @Get('sales')
  async getSalesAnalytics(@Query('facility') facility: string, @Query('period') period: string, @Req() req) {
    return this.analyticsService.getSalesAnalytics(facility, period, req.user);
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS
  // ============================================================================

  /**
   * Dohvata performance analytics
   * GET /pos/analytics/performance
   */
  @Get('performance')
  async getPerformanceAnalytics(@Query('facility') facility: string, @Query('period') period: string, @Req() req) {
    return this.analyticsService.getPerformanceAnalytics(facility, period, req.user);
  }
}
