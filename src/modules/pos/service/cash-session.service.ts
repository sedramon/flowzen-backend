import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CashSession } from '../schemas/cash-session.schema';
import { Sale } from '../schemas/sale.schema';
import { OpenSessionDto } from '../dto/sessions/open-session.dto';
import { CloseSessionDto } from '../dto/sessions/close-session.dto';
import { CashCountingDto, CashVerificationDto, CashVarianceDto } from '../dto/sessions/cash-counting.dto';
import {
    JwtUserPayload,
    CashSessionSummary,
    PaymentTotals,
    PosApiResponse
} from '../types';

/**
 * Cash Session Service
 * 
 * Handles all cash session operations including opening, closing,
 * cash counting, verification, and reconciliation.
 */
@Injectable()
export class CashSessionService {
    private readonly logger = new Logger(CashSessionService.name);

    constructor(
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    ) {}

    // ============================================================================
    // CORE SESSION MANAGEMENT
    // ============================================================================

    /**
   * Open new cash session
   * @param dto - Session opening data
   * @param user - Authenticated user
   * @returns Created session ID
   */
    async openSession(dto: OpenSessionDto, user: JwtUserPayload): Promise<{ id: string }> {
    
        // 1. Proveri da li već postoji otvorena sesija za ovog usera i facility
        const existing = await this.cashSessionModel.findOne({
            tenant: user.tenant,
            facility: dto.facility,
            openedBy: user.userId,
            status: 'open',
        });
    
        if (existing) {
            throw new ForbiddenException('Već postoji otvorena sesija za ovog korisnika u ovoj lokaciji.');
        }

        // 2. Kreiraj novu sesiju
        const sessionData = {
            tenant: user.tenant,
            facility: dto.facility,
            openedBy: user.userId,
            openedAt: new Date(),
            openingFloat: dto.openingFloat,
            status: 'open',
            note: dto.note,
            totalsByMethod: { cash: 0, card: 0, voucher: 0, gift: 0, bank: 0, other: 0 },
            expectedCash: dto.openingFloat,
            variance: 0,
        };
    
        const session = await this.cashSessionModel.create(sessionData);
        return { id: session.id };
    }

    /**
   * Close cash session with professional calculations
   * @param id - Session ID
   * @param dto - Session closing data
   * @param user - Authenticated user
   * @returns Session closing summary
   */
    async closeSession(id: string, dto: CloseSessionDto, user: JwtUserPayload): Promise<CashSessionSummary> {
    
        // 1. Pronađi sesiju
        const session = await this.cashSessionModel.findOne({ _id: id, tenant: user.tenant }).exec();
        if (!session) throw new NotFoundException('Sesija nije pronađena.');
        if (session.status === 'closed') throw new ForbiddenException('Sesija je već zatvorena.');
    
    
        // 2. Proveri da li user ima pravo da zatvori (može samo onaj ko je otvorio ili admin)
        if (String(session.openedBy) !== String(user.userId) && !user.scopes?.includes('scope_pos_admin')) {
            throw new ForbiddenException('Nemate pravo da zatvorite ovu sesiju.');
        }
    
        // 3. Izračunaj stvarne totals iz prodaja i refundova
        const { totalsByMethod, expectedCash } = await this.calculateSessionTotals(id);
    
        // 4. Izračunaj variance
        const variance = dto.closingCount - expectedCash;
        const variancePercentage = expectedCash > 0 ? (variance / expectedCash) * 100 : 0;
    
        // 5. Validacija variance (opciono - može se konfigurirati)
        if (Math.abs(variance) > 100) { // Ako je razlika veća od 100 dinara
            this.logger.warn(`Velika variance u sesiji ${id}: ${variance} dinara`);
        }
    
        // 6. Zatvori sesiju
        const updateData = {
            closedBy: user.userId,
            closedAt: new Date(),
            closingCount: dto.closingCount,
            expectedCash: expectedCash,
            variance: variance,
            status: 'closed',
            note: dto.note,
            totalsByMethod: totalsByMethod
        };
    
        await this.cashSessionModel.updateOne(
            { _id: id },
            { $set: updateData }
        );
    
        return {
            id: id,
            variance,
            expectedCash,
            closingCount: dto.closingCount,
            closedAt: new Date(),
            totalsByMethod,
            summary: {
                openingFloat: session.openingFloat,
                totalSales: expectedCash - session.openingFloat,
                closingCount: dto.closingCount,
                variance: variance,
                variancePercentage: variancePercentage
            }
        };
    }

