import { Test, TestingModule } from '@nestjs/testing';
import { FiscalizationService } from '../service/fiscalization.service';
import { NoneFiscalProvider } from '../service/fiscal-providers/none.provider';
import { DeviceFiscalProvider } from '../service/fiscal-providers/device.provider';
import { CloudFiscalProvider } from '../service/fiscal-providers/cloud.provider';

describe('FiscalizationService', () => {
    let service: FiscalizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FiscalizationService],
        }).compile();
        service = module.get<FiscalizationService>(FiscalizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should select correct provider', async () => {
        expect(service['getProvider']('none')).toBeInstanceOf(NoneFiscalProvider);
        expect(service['getProvider']('device')).toBeInstanceOf(DeviceFiscalProvider);
        expect(service['getProvider']('cloud')).toBeInstanceOf(CloudFiscalProvider);
    });

    it('should return success for none provider', async () => {
        const result = await service.fiscalize({ id: '1' }, { fiscalization: { provider: 'none' } });
        expect(result.status).toBe('success');
    });

    it('should return pending/error for device/cloud provider', async () => {
        const device = await service.fiscalize({ id: '1' }, { fiscalization: { provider: 'device' } });
        expect(device.status).toBe('pending');
        const cloud = await service.fiscalize({ id: '1' }, { fiscalization: { provider: 'cloud' } });
        expect(cloud.status).toBe('pending');
    });
});
