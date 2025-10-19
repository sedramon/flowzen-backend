import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NoneFiscalProvider } from './fiscal-providers/none.provider';
import { DeviceFiscalProvider } from './fiscal-providers/device.provider';
import { CloudFiscalProvider } from './fiscal-providers/cloud.provider';
import { FiscalProvider } from './fiscal-providers/fiscal.provider';
import { Sale } from '../schemas/sale.schema';
import { FiscalLog } from '../schemas/fiscal-log.schema';
import { PosSettings } from '../schemas/pos-settings.schema';
import { JwtUserPayload, FiscalizeResult, FiscalStatus } from '../types';

/**
 * Fiscalization Service
 * 
 * Handles fiscal operations for sales including receipt generation,
 * fiscal provider management, and fiscal logging.
 */
@Injectable()
export class FiscalizationService {
    private readonly logger = new Logger(FiscalizationService.name);

    constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(FiscalLog.name) private readonly fiscalLogModel: Model<FiscalLog>,
    @InjectModel(PosSettings.name) private readonly settingsModel: Model<PosSettings>,
    ) {}

    /**
   * Get fiscal provider based on configuration
   * @param provider - Provider type ('device', 'cloud', 'none')
   * @returns Fiscal provider instance
   */
    private getProvider(provider: string): FiscalProvider {
        switch (provider) {
        case 'device':
            return new DeviceFiscalProvider();
        case 'cloud':
            return new CloudFiscalProvider();
        case 'none':
        default:
            return new NoneFiscalProvider();
        }
    }

    /**
   * Fiscalize a sale transaction
   * @param saleId - Sale ID to fiscalize
   * @param facility - Facility ID
   * @param user - Authenticated user
   * @returns Fiscalization result
   */
    async fiscalize(saleId: string, facility: string, user: JwtUserPayload): Promise<FiscalizeResult> {
        this.logger.log(`=== FISCALIZATION SERVICE START ===`);
        this.logger.log(`Sale ID: ${saleId}`);
        this.logger.log(`Facility: ${facility}`);
        this.logger.log(`User: ${user.username}`);
    
        // 1. Pronađi prodaju
        const sale = await this.saleModel.findById(saleId);
        if (!sale) {
            this.logger.error(`Sale ${saleId} not found in database`);
            throw new BadRequestException('Prodaja nije pronađena.');
        }
    
        this.logger.log(`Sale found in database: ${sale._id}`);
        this.logger.log(`Sale fiscal status: ${sale.fiscal?.status || 'none'}`);
        this.logger.log(`Sale fiscal object: ${JSON.stringify(sale.fiscal)}`);
        this.logger.log(`Sale updatedAt: ${(sale as any).updatedAt}`);
    
        // Proveri da li je pending status zastario (stariji od 5 sekundi)
        if (sale.fiscal?.status === 'pending') {
            const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);
            const saleUpdatedAt = (sale as any).updatedAt;
            this.logger.log(`Sale ${saleId} has pending status, updatedAt: ${saleUpdatedAt}, fiveSecondsAgo: ${fiveSecondsAgo}`);
      
            if (saleUpdatedAt && saleUpdatedAt < fiveSecondsAgo) {
                this.logger.warn(`Resetting stale pending fiscalization for sale ${saleId}`);
                // Koristi $unset za potpuno uklanjanje fiscal objekta
                await this.saleModel.updateOne(
                    { _id: saleId },
                    { $unset: { fiscal: 1 } }
                );
                // Ponovo učitaj sale bez fiscal objekta
                sale.fiscal = undefined;
                this.logger.log(`Successfully reset stale fiscalization for sale ${saleId}`);
            } else {
                this.logger.warn(`Fiscalization already pending for sale ${saleId} - too recent`);
                throw new BadRequestException('Fiskalizacija je u toku');
            }
        }
    
        // Proveri da li je već uspešno fiskalizovana
        if (sale.fiscal?.status === 'success') {
            this.logger.warn(`Sale ${saleId} already successfully fiscalized`);
            throw new BadRequestException('Račun je već fiskalizovan');
        }
        // 2. Pronađi podešavanja
        const posSettings = await this.settingsModel.findOne({ facility, tenant: user.tenant });
        const providerType = posSettings?.fiscalization?.provider || 'none';
        this.logger.log(`Looking for POS settings - facility: ${facility}, tenant: ${user.tenant}`);
        this.logger.log(`POS Settings found: ${posSettings ? 'yes' : 'no'}, fiscalization: ${JSON.stringify(posSettings?.fiscalization)}`);
        this.logger.log(`Using provider type: ${providerType}`);
        const provider = this.getProvider(providerType);
        this.logger.log(`Fiscalizing sale ${sale.id} with provider ${providerType}`);
    
        // 3. Postavi pending status pre fiskalizacije
        if (!sale.fiscal) {
            this.logger.log(`Setting pending status for sale ${saleId} before fiscalization`);
            sale.fiscal = {
                status: 'pending',
                correlationId: `FISC-${Date.now()}`,
                fiscalNumber: ''
            };
            await sale.save();
            this.logger.log(`Pending status set for sale ${saleId}`);
        }
        // 4. Kreiraj log
        const log = await this.fiscalLogModel.create({
            tenant: user.tenant,
            sale: sale._id,
            correlationId: 'FISC-' + Date.now(),
            status: 'pending',
            provider: providerType,
            retryCount: 0,
            requestPayload: sale,
        });
        // 5. Pokušaj fiskalizaciju sa retry logikom
        let result: FiscalizeResult | undefined;
        let error: Error | undefined;
        let status: 'pending' | 'success' | 'error' | 'retry' = 'pending';
        let fiscalNumber = '';
        for (let attempt = 0; attempt < (posSettings?.fiscalization?.retryCount || 3); attempt++) {
            try {
                result = await provider.fiscalize(sale);
                fiscalNumber = result?.fiscalNumber || '';
                status = result?.status || 'success';
                if (status === 'success') break;
            } catch (err: any) {
                error = err;
                status = 'retry';
                this.logger.error(`Fiscalization attempt ${attempt + 1} failed: ${err.message}`);
                await new Promise(res => setTimeout(res, posSettings?.fiscalization?.timeout || 2000));
            }
        }
        if (status !== 'success') {
            status = 'error';
        }
        // 6. Updejtuj log i prodaju
        log.status = status;
        log.fiscalNumber = fiscalNumber;
        log.error = error?.message || result?.error;
        log.responsePayload = result;
        log.retryCount = status === 'success' ? log.retryCount : (posSettings?.fiscalization?.retryCount || 3);
        log.processedAt = new Date();
        await log.save();
        sale.fiscal = { status, correlationId: log.correlationId, fiscalNumber };
        await sale.save();
        return { 
            status: status as FiscalStatus, 
            fiscalNumber, 
            correlationId: log.correlationId,
            error: error?.message || result?.error
        };
    }
}
