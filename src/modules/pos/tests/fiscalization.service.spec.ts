import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FiscalizationService } from '../service/fiscalization.service';
import { NoneFiscalProvider } from '../service/fiscal-providers/none.provider';
import { DeviceFiscalProvider } from '../service/fiscal-providers/device.provider';
import { CloudFiscalProvider } from '../service/fiscal-providers/cloud.provider';
import { Sale } from '../schemas/sale.schema';
import { FiscalLog } from '../schemas/fiscal-log.schema';
import { PosSettings } from '../schemas/pos-settings.schema';

describe('FiscalizationService', () => {
    let service: FiscalizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FiscalizationService,
                { provide: getModelToken(Sale.name), useValue: {} },
                { provide: getModelToken(FiscalLog.name), useValue: {} },
                { provide: getModelToken(PosSettings.name), useValue: {} },
            ],
        }).compile();

        service = module.get<FiscalizationService>(FiscalizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should select correct provider', () => {
        expect(service['getProvider']('none')).toBeInstanceOf(NoneFiscalProvider);
        expect(service['getProvider']('device')).toBeInstanceOf(DeviceFiscalProvider);
        expect(service['getProvider']('cloud')).toBeInstanceOf(CloudFiscalProvider);
    });
});
