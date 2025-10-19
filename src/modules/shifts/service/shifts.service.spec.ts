import { Test, TestingModule } from '@nestjs/testing';
import { ShiftService } from './shifts.service';

describe('ShiftService', () => {
    let service: ShiftService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: ShiftService, useValue: {} },
            ],
        }).compile();
        service = module.get<ShiftService>(ShiftService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
