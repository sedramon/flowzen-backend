import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale } from '../schemas/sale.schema';
import { CashSession } from '../schemas/cash-session.schema';
import { Article } from '../../articles/schema/article.schema';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { CreateSaleDto } from '../dto/sales/create-sale.dto';
import { RefundSaleDto } from '../dto/sales/refund-sale.dto';
import { User } from '../../users/schemas/user.schema';
import { FiscalizationService } from './fiscalization.service';
import { CashSessionService } from './cash-session.service';
import { JwtUserPayload } from '../types';
import { SALE_PREFIXES, FISCAL_STATUS } from '../constants';

/**
 * Sales Service
 * 
 * Handles sales transactions, refunds, and fiscal operations.
 * Manages inventory updates, appointment payments, and fiscal compliance.
 * 
 * Features:
 * - Sale creation with inventory management
 * - Refund processing with stock restoration
 * - Fiscal integration and compliance
 * - Appointment payment tracking
 * - Comprehensive error handling and logging
 */
@Injectable()
export class SalesService {
    private readonly logger = new Logger(SalesService.name);

    constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(CashSession.name) private readonly cashSessionModel: Model<CashSession>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly fiscalizationService: FiscalizationService,
    private readonly cashSessionService: CashSessionService,
    ) {}

    /**
   * Create a new sale transaction
   * 
   * @param dto - Sale creation data
   * @param user - Authenticated user
   * @returns Created sale information
   */
    async createSale(dto: CreateSaleDto, user: JwtUserPayload) {
        this.logger.log(`Creating sale for user ${user.userId} at facility ${dto.facility}`);

        try {
            // 1. Validate that there's an open session for user/facility
            const session = await this.cashSessionModel.findOne({
                tenant: user.tenant,
                facility: dto.facility,
                openedBy: user.userId,
                status: 'open',
            });
      
            if (!session) {
                throw new ForbiddenException('No open cash session found for this user and facility');
            }
      
            // 2. Check if appointment is already paid
            if (dto.appointment) {
                const existingAppointment = await this.appointmentModel.findById(dto.appointment);
                if (existingAppointment && existingAppointment.paid) {
                    throw new BadRequestException('Appointment is already paid');
                }
            }
      
            // 3. Validate stock for each product item
            for (const item of dto.items) {
                if (item.type === 'product') {
                    const article = await this.articleModel.findById(item.refId);
                    if (!article) {
                        throw new NotFoundException(`Product ${item.name} does not exist`);
                    }
                    if (article.stock < item.qty) {
                        throw new BadRequestException(`Insufficient stock for product ${item.name}`);
                    }
                }
            }
      
            // 4. Update stock for products
            for (const item of dto.items) {
                if (item.type === 'product') {
                    await this.articleModel.findByIdAndUpdate(item.refId, { 
                        $inc: { stock: -item.qty } 
                    });
                    this.logger.log(`Updated stock for product ${item.refId}: -${item.qty}`);
                }
            }
      
            // 5. Create sale record
            const saleNumber = `${SALE_PREFIXES.SALE}${Date.now()}`;
            const sale = await this.saleModel.create({
                tenant: user.tenant,
                facility: dto.facility,
                session: session._id,
                cashier: user.userId,
                appointment: dto.appointment,
                client: dto.client,
                number: saleNumber,
                date: new Date(),
                status: 'final',
                items: dto.items,
                summary: dto.summary,
                payments: dto.payments,
                fiscal: {
                    status: FISCAL_STATUS.PENDING,
                    correlationId: new Types.ObjectId().toString(),
                    fiscalNumber: ''
                }, // Fiscal objekat se postavlja sa pending statusom
                note: dto.note,
            });
      
            // 6. Mark appointment as paid if applicable and close session
            if (dto.appointment) {
                await this.appointmentModel.findByIdAndUpdate(dto.appointment, { 
                    paid: true, 
                    sale: sale._id 
                });
                this.logger.log(`Marked appointment ${dto.appointment} as paid`);
        
                // Zatvori session nakon naplate appointmenta
                if (session) {
                    await this.cashSessionService.closeSession(session._id.toString(), {
                        closingCount: dto.summary.grandTotal, // Zatvori sa stvarnim iznosom naplate
                        note: 'Session closed after appointment payment'
                    }, user);
                    this.logger.log(`Closed session ${session._id} after appointment payment with amount: ${dto.summary.grandTotal}`);
                }
            }
      
            this.logger.log(`Successfully created sale ${sale.id} for user ${user.userId} at facility ${dto.facility}`);
      
            return { 
                id: sale.id,
                number: sale.number,
                date: sale.date,
                total: dto.summary?.grandTotal || 0
            };
        } catch (error) {
            this.logger.error(`Failed to create sale: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
   * Refund a sale transaction
   * 
   * @param id - Original sale ID to refund
   * @param dto - Refund data
   * @param user - Authenticated user
   * @returns Refund transaction information
   */
    async refundSale(id: string, dto: RefundSaleDto, user: JwtUserPayload) {
        this.logger.log(`Processing refund for sale ${id} by user ${user.userId}`);

        try {
            // 1. Find original sale
            const original = await this.saleModel.findById(id);
            if (!original) {
                throw new NotFoundException('Original sale not found');
            }
      
            // 2. Validate that transaction is final
            if (original.status !== 'final') {
                throw new ForbiddenException('Only finalized transactions can be refunded');
            }

            // 3. Validate that transaction is fiscalized
            if (original.fiscal?.status !== FISCAL_STATUS.SUCCESS) {
                throw new ForbiddenException('Only fiscalized transactions can be refunded');
            }
      
            // 4. Check if refund already exists
            const existingRefund = await this.saleModel.findOne({ refundFor: id });
            if (existingRefund) {
                throw new ForbiddenException('Refund already exists for this transaction');
            }
      
            // 5. Validate refund quantities
            if (dto.items) {
                for (const item of dto.items) {
                    const origItem = original.items.find((i: any) => i.refId === item.refId);
                    if (!origItem) {
                        throw new BadRequestException(`Item/service is not part of the original sale`);
                    }
                    if (item.qty > origItem.qty) {
                        throw new BadRequestException(`Cannot refund more than was sold`);
                    }
                }
            }
      
            // 6. Restore stock for products
            if (dto.items) {
                for (const item of dto.items) {
                    const origItem = original.items.find((i: any) => i.refId === item.refId);
                    if (origItem && origItem.type === 'product') {
                        await this.articleModel.findByIdAndUpdate(item.refId, { 
                            $inc: { stock: item.qty } 
                        });
                        this.logger.log(`Restored ${item.qty} units of product ${item.refId} to inventory`);
                    }
                }
            }
      
            // 7. Construct refund items from original sale
            let refundItems = [];
            if (dto.items && dto.items.length > 0) {
                // Create refund items based on original sale items
                refundItems = dto.items.map(refundItem => {
                    const originalItem = original.items.find((item: any) => item.refId === refundItem.refId);
                    if (!originalItem) {
                        throw new BadRequestException(`Item ${refundItem.refId} not found in original sale`);
                    }
          
                    // Calculate refund amounts
                    const refundUnitPrice = originalItem.unitPrice;
                    const refundTotal = refundUnitPrice * refundItem.qty;
                    const refundTaxRate = originalItem.taxRate || 0;
                    const refundTaxAmount = refundTotal * (refundTaxRate / 100);
                    const refundDiscount = originalItem.discount || 0;
          
                    return {
                        refId: refundItem.refId,
                        type: originalItem.type,
                        name: originalItem.name,
                        qty: refundItem.qty,
                        unitPrice: refundUnitPrice,
                        total: refundTotal,
                        taxRate: refundTaxRate,
                        discount: refundDiscount,
                        amount: refundItem.amount || refundTotal
                    };
                });
            } else {
                // Full refund - use original items with negative quantities
                refundItems = original.items.map((item: any) => ({
                    ...item,
                    qty: -item.qty,
                    total: -item.total,
                    amount: -item.amount
                }));
            }
      
            // 8. Create refund sale record
            const refundNumber = `${SALE_PREFIXES.REFUND}${Date.now()}`;
            const refundCorrelationId = `${SALE_PREFIXES.FISCAL_REFUND}${Math.floor(Math.random() * 1000000)}`;
      
            const refund = await this.saleModel.create({
                tenant: original.tenant,
                facility: original.facility,
                session: original.session,
                cashier: user.userId,
                appointment: original.appointment,
                client: original.client,
                number: refundNumber,
                date: new Date(),
                status: 'final',
                items: refundItems,
                summary: dto.summary || {
                    subtotal: dto.amount || 0,
                    discountTotal: 0,
                    taxTotal: 0,
                    tip: 0,
                    grandTotal: dto.amount || 0
                },
                payments: dto.payments || [],
                fiscal: { 
                    status: FISCAL_STATUS.SUCCESS, // Refund is automatically fiscalized
                    correlationId: refundCorrelationId,
                    processedAt: new Date()
                },
                refundFor: original._id,
                note: dto.reason,
            });
      
            // 9. Mark original sale as refunded
            original.status = 'refunded';
            await original.save();
      
            this.logger.log(`Successfully refunded sale ${original.id}, refund ID: ${refund.id} by user ${user.userId}`);
      
            return { 
                id: refund.id,
                number: refund.number,
                originalSaleId: original.id,
                refundAmount: dto.summary?.grandTotal || original.summary?.grandTotal || 0
            };
        } catch (error) {
            this.logger.error(`Failed to refund sale: ${error.message}`, error.stack);
            throw error;
        }
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
            .populate({
                path: 'session',
                populate: [
                    { path: 'openedBy', select: 'name' },
                    { path: 'closedBy', select: 'name' }
                ]
            })
            .populate('cashier')
            .sort({ date: -1 })
            .lean();

        // 2. Za svaku originalnu transakciju nađi refund ako postoji
        const salesWithRefunds = await Promise.all(sales.map(async (sale) => {
            const refund = await this.saleModel.findOne({ refundFor: sale._id })
                .populate('cashier')
                .populate({
                    path: 'session',
                    populate: [
                        { path: 'openedBy', select: 'firstName lastName' },
                        { path: 'closedBy', select: 'firstName lastName' }
                    ]
                })
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
            .populate({
                path: 'session',
                populate: [
                    { path: 'openedBy', select: 'name' },
                    { path: 'closedBy', select: 'name' }
                ]
            })
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
        this.logger.log(`=== RESET FISCALIZATION START ===`);
        this.logger.log(`Sale ID: ${saleId}`);
    
        const sale = await this.saleModel.findById(saleId);
        if (!sale) {
            this.logger.error(`Sale ${saleId} not found`);
            throw new NotFoundException('Prodaja nije pronađena');
        }
    
        this.logger.log(`Sale found: ${sale._id}`);
        this.logger.log(`Current fiscal status: ${sale.fiscal?.status || 'none'}`);
        this.logger.log(`Current fiscal object: ${JSON.stringify(sale.fiscal)}`);
    
        if (!sale.fiscal) {
            this.logger.warn(`Sale ${saleId} has no fiscal object to reset`);
            throw new BadRequestException('Prodaja nema fiskalizaciju za resetovanje');
        }

        const previousStatus = sale.fiscal.status;
        this.logger.log(`Resetting fiscalization for sale ${saleId}, current status: ${previousStatus}`);
    
        // Potpuno ukloni fiscal objekat iz baze koristeći $unset
        const result = await this.saleModel.updateOne(
            { _id: saleId },
            { $unset: { fiscal: 1 } }
        );
    
        this.logger.log(`Update result: modifiedCount=${result.modifiedCount}, matchedCount=${result.matchedCount}`);
    
        if (result.modifiedCount === 0) {
            this.logger.error(`Failed to reset fiscalization for sale ${saleId}`);
            throw new BadRequestException('Greška pri resetovanju fiskalizacije');
        }
    
        // Proveri da li je stvarno uklonjen
        const updatedSale = await this.saleModel.findById(saleId);
        this.logger.log(`Sale after reset - fiscal status: ${updatedSale?.fiscal?.status || 'none'}`);
        this.logger.log(`Sale after reset - fiscal object: ${JSON.stringify(updatedSale?.fiscal)}`);
    
        this.logger.log(`Successfully reset fiscalization for sale ${saleId}, previous status: ${previousStatus}, modifiedCount: ${result.modifiedCount}`);
        this.logger.log(`=== RESET FISCALIZATION END ===`);
    
        return { 
            message: 'Fiskalizacija je resetovana. Možete ponovo pokušati.',
            saleId: saleId,
            previousStatus: previousStatus
        };
    }
}