    /**
   * Find all sessions with filters
   * @param query - Query parameters
   * @param user - Authenticated user
   * @returns Array of sessions
   */
    async findAll(query: any, user: JwtUserPayload): Promise<CashSession[]> {
        const filter: any = { tenant: user.tenant };
        if (query.status) filter.status = query.status;
        if (query.facility) filter.facility = query.facility;
        if (query.employee) filter.openedBy = query.employee;
    
        const sessions = await this.cashSessionModel.find(filter)
            .populate('facility', 'name')
            .populate('openedBy', 'name email')
            .populate('closedBy', 'name email')
            .sort({ openedAt: -1 })
            .lean();
    
        return sessions;
    }

    /**
   * Find session by ID
   * @param id - Session ID
   * @param user - Authenticated user
   * @returns Session details
   */
    async findById(id: string, user: JwtUserPayload): Promise<CashSession & { calculatedTotals?: any }> {
        const session = await this.cashSessionModel.findOne({ 
            _id: id, 
            tenant: user.tenant 
        })
            .populate('facility', 'name')
            .populate('openedBy', 'name email')
            .populate('closedBy', 'name email')
            .lean();

        if (!session) {
            throw new NotFoundException('Sesija nije pronađena.');
        }

        // Ako je sesija zatvorena, dodaj kalkulacije
        if (session.status === 'closed') {
            const { totalsByMethod, expectedCash, totalSales, totalRefunds } = await this.calculateSessionTotals(id);
      
            return {
                ...session,
                calculatedTotals: {
                    totalsByMethod,
                    expectedCash,
                    totalSales,
                    totalRefunds,
                    netTotal: totalSales - totalRefunds
                }
            };
        }

        return session;
    }

    /**
   * Get current active session
   * @param user - Authenticated user
   * @param facility - Optional facility filter
   * @returns Current session or null
   */
    async getCurrentSession(user: JwtUserPayload, facility?: string): Promise<CashSession | null> {
        const filter: any = {
            tenant: user.tenant,
            openedBy: user.userId,
            status: 'open'
        };
    
        if (facility) {
            filter.facility = facility;
        }
    
        const session = await this.cashSessionModel.findOne(filter)
            .populate('facility', 'name')
            .populate('openedBy', 'name email')
            .lean();
    
    
        if (!session) {
            return null; // Nema aktivne sesije
        }
    
        return session;
    }

    // ============================================================================
    // CASH COUNTING & VERIFICATION
    // ============================================================================

    /**
   * Professional cash counting
   * @param sessionId - Session ID
   * @param dto - Cash counting data
   * @param user - Authenticated user
   * @returns Cash counting results
   */
    async countCash(sessionId: string, dto: CashCountingDto, user: JwtUserPayload): Promise<{
    sessionId: string;
    expectedCash: number;
    countedCash: number;
    variance: number;
    variancePercentage: number;
    status: string;
    recommendations: string[];
  }> {
        const session = await this.cashSessionModel.findById(sessionId);
        if (!session) throw new NotFoundException('Sesija nije pronađena.');
        if (session.status === 'closed') throw new ForbiddenException('Sesija je već zatvorena.');
    
        // Izračunaj expected cash
        const { expectedCash } = await this.calculateSessionTotals(sessionId);
    
        // Izračunaj variance
        const variance = dto.countedCash - expectedCash;
    
        // Validacija variance
        const variancePercentage = expectedCash > 0 ? (variance / expectedCash) * 100 : 0;
    
        return {
            sessionId,
            expectedCash,
            countedCash: dto.countedCash,
            variance,
            variancePercentage,
            status: this.getVarianceStatus(variance, variancePercentage),
            recommendations: this.getVarianceRecommendations(variance, variancePercentage)
        };
    }

