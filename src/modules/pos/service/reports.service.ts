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
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
  ) {}

  async dailyReport(facility: string, date: string, user: JwtUserPayload) {
    // 1. Pronađi sve prodaje i refundove za facility i dan
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const sales = await this.saleModel.find({
      tenant: user.tenant,
      facility,
      date: { $gte: start, $lte: end },
      status: { $in: ['final', 'partial_refund'] },
    });
    const refunds = await this.saleModel.find({
      tenant: user.tenant,
      facility,
      date: { $gte: start, $lte: end },
      status: 'refunded',
    });
    // 2. Agregiraj po načinu plaćanja
    const paymentTotals: Record<string, number> = {};
    for (const sale of sales) {
      for (const p of sale.payments || []) {
        paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount;
      }
    }
    // 3. Sumarni izveštaj
    const report = {
      date,
      facility,
      salesCount: sales.length,
      refundCount: refunds.length,
      totalSales: sales.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0),
      totalRefunds: refunds.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0),
      paymentTotals,
    };
    this.logger.log(`Generated daily report for facility ${facility} on ${date}`);
    return report;
  }

  async zReport(sessionId: string, user: JwtUserPayload) {
    // 1. Pronađi sesiju
    const session = await this.cashSessionModel.findById(sessionId);
    if (!session) throw new Error('Sesija nije pronađena.');
    // 2. Pronađi sve prodaje i refundove za sesiju
    const sales = await this.saleModel.find({ session: sessionId, status: { $in: ['final', 'partial_refund'] } });
    const refunds = await this.saleModel.find({ session: sessionId, status: 'refunded' });
    // 3. Agregiraj po načinu plaćanja
    const paymentTotals: Record<string, number> = {};
    for (const sale of sales) {
      for (const p of sale.payments || []) {
        paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount;
      }
    }
    // 4. Sumarni izveštaj
    const report = {
      sessionId,
      openedAt: session.openedAt,
      closedAt: session.closedAt,
      cashier: session.openedBy,
      salesCount: sales.length,
      refundCount: refunds.length,
      totalSales: sales.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0),
      totalRefunds: refunds.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0),
      paymentTotals,
      openingFloat: session.openingFloat,
      closingCount: session.closingCount,
      expectedCash: session.expectedCash,
      variance: session.variance,
    };
    this.logger.log(`Generated Z-report for session ${sessionId}`);
    return report;
  }
}
