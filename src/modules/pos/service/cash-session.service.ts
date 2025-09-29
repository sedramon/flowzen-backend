import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
export class CashSessionService {
  private readonly logger = new Logger(CashSessionService.name);

  constructor(
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
  ) {}

  async openSession(dto: any, user: JwtUserPayload) {
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

  async closeSession(id: string, dto: any, user: JwtUserPayload) {
    // 1. Pronađi sesiju
    const session = await this.cashSessionModel.findOne({ _id: id, tenant: user.tenant }).exec();
    if (!session) throw new NotFoundException('Sesija nije pronađena.');
    if (session.status === 'closed') throw new ForbiddenException('Sesija je već zatvorena.');
    // 2. Proveri da li user ima pravo da zatvori (može samo onaj ko je otvorio ili admin)
    if (String(session.openedBy) !== String(user.userId) && !user.scopes?.includes('scope_pos_admin')) {
      throw new ForbiddenException('Nemate pravo da zatvorite ovu sesiju.');
    }
    // 3. Pronađi sve prodaje i refundove vezane za ovu sesiju
    // (Ovo je simplifikacija, u pravoj implementaciji koristi Sale model)
    // const sales = await this.saleModel.find({ session: id });
    // const refunds = await this.refundModel.find({ session: id });
    // 4. Izračunaj totalsByMethod i expectedCash
    // (Za sada dummy, kasnije izračunati iz prodaja i refundova)
    const totalsByMethod = session.totalsByMethod || { cash: 0, card: 0, voucher: 0, gift: 0, bank: 0, other: 0 };
    const expectedCash = session.openingFloat + (totalsByMethod.cash || 0);
    const variance = dto.closingCount - expectedCash;
    // 5. Zatvori sesiju
    session.closedBy = user.userId;
    session.closedAt = new Date();
    session.closingCount = dto.closingCount;
    session.expectedCash = expectedCash;
    session.variance = variance;
    session.status = 'closed';
    session.note = dto.note;
    session.totalsByMethod = totalsByMethod;
    await session.save();
    this.logger.log(`Zatvorena sesija ${session.id} od strane ${user.userId}`);
    return {
      id: session.id,
      variance,
      expectedCash,
      closingCount: dto.closingCount,
      closedAt: session.closedAt,
    };
  }

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

  async findAll(query: any, user: JwtUserPayload) {
    const filter: any = { tenant: user.tenant };
    if (query.status) filter.status = query.status;
    if (query.facility) filter.facility = query.facility;
    if (query.employee) filter.openedBy = query.employee;
    return this.cashSessionModel.find(filter).sort({ openedAt: -1 }).lean();
  }

  async findById(id: string, user: any) {
    // TODO: Implement find session by id
    return {};
  }
}
