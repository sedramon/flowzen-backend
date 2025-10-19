import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from '../schemas/sale.schema';
import { CashSession } from '../schemas/cash-session.schema';
import { 
    JwtUserPayload, 
    PaymentTotals, 
    DailyReport, 
    SalesReport, 
    CashFlowReport,
    ZReport
} from '../types';

/**
 * Reports Service
 * 
 * Handles generation of various reports including daily reports,
 * sales reports, and cash flow reports for POS system.
 */
@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
    ) {}

    /**
   * Generate daily report for a specific facility and date
   * @param facility - Facility ID
   * @param date - Date string (YYYY-MM-DD)
   * @param user - Authenticated user
   * @returns Daily report data
   */
    async dailyReport(facility: string, date: string, user: JwtUserPayload): Promise<DailyReport> {
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
        const paymentTotals: PaymentTotals = {
            cash: 0,
            card: 0,
            voucher: 0,
            gift: 0,
            bank: 0,
            other: 0
        };
        for (const sale of sales) {
            for (const p of sale.payments || []) {
                const method = p.method as keyof PaymentTotals;
                if (paymentTotals.hasOwnProperty(method)) {
                    paymentTotals[method] += p.amount;
                } else {
                    paymentTotals.other += p.amount;
                }
            }
        }
        // 3. Sumarni izveštaj
        const totalSales = sales.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0);
        const totalRefunds = refunds.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0);
    
        const report: DailyReport = {
            date,
            facility,
            summary: {
                totalSales,
                totalRefunds,
                netTotal: totalSales - totalRefunds,
                transactionCount: sales.length,
                refundCount: refunds.length,
            },
            paymentTotals,
            topServices: [], // TODO: Implement service breakdown
            hourlyBreakdown: [], // TODO: Implement hourly breakdown
        };
        this.logger.log(`Generated daily report for facility ${facility} on ${date}`);
        return report;
    }

    /**
   * Generate Z-report for a specific cash session
   * @param sessionId - Cash session ID
   * @param user - Authenticated user
   * @returns Z-report data
   */
    async zReport(sessionId: string, user: JwtUserPayload): Promise<ZReport> {
    // 1. Pronađi sesiju
        const session = await this.cashSessionModel.findById(sessionId);
        if (!session) throw new Error('Sesija nije pronađena.');
        // 2. Pronađi sve prodaje i refundove za sesiju
        const sales = await this.saleModel.find({ session: sessionId, status: { $in: ['final', 'partial_refund'] } });
        const refunds = await this.saleModel.find({ session: sessionId, status: 'refunded' });
        // 3. Agregiraj po načinu plaćanja
        const paymentTotals: PaymentTotals = {
            cash: 0,
            card: 0,
            voucher: 0,
            gift: 0,
            bank: 0,
            other: 0
        };
        for (const sale of sales) {
            for (const p of sale.payments || []) {
                const method = p.method as keyof PaymentTotals;
                if (paymentTotals.hasOwnProperty(method)) {
                    paymentTotals[method] += p.amount;
                } else {
                    paymentTotals.other += p.amount;
                }
            }
        }
        // 4. Sumarni izveštaj
        const totalSales = sales.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0);
        const totalRefunds = refunds.reduce((sum, s) => sum + (s.summary?.grandTotal || 0), 0);
    
        const report: ZReport = {
            sessionId,
            openedAt: session.openedAt,
            closedAt: session.closedAt,
            cashier: session.openedBy,
            salesCount: sales.length,
            refundCount: refunds.length,
            totalSales,
            totalRefunds,
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