    /**
   * Verify cash count
   * @param sessionId - Session ID
   * @param dto - Cash verification data
   * @param user - Authenticated user
   * @returns Verification results
   */
    async verifyCashCount(sessionId: string, dto: CashVerificationDto, user: JwtUserPayload): Promise<{
    sessionId: string;
    verified: boolean;
    expectedCash: number;
    actualCash: number;
    variance: number;
    variancePercentage: number;
    timestamp: Date;
  }> {
        const session = await this.cashSessionModel.findById(sessionId);
        if (!session) throw new NotFoundException('Sesija nije pronađena.');
    
        const { expectedCash } = await this.calculateSessionTotals(sessionId);
        const variance = dto.actualCash - expectedCash;
    
        // Ažuriraj sesiju sa verifikovanim podacima
        session.closingCount = dto.actualCash;
        session.expectedCash = expectedCash;
        session.variance = variance;
        session.note = dto.note || session.note;
    
        await session.save();
    
        return {
            sessionId,
            verified: true,
            expectedCash,
            actualCash: dto.actualCash,
            variance,
            variancePercentage: expectedCash > 0 ? (variance / expectedCash) * 100 : 0,
            timestamp: new Date()
        };
    }

    /**
   * Handle cash variance (shortage/excess)
   * @param sessionId - Session ID
   * @param dto - Variance handling data
   * @param user - Authenticated user
   * @returns Variance handling results
   */
    async handleCashVariance(sessionId: string, dto: CashVarianceDto, user: JwtUserPayload): Promise<{
    sessionId: string;
    action: string;
    variance: number;
    reason: string;
    timestamp: Date;
    handledBy: string;
  }> {
        const session = await this.cashSessionModel.findById(sessionId);
        if (!session) throw new NotFoundException('Sesija nije pronađena.');
    
        const { expectedCash } = await this.calculateSessionTotals(sessionId);
        const variance = dto.actualCash - expectedCash;
    
        // Log variance za audit
        this.logger.warn(`Cash variance in session ${sessionId}: ${variance} dinara. Reason: ${dto.reason}`);
    
        // Ažuriraj sesiju
        session.closingCount = dto.actualCash;
        session.expectedCash = expectedCash;
        session.variance = variance;
        session.note = `${session.note || ''}\nVariance handled: ${dto.action} - ${dto.reason}`.trim();
    
        await session.save();
    
        return {
            sessionId,
            action: dto.action,
            variance,
            reason: dto.reason,
            timestamp: new Date(),
            handledBy: user.userId
        };
    }

    // ============================================================================
    // CASH RECONCILIATION
    // ============================================================================

    /**
   * Professional cash reconciliation method
   * @param sessionId - Session ID
   * @param user - Authenticated user
   * @returns Reconciliation results
   */
    async reconcileSession(sessionId: string, user: JwtUserPayload): Promise<{
    sessionId: string;
    openingFloat: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
    totalsByMethod: PaymentTotals;
    summary: {
      totalSales: number;
      totalRefunds: number;
      netSales: number;
      cashFlow: {
        opening: number;
        sales: number;
        refunds: number;
        expected: number;
        actual: number;
        variance: number;
      };
    };
  }> {
        const session = await this.cashSessionModel.findById(sessionId);
        if (!session) throw new NotFoundException('Sesija nije pronađena.');
    
        const { totalsByMethod, expectedCash, totalSales, totalRefunds } = await this.calculateSessionTotals(sessionId);
    
        return {
            sessionId,
            openingFloat: session.openingFloat,
            expectedCash,
            actualCash: session.closingCount || 0,
            variance: (session.closingCount || 0) - expectedCash,
            totalsByMethod,
            summary: {
                totalSales,
                totalRefunds,
                netSales: totalSales - totalRefunds,
                cashFlow: {
                    opening: session.openingFloat,
                    sales: totalsByMethod.cash,
                    refunds: 0, // Refundovi se oduzimaju od cash
                    expected: expectedCash,
                    actual: session.closingCount || 0,
                    variance: (session.closingCount || 0) - expectedCash
                }
            }
        };
    }

    // ============================================================================
    // CASH REPORTS
    // ============================================================================

