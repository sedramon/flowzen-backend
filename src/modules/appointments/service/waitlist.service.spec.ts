import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { WaitlistService } from './waitlist.service';
import { Appointment } from '../schemas/appointment.schema';
import { WaitlistEntry } from '../schemas/waitlist.schema';
import { AppointmentValidationService } from './appointment-validation.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

const createPopulateQuery = (result: any) => {
    const chain: any = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(result),
    };
    return chain;
};

const createSaveMock = (id: string) =>
    jest.fn().mockResolvedValue({
        _id: id,
    });

describe('WaitlistService', () => {
    let service: WaitlistService;
    let waitlistModel: any;
    let appointmentModel: any;
    const sampleIds = {
        tenant: '68d84e453c19bcd5edb269cd',
        employee: '68dbbfa0f47ceeb61f5975e7',
        client: '68dbbfa0f47ceeb61f5975ec',
        facility: '68d855f9f07f767dc2582ba2',
        service: '68dbbfa0f47ceeb61f5975df',
    };
    const appointmentValidationService = {
        validateContext: jest.fn(),
        checkShift: jest.fn(),
    };
    const connection: Partial<Connection> = {
        startSession: jest.fn(),
    };

    beforeEach(async () => {
        waitlistModel = jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({ _id: 'waitlist-entry-id' }),
        }));
        waitlistModel.findOne = jest.fn();
        waitlistModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
        waitlistModel.updateMany = jest.fn().mockResolvedValue({});
        waitlistModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });

        appointmentModel = jest.fn().mockImplementation((data) => ({
            ...data,
            save: createSaveMock('appointment-id'),
        }));
        appointmentModel.deleteMany = jest.fn().mockResolvedValue({});
        appointmentModel.findById = jest.fn().mockReturnValue(createPopulateQuery({ _id: 'appointment-id' }));

        (connection.startSession as jest.Mock).mockResolvedValue({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitlistService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
                { provide: getModelToken(WaitlistEntry.name), useValue: waitlistModel },
                { provide: getModelToken(Appointment.name), useValue: appointmentModel },
                { provide: AppointmentValidationService, useValue: appointmentValidationService },
                { provide: getConnectionToken(), useValue: connection },
            ],
        }).compile();

        service = module.get(WaitlistService);

        jest.spyOn<any, any>(service, 'findConflictingAppointment').mockResolvedValue(null);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws BadRequestException when claim token is invalid', async () => {
        waitlistModel.findOne.mockReturnValue(createPopulateQuery(null));

        await expect(service.claimAppointmentFromWaitlist('invalid-token')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('throws ConflictException when waitlist entry is already claimed', async () => {
        waitlistModel.findOne.mockReturnValue(
            createPopulateQuery({
                _id: 'waitlist-entry-id',
                isClaimed: true,
                client: 'client-id',
            }),
        );

        await expect(service.claimAppointmentFromWaitlist('token')).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws BadRequestException when claim token expired', async () => {
        waitlistModel.findOne.mockReturnValue(
            createPopulateQuery({
                _id: 'waitlist-entry-id',
                isClaimed: false,
                claimTokenExpiresAt: new Date(Date.now() - 60_000),
                client: 'client-id',
            }),
        );

        await expect(service.claimAppointmentFromWaitlist('token')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('completes claim when slot available', async () => {
        const waitlistEntry = {
            _id: 'waitlist-entry-id',
            isClaimed: false,
            client: sampleIds.client,
            employee: sampleIds.employee,
            service: sampleIds.service,
            facility: sampleIds.facility,
            tenant: sampleIds.tenant,
            preferredDate: '2025-01-01',
            preferredStartHour: 9,
            preferredEndHour: 10,
        };

        waitlistModel.findOne.mockReturnValue(createPopulateQuery(waitlistEntry));

        appointmentValidationService.validateContext.mockResolvedValue({
            tenant: { _id: sampleIds.tenant },
            employee: { _id: sampleIds.employee },
            client: { _id: sampleIds.client },
            facility: { _id: sampleIds.facility },
            service: { _id: sampleIds.service },
            workingShift: { _id: 'shift-id' },
            shiftWindow: { startHour: 8, endHour: 12 },
            normalizedDate: '2025-01-01',
        });

        const result = await service.claimAppointmentFromWaitlist('token');

        expect(result.success).toBeTruthy();
        expect(appointmentValidationService.validateContext).toHaveBeenCalled();
        expect(waitlistModel.findByIdAndUpdate).toHaveBeenCalledWith(
            waitlistEntry._id,
            expect.objectContaining({
                $set: expect.objectContaining({ isClaimed: true }),
            }),
            expect.any(Object),
        );
        expect(waitlistModel.deleteMany).toHaveBeenCalled();
    });

    it('throws ConflictException when appointment exists during claim', async () => {
        const waitlistEntry = {
            _id: 'waitlist-entry-id',
            isClaimed: false,
            client: sampleIds.client,
            employee: sampleIds.employee,
            service: sampleIds.service,
            facility: sampleIds.facility,
            tenant: sampleIds.tenant,
            preferredDate: '2025-01-01',
            preferredStartHour: 9,
            preferredEndHour: 10,
        };

        waitlistModel.findOne.mockReturnValue(createPopulateQuery(waitlistEntry));

        appointmentValidationService.validateContext.mockResolvedValue({
            tenant: { _id: sampleIds.tenant },
            employee: { _id: sampleIds.employee },
            client: { _id: sampleIds.client },
            facility: { _id: sampleIds.facility },
            service: { _id: sampleIds.service },
            workingShift: { _id: 'shift-id' },
            shiftWindow: { startHour: 8, endHour: 12 },
            normalizedDate: '2025-01-01',
        });

        (service as any).findConflictingAppointment.mockResolvedValueOnce({ _id: 'existing-appointment' });

        await expect(service.claimAppointmentFromWaitlist('token')).rejects.toBeInstanceOf(ConflictException);
    });
});

