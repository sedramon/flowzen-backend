import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CashSession } from '../schemas/cash-session.schema';
import { Sale } from '../schemas/sale.schema';
import { OpenSessionDto } from '../dto/open-session.dto';
import { CloseSessionDto } from '../dto/close-session.dto';
import { CashCountingDto, CashVerificationDto, CashVarianceDto } from '../dto/cash-counting.dto';

// JWT user payload type
interface JwtUserPayload {
  userId: string;
  username: string;
  tenant: string;
  role: string;
  scopes: string[];
}

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
   * Otvaranje nove cash sesije
   */
  async openSession(dto: OpenSessionDto, user: JwtUserPayload) {
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
    const session = await this.cashSessionModel.create({
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
    });

    this.logger.log(`Otvorena nova sesija ${session.id} za usera ${user.userId} na facility ${dto.facility}`);
    return { id: session.id };
  }

  /**
   * Zatvaranje cash sesije sa profesionalnom kalkulacijom
   */
  async closeSession(id: string, dto: CloseSessionDto, user: JwtUserPayload) {
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
    
    // 5. Validacija variance (opciono - može se konfigurirati)
    if (Math.abs(variance) > 100) { // Ako je razlika veća od 100 dinara
      this.logger.warn(`Velika variance u sesiji ${id}: ${variance} dinara`);
    }
    
    // 6. Zatvori sesiju
    session.closedBy = user.userId;
    session.closedAt = new Date();
    session.closingCount = dto.closingCount;
    session.expectedCash = expectedCash;
    session.variance = variance;
    session.status = 'closed';
    session.note = dto.note;
    session.totalsByMethod = totalsByMethod;
    
    await session.save();
    
    this.logger.log(`Zatvorena sesija ${session.id} od strane ${user.userId}. Variance: ${variance}`);
    
    return {
      id: session.id,
      variance,
      expectedCash,
      closingCount: dto.closingCount,
      closedAt: session.closedAt,
      totalsByMethod,
      summary: {
        openingFloat: session.openingFloat,
        totalSales: expectedCash - session.openingFloat,
        closingCount: dto.closingCount,
        variance: variance,
        variancePercentage: expectedCash > 0 ? (variance / expectedCash) * 100 : 0
      }
    };
  }

  /**
   * Pronalaženje svih sesija sa filterima
   */
  async findAll(query: any, user: JwtUserPayload) {
    const filter: any = { tenant: user.tenant };
    if (query.status) filter.status = query.status;
    if (query.facility) filter.facility = query.facility;
    if (query.employee) filter.openedBy = query.employee;
    
    return this.cashSessionModel.find(filter).sort({ openedAt: -1 }).lean();
  }

  /**
   * Pronalaženje sesije po ID
   */
  async findById(id: string, user: JwtUserPayload) {
    const session = await this.cashSessionModel.findOne({ 
      _id: id, 
      tenant: user.tenant 
    })
    .populate('facility', 'name')
    .populate('openedBy', 'firstName lastName')
    .populate('closedBy', 'firstName lastName')
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
   * Pronalaženje trenutne aktivne sesije
   */
  async getCurrentSession(user: JwtUserPayload) {
    const session = await this.cashSessionModel.findOne({
      tenant: user.tenant,
      openedBy: user.userId,
      status: 'open'
    })
    .populate('facility', 'name')
    .populate('openedBy', 'firstName lastName')
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
   * Profesionalno brojanje novca
   */
  async countCash(sessionId: string, dto: CashCountingDto, user: JwtUserPayload) {
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
   * Verifikacija brojanja novca
   */
  async verifyCashCount(sessionId: string, dto: CashVerificationDto, user: JwtUserPayload) {
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
   * Rukovanje variance (nedostatak/višak novca)
   */
  async handleCashVariance(sessionId: string, dto: CashVarianceDto, user: JwtUserPayload) {
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
   * Profesionalna metoda za usklađivanje cash-a
   */
  async reconcileSession(sessionId: string, user: JwtUserPayload) {
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
   * Generalni POS izveštaji
   */
  async getReports(tenant: string, facility: string, dateFrom: string, dateTo: string, user: JwtUserPayload) {
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
   * Dnevni cash izveštaj
   */
  async getDailyCashReport(facility: string, date: string, user: JwtUserPayload) {
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
        id: s._id,
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
   * PROFESIONALNA METODA ZA KALKULACIJU SESIJE
   * Izračunava stvarne totals iz prodaja i refundova
   */
  private async calculateSessionTotals(sessionId: string) {
    // 1. Uzmi sesiju da dobijemo openingFloat
    const session = await this.cashSessionModel.findById(sessionId).lean();
    if (!session) {
      throw new NotFoundException('Sesija nije pronađena.');
    }
    
    // 2. Uzmi sve prodaje za ovu sesiju
    const sales = await this.saleModel.find({ session: sessionId }).lean();
    
    // 3. Inicijalizuj totals
    const totalsByMethod = {
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
    
    this.logger.log(`Session ${sessionId} calculation: Opening: ${session.openingFloat}, Cash Sales: ${totalsByMethod.cash}, Cash Refunds: ${totalRefunds}, Expected Cash: ${expectedCash}`);
    
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
   * Određuje status variance na osnovu procenta
   */
  private getVarianceStatus(variance: number, percentage: number): string {
    if (Math.abs(percentage) <= 1) return 'acceptable';
    if (Math.abs(percentage) <= 5) return 'warning';
    if (Math.abs(percentage) <= 10) return 'critical';
    return 'severe';
  }

  /**
   * Generiše preporuke za handling variance
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
   * Zatvaranje svih test sesija (samo za development)
   */
  async closeAllTestSessions(facility: string, userId: string) {
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