    /**
   * General POS reports
   * @param tenant - Tenant ID
   * @param facility - Facility ID
   * @param dateFrom - Start date
   * @param dateTo - End date
   * @param user - Authenticated user
   * @returns POS reports data
   */
    async getReports(tenant: string, facility: string, dateFrom: string, dateTo: string, user: JwtUserPayload): Promise<any> {
    // Mock podaci za sada - treba implementirati pravu logiku
        return {
            summary: {
                totalSales: 15000,
                totalRefunds: 500,
                netTotal: 14500,
                totalTransactions: 25,
                averageTransaction: 580
            },
            dailyBreakdown: [
                { date: '2025-01-20', sales: 5000, refunds: 100, net: 4900, transactions: 8 },
                { date: '2025-01-21', sales: 7000, refunds: 200, net: 6800, transactions: 12 },
                { date: '2025-01-22', sales: 3000, refunds: 200, net: 2800, transactions: 5 }
            ],
            paymentMethods: {
                cash: 8000,
                card: 5000,
                voucher: 1000,
                gift: 500,
                bank: 0,
                other: 0
            },
            topServices: [
                { name: 'Šišanje', count: 15, revenue: 7500 },
                { name: 'Pranje kose', count: 20, revenue: 4000 },
                { name: 'Feniranje', count: 10, revenue: 3000 }
            ]
        };
    }

    /**
   * Daily cash report
   * @param facility - Facility ID
   * @param date - Report date
   * @param user - Authenticated user
   * @returns Daily cash report data
   */
    async getDailyCashReport(facility: string, date: string, user: JwtUserPayload): Promise<{
    date: string;
    facility: string;
    sessionCount: number;
    summary: {
      totalOpeningFloat: number;
      totalExpectedCash: number;
      totalActualCash: number;
      totalVariance: number;
      variancePercentage: number;
    };
    totalsByMethod: PaymentTotals;
    sessions: Array<{
      id: string;
      openedBy: string;
      closedBy: string;
      openedAt: Date;
      closedAt: Date;
      openingFloat: number;
      expectedCash: number;
      actualCash: number;
      variance: number;
    }>;
  }> {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
    
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    
        const sessions = await this.cashSessionModel.find({
            tenant: user.tenant,
            facility: facility,
            status: 'closed',
            closedAt: { $gte: startDate, $lte: endDate }
        }).lean();
    
        let totalOpeningFloat = 0;
        let totalExpectedCash = 0;
        let totalActualCash = 0;
        let totalVariance = 0;
        const totalsByMethod = {
            cash: 0,
            card: 0,
            voucher: 0,
            gift: 0,
            bank: 0,
            other: 0
        };
    
        for (const session of sessions) {
            totalOpeningFloat += session.openingFloat || 0;
            totalExpectedCash += session.expectedCash || 0;
            totalActualCash += session.closingCount || 0;
            totalVariance += session.variance || 0;
      
            // Dodaj totals po metodama
            if (session.totalsByMethod) {
                Object.keys(totalsByMethod).forEach(method => {
                    totalsByMethod[method] += session.totalsByMethod[method] || 0;
                });
            }
        }
    
        return {
            date,
            facility,
            sessionCount: sessions.length,
            summary: {
                totalOpeningFloat,
                totalExpectedCash,
                totalActualCash,
                totalVariance,
                variancePercentage: totalExpectedCash > 0 ? (totalVariance / totalExpectedCash) * 100 : 0
            },
            totalsByMethod,
            sessions: sessions.map(s => ({
                id: s._id.toString(),
                openedBy: s.openedBy,
                closedBy: s.closedBy,
                openedAt: s.openedAt,
                closedAt: s.closedAt,
                openingFloat: s.openingFloat,
                expectedCash: s.expectedCash,
                actualCash: s.closingCount,
                variance: s.variance
            }))
        };
    }

    // ============================================================================
    // CORE CALCULATION METHODS
    // ============================================================================

