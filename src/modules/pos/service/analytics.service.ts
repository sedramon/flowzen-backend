import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from '../schemas/sale.schema';
import { CashSession } from '../schemas/cash-session.schema';

// JWT user payload type
interface JwtUserPayload {
  userId: string;
  username: string;
  tenant: string;
  role: string;
  scopes: string[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
  ) {}

  async getAnalytics(filters: any, user: JwtUserPayload) {
    const { facility, period = 'week', startDate, endDate } = filters;
    
    // Calculate date range based on period
    const dateRange = this.calculateDateRange(period, startDate, endDate);
    
    // Get cash sessions data
    const sessions = await this.cashSessionModel.find({
      tenant: user.tenant,
      facility: facility || { $exists: true },
      openedAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'closed'
    }).lean();

    // Get sales data
    const sales = await this.saleModel.find({
      tenant: user.tenant,
      facility: facility || { $exists: true },
      date: { $gte: dateRange.start, $lte: dateRange.end },
      status: { $in: ['final', 'partial_refund'] }
    }).lean();

    // Calculate analytics
    const totalSessions = sessions.length;
    const totalCash = sessions.reduce((sum, session) => sum + (session.closingCount || 0), 0);
    const totalVariance = sessions.reduce((sum, session) => sum + (session.variance || 0), 0);
    const averageVariance = totalSessions > 0 ? totalVariance / totalSessions : 0;
    
    // Calculate variance trend
    const varianceTrend = this.calculateVarianceTrend(sessions);
    
    // Get top performing facility
    const topPerformingFacility = await this.getTopPerformingFacility(user.tenant, dateRange);
    
    // Calculate cash flow efficiency
    const cashFlowEfficiency = this.calculateCashFlowEfficiency(sessions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(sessions, sales, averageVariance);

    return {
      totalSessions,
      totalCash,
      averageVariance,
      varianceTrend,
      topPerformingFacility,
      cashFlowEfficiency,
      recommendations,
      period,
      dateRange
    };
  }

  async getCashFlowAnalytics(facility: string, period: string, user: JwtUserPayload) {
    const dateRange = this.calculateDateRange(period);
    
    const sessions = await this.cashSessionModel.find({
      tenant: user.tenant,
      facility: facility || { $exists: true },
      openedAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'closed'
    }).lean();

    // Group by date for trend analysis
    const dailyFlow = this.groupSessionsByDate(sessions);
    
    return {
      dailyFlow,
      totalCash: sessions.reduce((sum, session) => sum + (session.closingCount || 0), 0),
      totalVariance: sessions.reduce((sum, session) => sum + (session.variance || 0), 0),
      averageVariance: sessions.length > 0 ? sessions.reduce((sum, session) => sum + (session.variance || 0), 0) / sessions.length : 0,
      period,
      dateRange
    };
  }

  async getSalesAnalytics(facility: string, period: string, user: JwtUserPayload) {
    const dateRange = this.calculateDateRange(period);
    
    const sales = await this.saleModel.find({
      tenant: user.tenant,
      facility: facility || { $exists: true },
      date: { $gte: dateRange.start, $lte: dateRange.end },
      status: { $in: ['final', 'partial_refund'] }
    }).lean();

    // Calculate sales metrics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.summary?.grandTotal || 0), 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Payment method breakdown
    const paymentMethods = this.calculatePaymentMethodBreakdown(sales);
    
    // Daily sales trend
    const dailySales = this.groupSalesByDate(sales);
    
    return {
      totalSales,
      totalRevenue,
      averageSaleValue,
      paymentMethods,
      dailySales,
      period,
      dateRange
    };
  }

  async getPerformanceAnalytics(facility: string, period: string, user: JwtUserPayload) {
    const dateRange = this.calculateDateRange(period);
    
    const sessions = await this.cashSessionModel.find({
      tenant: user.tenant,
      facility: facility || { $exists: true },
      openedAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'closed'
    }).lean();

    // Performance metrics
    const averageSessionDuration = this.calculateAverageSessionDuration(sessions);
    const varianceEfficiency = this.calculateVarianceEfficiency(sessions);
    const sessionProductivity = this.calculateSessionProductivity(sessions);
    
    return {
      averageSessionDuration,
      varianceEfficiency,
      sessionProductivity,
      period,
      dateRange
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private calculateDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start = new Date(now);
          start.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          start = new Date(now);
          start.setMonth(now.getMonth() - 3);
          break;
        default:
          start = new Date(now);
          start.setDate(now.getDate() - 7);
      }
    }

    return { start, end };
  }

