import { Test, TestingModule } from '@nestjs/testing';
import { WorkingShiftService } from './working-shift.service';

describe('WorkingShiftService', () => {
  let service: WorkingShiftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkingShiftService],
    }).compile();

    service = module.get<WorkingShiftService>(WorkingShiftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