    /**
   * PROFESSIONAL SESSION CALCULATION METHOD
   * Calculates actual totals from sales and refunds
   * @param sessionId - Session ID
   * @returns Session totals calculation
   */
    private async calculateSessionTotals(sessionId: string): Promise<{
    totalsByMethod: PaymentTotals;
    expectedCash: number;
    totalSales: number;
    totalRefunds: number;
    netTotal: number;
    openingFloat: number;
  }> {
    // 1. Uzmi sesiju da dobijemo openingFloat
        const session = await this.cashSessionModel.findById(sessionId).lean();
        if (!session) {
            throw new NotFoundException('Sesija nije pronađena.');
        }
    
        // 2. Uzmi sve prodaje za ovu sesiju
        const sales = await this.saleModel.find({ session: sessionId }).lean();
    
        // 3. Initialize totals with proper typing
        const totalsByMethod: PaymentTotals = {
            cash: 0,
            card: 0,
            voucher: 0,
            gift: 0,
            bank: 0,
            other: 0
        };
    
        let totalSales = 0;
        let totalRefunds = 0;
    
        // 4. Procesiraj svaku prodaju
        for (const sale of sales) {
            if (sale.status === 'final' || sale.status === 'refunded') {
                // Dodaj prodaju
                if (sale.payments && Array.isArray(sale.payments)) {
                    for (const payment of sale.payments) {
                        const method = payment.method || 'cash';
                        const amount = Number(payment.amount) || 0;
            
                        if (totalsByMethod.hasOwnProperty(method)) {
                            totalsByMethod[method] += amount;
                        } else {
                            totalsByMethod.other += amount;
                        }
            
                        totalSales += amount;
                    }
                }
            }
        }
    
        // 5. Uzmi sve refundove za ovu sesiju
        const refunds = await this.saleModel.find({ 
            session: sessionId, 
            refundFor: { $exists: true } 
        }).lean();
    
        // 6. Procesiraj refundove (ODUZMI od totals)
        for (const refund of refunds) {
            if (refund.status === 'final') {
                if (refund.payments && Array.isArray(refund.payments)) {
                    for (const payment of refund.payments) {
                        const method = payment.method || 'cash';
                        const amount = Number(payment.amount) || 0;
            
                        if (totalsByMethod.hasOwnProperty(method)) {
                            totalsByMethod[method] -= amount;
                        } else {
                            totalsByMethod.other -= amount;
                        }
            
                        totalRefunds += amount;
                    }
                }
            }
        }
    
        // 7. PROFESIONALNA KALKULACIJA: expectedCash = openingFloat + cash sales - cash refunds
        const expectedCash = session.openingFloat + totalsByMethod.cash;
    
        return {
            totalsByMethod,
            expectedCash,
            totalSales,
            totalRefunds,
            netTotal: totalSales - totalRefunds,
            openingFloat: session.openingFloat
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
   * Determine variance status based on percentage
   * @param variance - Cash variance amount
   * @param percentage - Variance percentage
   * @returns Status string
   */
    private getVarianceStatus(variance: number, percentage: number): 'acceptable' | 'warning' | 'critical' | 'severe' {
        if (Math.abs(percentage) <= 1) return 'acceptable';
        if (Math.abs(percentage) <= 5) return 'warning';
        if (Math.abs(percentage) <= 10) return 'critical';
        return 'severe';
    }

    /**
   * Generate recommendations for handling variance
   * @param variance - Cash variance amount
   * @param percentage - Variance percentage
   * @returns Array of recommendations
   */
    private getVarianceRecommendations(variance: number, percentage: number): string[] {
        const recommendations = [];
    
        if (Math.abs(percentage) > 5) {
            recommendations.push('Preporučuje se ponovno brojanje novca');
        }
    
        if (Math.abs(percentage) > 10) {
            recommendations.push('Obavezno istraživanje uzroka variance');
            recommendations.push('Kontaktirajte menadžera');
        }
    
        if (variance > 0) {
            recommendations.push('Višak novca - proverite da li su svi računi pravilno uneti');
        } else if (variance < 0) {
            recommendations.push('Nedostatak novca - proverite da li su svi računi pravilno uneti');
        }
    
        return recommendations;
    }

    // ============================================================================
    // TEST METHODS (za development)
    // ============================================================================

    /**
   * Close all test sessions (development only)
   * @param facility - Facility ID
   * @param userId - User ID
   * @returns Number of closed sessions
   */
    async closeAllTestSessions(facility: string, userId: string): Promise<number> {
        const filter: any = { status: 'open' };
        if (facility) filter.facility = facility;
        if (userId) filter.openedBy = userId;
    
        const sessions = await this.cashSessionModel.find(filter);
        let closed = 0;
    
        for (const session of sessions) {
            session.status = 'closed';
            session.closedAt = new Date();
            await session.save();
            closed++;
        }
    
        return closed;
    }
}