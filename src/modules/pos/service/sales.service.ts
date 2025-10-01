import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale } from '../schemas/sale.schema';
import { CashSession } from '../schemas/cash-session.schema';
import { Article } from '../../articles/schema/article.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { RefundSaleDto } from '../dto/refund-sale.dto';
import { User } from '../../users/schemas/user.schema';
import { FiscalizationService } from './fiscalization.service';

// JWT user payload type
interface JwtUserPayload {
  userId: string;
  username: string;
  tenant: string;
  role: string;
  scopes: string[];
}

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly fiscalizationService: FiscalizationService,
  ) {}

  async createSale(dto: CreateSaleDto, user: JwtUserPayload) {
    // 1. Proveri da li postoji otvorena sesija za usera/facility
    const session = await this.cashSessionModel.findOne({
      tenant: user.tenant,
      facility: dto.facility,
      openedBy: user.userId,
      status: 'open',
    });
    if (!session) throw new ForbiddenException('Nema otvorene blagajničke sesije.');
    
    // 2. Proveri da li je appointment već naplaćen
    if (dto.appointment) {
      const existingAppointment = await this.appointmentModel.findById(dto.appointment);
      if (existingAppointment && existingAppointment.paid) {
        throw new BadRequestException('Termin je već naplaćen.');
      }
    }
    
    // 3. Proveri stock za svaki artikal
    for (const item of dto.items) {
      if (item.type === 'product') {
        const article = await this.articleModel.findById(item.refId);
        if (!article) throw new NotFoundException(`Artikal ${item.name} ne postoji.`);
        if (article.stock < item.qty) throw new BadRequestException(`Nema dovoljno zaliha za artikal ${item.name}.`);
      }
    }
    
    // 4. Ažuriraj stock
    for (const item of dto.items) {
      if (item.type === 'product') {
        await this.articleModel.findByIdAndUpdate(item.refId, { $inc: { stock: -item.qty } });
      }
    }
    
    // 5. Kreiraj prodaju
    const sale = await this.saleModel.create({
      tenant: user.tenant,
      facility: dto.facility,
      session: session._id,
      cashier: user.userId,
      appointment: dto.appointment,
      client: dto.client,
      number: 'POS-' + Date.now(),
      date: new Date(),
      status: 'final',
      items: dto.items,
      summary: dto.summary,
      payments: dto.payments,
      fiscal: { status: 'pending', correlationId: '' },
      note: dto['note'],
    });
    
    // 6. Ako je vezano za appointment, označi kao paid
    if (dto.appointment) {
      await this.appointmentModel.findByIdAndUpdate(dto.appointment, { paid: true, sale: sale._id });
    }
    
    this.logger.log(`Kreirana prodaja ${sale.id} za usera ${user.userId} na facility ${dto.facility}`);
    return { id: sale.id };
  }

  async refundSale(id: string, dto: RefundSaleDto, user: JwtUserPayload) {
    // 1. Pronađi originalnu prodaju
    const original = await this.saleModel.findById(id);
    if (!original) throw new NotFoundException('Originalna prodaja nije pronađena.');
    
    // 2. Proveri da li je transakcija završena
    if (original.status !== 'final') {
      throw new ForbiddenException('Može se refundirati samo završena transakcija.');
    }

    // 3. Proveri da li je transakcija fiskalizovana
    if (original.fiscal?.status !== 'done') {
      throw new ForbiddenException('Može se refundirati samo fiskalizovana transakcija.');
    }
    
    // 4. Proveri da li već postoji refund
    const existingRefund = await this.saleModel.findOne({ refundFor: id });
    if (existingRefund) {
      throw new ForbiddenException('Već postoji refund za ovu transakciju.');
    }
    
    // 5. Proveri količine
    if (dto.items) {
      for (const item of dto.items) {
        const origItem = original.items.find((i: any) => i.refId === item.refId);
        if (!origItem) throw new BadRequestException(`Artikal/usluga nije deo originalne prodaje.`);
        if (item.qty > origItem.qty) throw new BadRequestException(`Ne možeš refundirati više nego što je prodato.`);
      }
    }
    
    // 6. Vraćanje stock-a (inventory movement)
    if (dto.items) {
      for (const item of dto.items) {
        const origItem = original.items.find((i: any) => i.refId === item.refId);
        if (origItem && origItem.type === 'product') {
          await this.articleModel.findByIdAndUpdate(item.refId, { $inc: { stock: item.qty } });
          this.logger.log(`Vraćeno ${item.qty} komada artikla u zalihe`);
        }
      }
    }
    
    // 7. Kreiraj refund prodaju
    const refund = await this.saleModel.create({
      tenant: original.tenant,
      facility: original.facility,
      session: original.session,
      cashier: user.userId,
      appointment: original.appointment,
      client: original.client,
      number: 'REF-' + Date.now(),
      date: new Date(),
      status: 'final',
      items: dto.items || original.items,
      summary: dto.summary || original.summary,
      payments: dto.payments || [],
      fiscal: { 
        status: 'done', // Refund je automatski fiskalizovan
        correlationId: 'REF-FISC-' + Math.floor(Math.random()*1000000) 
      },
      refundFor: original._id,
      note: dto.reason,
    });
    
    // 8. Obeleži originalnu prodaju kao refundiranu
    original.status = 'refunded';
    await original.save();
    
    this.logger.log(`Refundirana prodaja ${original.id} refund id ${refund.id} od strane ${user.userId}`);
    return { id: refund.id };
  }

  async findAll(query: any, user: JwtUserPayload) {
    const filter: any = { tenant: user.tenant };
    if (query.status) filter.status = query.status;
    if (query.facility) filter.facility = query.facility;
    if (query.client) filter.client = query.client;

    // 1. Uzmi sve originalne transakcije (ne refund)
    filter.refundFor = { $exists: false };
    
    const sales = await this.saleModel.find(filter)
      .populate('appointment')
      .populate('client')
      .populate('facility')
      .populate('session')
      .populate('cashier')
      .sort({ date: -1 })
      .lean();

    // 2. Za svaku originalnu transakciju nađi refund ako postoji
    const salesWithRefunds = await Promise.all(sales.map(async (sale) => {
      const refund = await this.saleModel.findOne({ refundFor: sale._id })
        .populate('cashier')
        .lean();

      return {
        ...sale,
        refund: refund || null
      };
    }));

    return salesWithRefunds;
  }

  async findById(id: string, user: JwtUserPayload) {
    const sale = await this.saleModel.findById(id)
      .populate('appointment')
      .populate('client')
      .populate('facility')
      .populate('session')
      .populate('cashier')
      .lean();
    return sale;
  }

  async fiscalize(saleId: string, facility: string, user: JwtUserPayload) {
    const sale = await this.saleModel.findById(saleId);
    if (!sale) throw new NotFoundException('Prodaja nije pronađena');
    
    this.logger.log(`=== FISCALIZATION START ===`);
    this.logger.log(`Sale ID: ${saleId}`);
    this.logger.log(`Facility: ${facility}`);
    this.logger.log(`User: ${user.username}`);
    this.logger.log(`Current fiscal status: ${sale.fiscal?.status || 'none'}`);
    this.logger.log(`Sale fiscal object: ${JSON.stringify(sale.fiscal)}`);
    
    // Proveri da li je već uspešno fiskalizovana
    if (sale.fiscal?.status === 'success') {
      this.logger.log(`Sale ${saleId} already successfully fiscalized`);
      throw new BadRequestException('Račun je već fiskalizovan');
    }
    
    // Ako je fiskalizacija bila neuspešna, omogući ponovni pokušaj
    if (sale.fiscal?.status === 'error') {
      this.logger.log(`Sale ${saleId} had failed fiscalization, allowing retry`);
      // Ukloni postojeći fiscal status da omogućimo ponovni pokušaj
      sale.fiscal = undefined;
      await sale.save();
      this.logger.log(`Fiscal status cleared for sale ${saleId}`);
    }

    this.logger.log(`Calling fiscalization service for sale ${saleId}`);
    // Pozovi fiskalizaciju servis direktno
    const result = await this.fiscalizationService.fiscalize(saleId, facility, user);
    
    this.logger.log(`Fiscalized sale ${saleId}: ${result.status}`);
    this.logger.log(`=== FISCALIZATION END ===`);
    return {
      id: sale.id,
      fiscal: {
        status: result.status,
        correlationId: result.correlationId,
        fiscalNumber: result.fiscalNumber
      }
    };
  }

  async getReceipt(id: string, user: JwtUserPayload) {
    // TODO: Implement receipt generation
    return '<html><body>Receipt stub</body></html>';
  }

  async resetPendingFiscalizations(tenant: string) {
    // Resetuj sve pending fiskalizacije starije od 10 minuta
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const result = await this.saleModel.updateMany(
      {
        tenant,
        'fiscal.status': 'pending',
        updatedAt: { $lt: tenMinutesAgo }
      },
      {
        $unset: { fiscal: 1 }
      }
    );

    this.logger.log(`Reset ${result.modifiedCount} stale pending fiscalizations for tenant ${tenant}`);
    return { resetCount: result.modifiedCount };
  }

  async resetFiscalization(saleId: string, user: JwtUserPayload) {
    const sale = await this.saleModel.findById(saleId);
    if (!sale) throw new NotFoundException('Prodaja nije pronađena');
    
    if (!sale.fiscal) {
      throw new BadRequestException('Prodaja nema fiskalizaciju za resetovanje');
    }

    this.logger.log(`Resetting fiscalization for sale ${saleId}, current status: ${sale.fiscal.status}`);
    
    sale.fiscal = undefined;
    await sale.save();
    
    return { 
      message: 'Fiskalizacija je resetovana. Možete ponovo pokušati.',
      saleId: sale.id,
      previousStatus: sale.fiscal?.status || 'unknown'
    };
  }
}
