import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdminAuditService } from './admin-audit.service';
import { AuditLog } from '../../audit/schemas/audit-log.schema';

describe('AdminAuditService', () => {
  let service: AdminAuditService;
  let auditModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };
  let queryMock: {
    sort: jest.Mock;
    skip: jest.Mock;
    limit: jest.Mock;
    populate: jest.Mock;
    lean: jest.Mock;
    exec: jest.Mock;
  };

  beforeEach(async () => {
    queryMock = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    auditModel = {
      find: jest.fn().mockReturnValue(queryMock),
      countDocuments: jest.fn().mockResolvedValue(0),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditService,
        {
          provide: getModelToken(AuditLog.name),
          useValue: auditModel,
        },
      ],
    }).compile();

    service = module.get(AdminAuditService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('applies a 24h time range filter when requested', async () => {
    const fixedNow = new Date('2025-01-15T12:00:00Z');
    jest.useFakeTimers().setSystemTime(fixedNow);

    await service.listLogs({ timeRange: '24h' });

    expect(auditModel.find).toHaveBeenCalledTimes(1);
    const filter = auditModel.find.mock.calls[0][0];
    expect(filter).toHaveProperty('createdAt');
    expect(filter.createdAt.$lte.getTime()).toBe(fixedNow.getTime());
    expect(filter.createdAt.$gte.getTime()).toBe(fixedNow.getTime() - 24 * 60 * 60 * 1000);
  });

  it('normalises a custom range when start is after end', async () => {
    const start = new Date('2025-02-10T10:00:00Z');
    const end = new Date('2025-02-05T10:00:00Z');

    await service.listLogs({ timeRange: 'custom', startDate: start, endDate: end });

    const filter = auditModel.find.mock.calls[0][0];
    expect(filter).toHaveProperty('createdAt');
    const { $gte, $lte } = filter.createdAt;
    expect($gte instanceof Date).toBe(true);
    expect($lte instanceof Date).toBe(true);
    expect($gte.getTime()).toBeLessThanOrEqual($lte.getTime());
  });

  it('does not add createdAt filter when no range is provided', async () => {
    await service.listLogs({});

    const filter = auditModel.find.mock.calls[0][0];
    expect(filter.createdAt).toBeUndefined();
  });
});
