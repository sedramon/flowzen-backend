import { Test, TestingModule } from '@nestjs/testing';
import { WorkingShiftsController } from './working-shifts.controller';

describe('WorkingShiftsController', () => {
  let controller: WorkingShiftsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkingShiftsController],
    }).compile();

    controller = module.get<WorkingShiftsController>(WorkingShiftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
