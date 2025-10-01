import { Injectable, Logger } from '@nestjs/common';
import { NoneFiscalProvider } from './fiscal-providers/none.provider';
import { DeviceFiscalProvider } from './fiscal-providers/device.provider';
import { CloudFiscalProvider } from './fiscal-providers/cloud.provider';
import { FiscalProvider } from './fiscal-providers/fiscal.provider';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from '../schemas/sale.schema';
import { FiscalLog } from '../schemas/fiscal-log.schema';
import { PosSettings } from '../schemas/pos-settings.schema';
import { BadRequestException } from '@nestjs/common';

// JWT user payload type
interface JwtUserPayload {
  userId: string;
  username: string;
  tenant: string;
  role: string;
  scopes: string[];
}

@Injectable()
export class FiscalizationService {
  private readonly logger = new Logger(FiscalizationService.name);

  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(FiscalLog.name) private readonly fiscalLogModel: Model<FiscalLog>,
    @InjectModel(PosSettings.name) private readonly settingsModel: Model<PosSettings>,
  ) {}

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

  async fiscalize(saleId: string, facility: string, user: JwtUserPayload) {
    // 1. Pronađi prodaju
    const sale = await this.saleModel.findById(saleId);
    if (!sale) throw new BadRequestException('Prodaja nije pronađena.');
    
    this.logger.log(`=== FISCALIZATION SERVICE START ===`);
    this.logger.log(`Sale ID: ${saleId}`);
    this.logger.log(`Sale fiscal status: ${sale.fiscal?.status || 'none'}`);
    this.logger.log(`Sale fiscal object: ${JSON.stringify(sale.fiscal)}`);
    this.logger.log(`Sale updatedAt: ${(sale as any).updatedAt}`);
    
    // Proveri da li je pending status zastario (stariji od 30 sekundi)
    if (sale.fiscal?.status === 'pending') {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      const saleUpdatedAt = (sale as any).updatedAt;
      this.logger.log(`Sale ${saleId} has pending status, updatedAt: ${saleUpdatedAt}, thirtySecondsAgo: ${thirtySecondsAgo}`);
      
      if (saleUpdatedAt && saleUpdatedAt < thirtySecondsAgo) {
        this.logger.warn(`Resetting stale pending fiscalization for sale ${saleId}`);
        sale.fiscal = undefined;
        await sale.save();
      } else {
        this.logger.warn(`Fiscalization already pending for sale ${saleId}`);
        throw new BadRequestException('Fiskalizacija je u toku');
      }
    }
    // 2. Pronađi podešavanja
    const posSettings = await this.settingsModel.findOne({ facility, tenant: user.tenant });
    const providerType = posSettings?.fiscalization?.provider || 'none';
    this.logger.log(`Looking for POS settings - facility: ${facility}, tenant: ${user.tenant}`);
    this.logger.log(`POS Settings found: ${posSettings ? 'yes' : 'no'}, fiscalization: ${JSON.stringify(posSettings?.fiscalization)}`);
    this.logger.log(`Using provider type: ${providerType}`);
    const provider = this.getProvider(providerType);
    this.logger.log(`Fiscalizing sale ${sale.id} with provider ${providerType}`);
    // 3. Kreiraj log
    const log = await this.fiscalLogModel.create({
      tenant: user.tenant,
      sale: sale._id,
      correlationId: 'FISC-' + Date.now(),
      status: 'pending',
      provider: providerType,
      retryCount: 0,
      requestPayload: sale,
    });
    // 4. Pokušaj fiskalizaciju sa retry logikom
    let result: import('./fiscal-providers/fiscal.provider').FiscalizeResult | undefined;
    let error: Error | undefined;
    let status: 'pending' | 'success' | 'error' | 'retry' = 'pending';
    let fiscalNumber = '';
    for (let attempt = 0; attempt < (posSettings?.fiscalization?.retryCount || 3); attempt++) {
      try {
        result = await provider.fiscalize(sale);
        fiscalNumber = result?.number || '';
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
    // 5. Updejtuj log i prodaju
    log.status = status;
    log.fiscalNumber = fiscalNumber;
    log.error = error?.message || result?.error;
    log.responsePayload = result;
    log.retryCount = status === 'success' ? log.retryCount : (posSettings?.fiscalization?.retryCount || 3);
    log.processedAt = new Date();
    await log.save();
    sale.fiscal = { status, correlationId: log.correlationId, fiscalNumber };
    await sale.save();
    return { status, fiscalNumber, correlationId: log.correlationId };
  }
}
