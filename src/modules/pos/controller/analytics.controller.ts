import { 
    Controller, 
    Get, 
    Query, 
    UseGuards, 
    Req, 
    HttpCode, 
    HttpStatus,
    BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { ScopesGuard } from 'src/common/guards/scopes.guard';
import { AnalyticsService } from '../service/analytics.service';
import { JwtUserPayload, PosApiResponse, AnalyticsQuery, AnalyticsPeriod } from '../types';

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
   * Get general analytics data
   * @param query - Query parameters for filtering analytics
   * @param req - Request object containing user information
   * @returns Analytics data
   * 
   * @example
   * ```typescript
   * GET /pos/analytics?facility=64a1b2c3d4e5f6789012345a&period=7d&type=sales
   * ```
   */
  @Get()
  @HttpCode(HttpStatus.OK)
    async getAnalytics(
    @Query() query: { 
      facility?: string; 
      period?: string; 
      type?: string; 
      dateFrom?: string; 
      dateTo?: string 
    }, 
    @Req() req: { user: JwtUserPayload }
    ): Promise<PosApiResponse> {
        try {
            // Convert string parameters to proper types
            const analyticsQuery: AnalyticsQuery = {
                facility: query.facility,
                period: query.period as AnalyticsPeriod || '7d',
                type: query.type as any || 'general',
                dateFrom: query.dateFrom,
                dateTo: query.dateTo
            };
      
            const analytics = await this.analyticsService.getAnalytics(analyticsQuery, req.user);
            return {
                success: true,
                data: analytics,
                message: 'Analytics data retrieved successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to retrieve analytics data');
        }
    }

  // ============================================================================
  // CASH FLOW ANALYTICS
  // ============================================================================

  /**
   * Get cash flow analytics
   * @param facility - Facility ID
   * @param period - Analytics period
   * @param req - Request object
   * @returns Cash flow analytics data
   * 
   * @example
   * ```typescript
   * GET /pos/analytics/cash-flow?facility=64a1b2c3d4e5f6789012345a&period=30d
   * ```
   */
  @Get('cash-flow')
  @HttpCode(HttpStatus.OK)
  async getCashFlowAnalytics(
    @Query('facility') facility: string, 
    @Query('period') period: string, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          if (!facility || !period) {
              throw new BadRequestException('Facility and period parameters are required');
          }
      
          const analytics = await this.analyticsService.getCashFlowAnalytics(facility, period as AnalyticsPeriod, req.user);
          return {
              success: true,
              data: analytics,
              message: 'Cash flow analytics retrieved successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to retrieve cash flow analytics');
      }
  }

  // ============================================================================
  // SALES ANALYTICS
  // ============================================================================

  /**
   * Get sales analytics
   * @param facility - Facility ID
   * @param period - Analytics period
   * @param req - Request object
   * @returns Sales analytics data
   * 
   * @example
   * ```typescript
   * GET /pos/analytics/sales?facility=64a1b2c3d4e5f6789012345a&period=7d
   * ```
   */
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesAnalytics(
    @Query('facility') facility: string, 
    @Query('period') period: string, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          if (!facility || !period) {
              throw new BadRequestException('Facility and period parameters are required');
          }
      
          const analytics = await this.analyticsService.getSalesAnalytics(facility, period as AnalyticsPeriod, req.user);
          return {
              success: true,
              data: analytics,
              message: 'Sales analytics retrieved successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to retrieve sales analytics');
      }
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS
  // ============================================================================

  /**
   * Get performance analytics
   * @param facility - Facility ID
   * @param period - Analytics period
   * @param req - Request object
   * @returns Performance analytics data
   * 
   * @example
   * ```typescript
   * GET /pos/analytics/performance?facility=64a1b2c3d4e5f6789012345a&period=30d
   * ```
   */
  @Get('performance')
  @HttpCode(HttpStatus.OK)
  async getPerformanceAnalytics(
    @Query('facility') facility: string, 
    @Query('period') period: string, 
    @Req() req: { user: JwtUserPayload }
  ): Promise<PosApiResponse> {
      try {
          if (!facility || !period) {
              throw new BadRequestException('Facility and period parameters are required');
          }
      
          const analytics = await this.analyticsService.getPerformanceAnalytics(facility, period as AnalyticsPeriod, req.user);
          return {
              success: true,
              data: analytics,
              message: 'Performance analytics retrieved successfully'
          };
      } catch (error) {
          if (error instanceof BadRequestException) {
              throw error;
          }
          throw new BadRequestException(error.message || 'Failed to retrieve performance analytics');
      }
  }
}
