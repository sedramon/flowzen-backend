import { Test, TestingModule } from '@nestjs/testing';
import { WorkingShiftsController } from './working-shifts.controller';
import { WorkingShiftService } from '../service/working-shift.service';

describe('WorkingShiftsController', () => {
    let controller: WorkingShiftsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkingShiftsController],
            providers: [
                { provide: WorkingShiftService, useValue: {} },
            ],
        }).compile();

        controller = module.get<WorkingShiftsController>(WorkingShiftsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
