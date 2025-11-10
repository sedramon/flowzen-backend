import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppointmentValidationService } from './appointment-validation.service';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { WorkingShift } from 'src/modules/working-shifts/schemas/working-shift.schema';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const createFindByIdMock = (result: any) => ({
    exec: jest.fn().mockResolvedValue(result),
});

const createFindOneMock = (result: any) => ({
    exec: jest.fn().mockResolvedValue(result),
});

describe('AppointmentValidationService', () => {
    let service: AppointmentValidationService;

    const tenantModel = {
        findById: jest.fn(),
    };

    const employeeModel = {
        findById: jest.fn(),
    };

    const clientModel = {
        findById: jest.fn(),
    };

    const serviceModel = {
        findById: jest.fn(),
    };

    const facilityModel = {
        findById: jest.fn(),
    };

    const workingShiftModel = {
        findOne: jest.fn(),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentValidationService,
                { provide: getModelToken(Tenant.name), useValue: tenantModel },
                { provide: getModelToken(Employee.name), useValue: employeeModel },
                { provide: getModelToken(Client.name), useValue: clientModel },
                { provide: getModelToken(Service.name), useValue: serviceModel },
                { provide: getModelToken(Facility.name), useValue: facilityModel },
                { provide: getModelToken(WorkingShift.name), useValue: workingShiftModel },
            ],
        }).compile();

        service = module.get(AppointmentValidationService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const baselineContext = {
        tenantId: '67bcf25a3311448ed3af993f',
        employeeId: '67ca4fcd38adcf9a9b66f1cc',
        clientId: '68100214f3991ddfbc1ccc8e',
        facilityId: '6851ed521d2ae13828e97f89',
        serviceId: '68378630a21a776b72d3ea5f',
        date: '2025-01-01',
        startHour: 9,
        endHour: 10,
    };

    it('validates context when all checks pass', async () => {
        tenantModel.findById.mockReturnValue(createFindByIdMock({ _id: baselineContext.tenantId }));
        employeeModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.employeeId,
                tenant: baselineContext.tenantId,
                isActive: true,
                includeInAppoitments: true,
                facilities: [baselineContext.facilityId],
            }),
        );
        clientModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.clientId,
                tenant: baselineContext.tenantId,
            }),
        );
        facilityModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.facilityId,
                tenant: baselineContext.tenantId,
            }),
        );
        serviceModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.serviceId,
                tenant: baselineContext.tenantId,
                isActive: true,
            }),
        );
        workingShiftModel.findOne.mockReturnValue(
            createFindOneMock({
                _id: 'shift-id',
                startHour: 8,
                endHour: 12,
            }),
        );

        const result = await service.validateContext(baselineContext);
        expect(result.employee._id).toEqual(baselineContext.employeeId);
        expect(result.shiftWindow).toEqual({ startHour: 8, endHour: 12 });
    });

    it('throws NotFoundException when employee tenant does not match', async () => {
        tenantModel.findById.mockReturnValue(createFindByIdMock({ _id: baselineContext.tenantId }));
        employeeModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.employeeId,
                tenant: 'other-tenant',
                isActive: true,
                includeInAppoitments: true,
            }),
        );

        await expect(service.validateContext(baselineContext)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when employee is inactive', async () => {
        tenantModel.findById.mockReturnValue(createFindByIdMock({ _id: baselineContext.tenantId }));
        employeeModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.employeeId,
                tenant: baselineContext.tenantId,
                isActive: false,
                includeInAppoitments: true,
            }),
        );

        await expect(service.validateContext(baselineContext)).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws BadRequestException when shift is outside working hours', async () => {
        tenantModel.findById.mockReturnValue(createFindByIdMock({ _id: baselineContext.tenantId }));
        employeeModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.employeeId,
                tenant: baselineContext.tenantId,
                isActive: true,
                includeInAppoitments: true,
                facilities: [baselineContext.facilityId],
            }),
        );
        clientModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.clientId,
                tenant: baselineContext.tenantId,
            }),
        );
        facilityModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.facilityId,
                tenant: baselineContext.tenantId,
            }),
        );
        serviceModel.findById.mockReturnValue(
            createFindByIdMock({
                _id: baselineContext.serviceId,
                tenant: baselineContext.tenantId,
                isActive: true,
            }),
        );
        workingShiftModel.findOne.mockReturnValue(
            createFindOneMock({
                _id: 'shift-id',
                startHour: 12,
                endHour: 16,
            }),
        );

        await expect(service.validateContext(baselineContext)).rejects.toBeInstanceOf(BadRequestException);
    });
});