  private calculateVarianceTrend(sessions: any[]): 'improving' | 'stable' | 'declining' {
    if (sessions.length < 2) return 'stable';
    
    const sortedSessions = sessions.sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());
    const firstHalf = sortedSessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sortedSessions.slice(Math.floor(sessions.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + Math.abs(s.variance || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + Math.abs(s.variance || 0), 0) / secondHalf.length;
    
    const improvement = ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100;
    
    if (improvement > 10) return 'improving';
    if (improvement < -10) return 'declining';
    return 'stable';
  }

  private async getTopPerformingFacility(tenant: string, dateRange: any): Promise<string> {
    const facilityStats = await this.cashSessionModel.aggregate([
      {
        $match: {
          tenant,
          openedAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: 'closed'
        }
      },
      {
        $group: {
          _id: '$facility',
          totalCash: { $sum: '$closingCount' },
          avgVariance: { $avg: '$variance' }
        }
      },
      {
        $sort: { totalCash: -1 }
      },
      {
        $limit: 1
      }
    ]);

    return facilityStats.length > 0 ? facilityStats[0]._id : 'N/A';
  }

  private calculateCashFlowEfficiency(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const totalVariance = sessions.reduce((sum, session) => sum + Math.abs(session.variance || 0), 0);
    const totalCash = sessions.reduce((sum, session) => sum + (session.closingCount || 0), 0);
    
    return totalCash > 0 ? Math.max(0, 100 - (totalVariance / totalCash * 100)) : 100;
  }

  private generateRecommendations(sessions: any[], sales: any[], averageVariance: number): string[] {
    const recommendations: string[] = [];
    
    if (averageVariance > 100) {
      recommendations.push('Varijacija je prevelika - preporučuje se redovno brojanje cash-a');
    } else if (averageVariance < 50) {
      recommendations.push('Varijacija je u prihvatljivim granicama');
    }
    
    const cashPaymentRatio = this.calculateCashPaymentRatio(sales);
    if (cashPaymentRatio > 0.7) {
      recommendations.push('Veliki deo plaćanja je gotovinom - razmotriti kartična plaćanja');
    } else if (cashPaymentRatio < 0.3) {
      recommendations.push('Kartična plaćanja su dominantna - dobra praksa');
    }
    
    const sessionCount = sessions.length;
    if (sessionCount > 10) {
      recommendations.push('Visok broj sesija - razmotriti optimizaciju radnih procesa');
    }
    
    return recommendations;
  }

  private groupSessionsByDate(sessions: any[]): any[] {
    const grouped = sessions.reduce((acc, session) => {
      const date = new Date(session.openedAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalCash: 0, variance: 0, sessions: 0 };
      }
      acc[date].totalCash += session.closingCount || 0;
      acc[date].variance += session.variance || 0;
      acc[date].sessions += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private groupSalesByDate(sales: any[]): any[] {
    const grouped = sales.reduce((acc, sale) => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalSales: 0, revenue: 0 };
      }
      acc[date].totalSales += 1;
      acc[date].revenue += sale.summary?.grandTotal || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private calculatePaymentMethodBreakdown(sales: any[]): any[] {
    const breakdown: Record<string, number> = {};
    
    sales.forEach(sale => {
      sale.payments?.forEach((payment: any) => {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
      });
    });

    const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(breakdown).map(([method, amount]) => ({
      method,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));
  }

  private calculateCashPaymentRatio(sales: any[]): number {
    let totalCash = 0;
    let totalAmount = 0;
    
    sales.forEach(sale => {
      sale.payments?.forEach((payment: any) => {
        totalAmount += payment.amount;
        if (payment.method === 'cash') {
          totalCash += payment.amount;
        }
      });
    });
    
    return totalAmount > 0 ? totalCash / totalAmount : 0;
  }

  private calculateAverageSessionDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      const openedAt = new Date(session.openedAt);
      const closedAt = new Date(session.closedAt || new Date());
      return sum + (closedAt.getTime() - openedAt.getTime());
    }, 0);
    
    return totalDuration / sessions.length / (1000 * 60); // Convert to minutes
  }

  private calculateVarianceEfficiency(sessions: any[]): number {
    if (sessions.length === 0) return 100;
    
    const totalVariance = sessions.reduce((sum, session) => sum + Math.abs(session.variance || 0), 0);
    const totalCash = sessions.reduce((sum, session) => sum + (session.closingCount || 0), 0);
    
    return totalCash > 0 ? Math.max(0, 100 - (totalVariance / totalCash * 100)) : 100;
  }

  private calculateSessionProductivity(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const totalCash = sessions.reduce((sum, session) => sum + (session.closingCount || 0), 0);
    const totalDuration = sessions.reduce((sum, session) => {
      const openedAt = new Date(session.openedAt);
      const closedAt = new Date(session.closedAt || new Date());
      return sum + (closedAt.getTime() - openedAt.getTime());
    }, 0);
    
    const totalHours = totalDuration / (1000 * 60 * 60);
    return totalHours > 0 ? totalCash / totalHours : 0;
  }
}
