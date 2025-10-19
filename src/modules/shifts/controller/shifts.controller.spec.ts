import { Test, TestingModule } from '@nestjs/testing';
import { ShiftController } from './shifts.controller';
import { ShiftService } from '../service/shifts.service';

describe('ShiftController', () => {
    let controller: ShiftController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShiftController],
            providers: [
                { provide: ShiftService, useValue: {} },
            ],
        }).compile();

        controller = module.get<ShiftController>(ShiftController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
