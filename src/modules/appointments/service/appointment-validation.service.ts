import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { WorkingShift } from 'src/modules/working-shifts/schemas/working-shift.schema';
import { resolveEntityId } from '../utils/reference.util';

type ObjectIdLike = string | Types.ObjectId | null | undefined;

export interface ValidateContextParams {
    tenantId: ObjectIdLike;
    employeeId: ObjectIdLike;
    clientId: ObjectIdLike;
    facilityId: ObjectIdLike;
    serviceId: ObjectIdLike;
    date: string | Date;
    startHour: number;
    endHour: number;
}

export interface ShiftValidationResult {
    isWithinShift: boolean;
    message?: string;
    shift?: WorkingShift;
    startHour?: number;
    endHour?: number;
}

export interface ValidatedAppointmentContext {
    tenant: Tenant;
    employee: Employee;
    client: Client;
    facility: Facility;
    service: Service;
    workingShift: WorkingShift;
    shiftWindow: { startHour: number; endHour: number };
    normalizedDate: string;
}

export interface ShiftWindowDescription {
    hasShift: boolean;
    startHour?: number;
    endHour?: number;
    shiftType?: string;
}

@Injectable()
export class AppointmentValidationService {
    constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    @InjectModel(WorkingShift.name) private readonly workingShiftModel: Model<WorkingShift>,
    ) {}

    async validateContext(params: ValidateContextParams): Promise<ValidatedAppointmentContext> {
        const tenantId = this.ensureObjectId(params.tenantId, 'tenant');
        const employeeId = this.ensureObjectId(params.employeeId, 'employee');
        const clientId = this.ensureObjectId(params.clientId, 'client');
        const facilityId = this.ensureObjectId(params.facilityId, 'facility');
        const serviceId = this.ensureObjectId(params.serviceId, 'service');

        const [tenant, employee, client, facility, service] = await Promise.all([
            this.tenantModel.findById(tenantId).exec(),
            this.employeeModel.findById(employeeId).exec(),
            this.clientModel.findById(clientId).exec(),
            this.facilityModel.findById(facilityId).exec(),
            this.serviceModel.findById(serviceId).exec(),
        ]);

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${tenantId.toString()} not found`);
        }

        if (!employee) {
            throw new NotFoundException(
                `Employee ${employeeId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        const employeeTenantId = resolveEntityId(employee.tenant);
        if (employeeTenantId !== tenantId.toString()) {
            throw new NotFoundException(
                `Employee ${employeeId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        if (!employee.isActive) {
            throw new ConflictException('Zaposleni nije aktivan.');
        }

        if (!employee.includeInAppoitments) {
            throw new ConflictException('Zaposleni nije dostupan za zakazivanje termina.');
        }

        if (!client) {
            throw new NotFoundException(
                `Client ${clientId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        const clientTenantId = resolveEntityId(client.tenant);
        if (clientTenantId !== tenantId.toString()) {
            throw new NotFoundException(
                `Client ${clientId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        if (!facility) {
            throw new NotFoundException(
                `Facility ${facilityId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        const facilityTenantId = resolveEntityId(facility.tenant);
        if (facilityTenantId !== tenantId.toString()) {
            throw new NotFoundException(
                `Facility ${facilityId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        if (
            employee.facilities &&
            employee.facilities.length &&
            !employee.facilities.some((assigned) => resolveEntityId(assigned) === facilityId.toString())
        ) {
            throw new ConflictException('Zaposleni ne radi u izabranoj lokaciji.');
        }

        if (!service) {
            throw new NotFoundException(
                `Service ${serviceId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        const serviceTenantId = resolveEntityId(service.tenant);
        if (serviceTenantId !== tenantId.toString()) {
            throw new NotFoundException(
                `Service ${serviceId.toString()} not found for tenant ${tenantId.toString()}`,
            );
        }

        if (!service.isActive) {
            throw new ConflictException('Usluga nije aktivna i ne može se zakazati.');
        }

        const normalizedDate = this.normalizeDate(params.date);
        const shiftCheck = await this.checkShift(
            {
                employeeId: employeeId.toString(),
                facilityId: facilityId.toString(),
                tenantId: tenantId.toString(),
                date: normalizedDate,
                startHour: params.startHour,
                endHour: params.endHour,
            },
            { throwOnFail: true },
        );

        if (!shiftCheck.shift || shiftCheck.startHour === undefined || shiftCheck.endHour === undefined) {
            throw new BadRequestException('Ne može se odrediti radno vreme za odabranu smenu.');
        }

        return {
            tenant,
            employee,
            client,
            facility,
            service,
            workingShift: shiftCheck.shift,
            shiftWindow: {
                startHour: shiftCheck.startHour,
                endHour: shiftCheck.endHour,
            },
            normalizedDate,
        };
    }

    async checkShift(
        params: {
            employeeId: string;
            facilityId: string;
            tenantId: string;
            date: string | Date;
            startHour: number;
            endHour: number;
        },
        options: { throwOnFail?: boolean } = {},
    ): Promise<ShiftValidationResult> {
        const normalizedDate = this.normalizeDate(params.date);
        const tenantId = this.ensureObjectId(params.tenantId, 'tenant');
        const employeeId = this.ensureObjectId(params.employeeId, 'employee');
        const facilityId = this.ensureObjectId(params.facilityId, 'facility');

        const shift = await this.workingShiftModel
            .findOne({
                tenant: tenantId,
                employee: employeeId,
                facility: facilityId,
                date: normalizedDate,
            })
            .exec();

        if (!shift) {
            const message = `Zaposleni nema definisanu smenu za ${normalizedDate} u ovoj lokaciji.`;
            return this.handleShiftFailure(options, message);
        }

        const window = this.resolveShiftWindow(shift);

        if (params.startHour < window.startHour || params.endHour > window.endHour) {
            const message = `Termin (${this.formatHourRange(
                params.startHour,
                params.endHour,
            )}) je van radnog vremena smene (${this.formatHourRange(
                window.startHour,
                window.endHour,
            )}).`;
            return this.handleShiftFailure(options, message, shift, window);
        }

        return {
            isWithinShift: true,
            shift,
            startHour: window.startHour,
            endHour: window.endHour,
        };
    }

    async describeShift(params: {
        tenantId: ObjectIdLike;
        employeeId: ObjectIdLike;
        facilityId: ObjectIdLike;
        date: string | Date;
    }): Promise<ShiftWindowDescription> {
        const tenantId = this.ensureObjectId(params.tenantId, 'tenant');
        const employeeId = this.ensureObjectId(params.employeeId, 'employee');
        const facilityId = this.ensureObjectId(params.facilityId, 'facility');
        const normalizedDate = this.normalizeDate(params.date);

        const shift = await this.workingShiftModel
            .findOne({
                tenant: tenantId,
                employee: employeeId,
                facility: facilityId,
                date: normalizedDate,
            })
            .exec();

        if (!shift) {
            return { hasShift: false };
        }

        const window = this.resolveShiftWindow(shift);

        return {
            hasShift: true,
            startHour: window.startHour,
            endHour: window.endHour,
            shiftType: shift.shiftType,
        };
    }

    normalizeDate(date: string | Date): string {
        if (!date) {
            throw new BadRequestException('Datum je obavezan.');
        }

        if (date instanceof Date) {
            if (Number.isNaN(date.getTime())) {
                throw new BadRequestException('Datum nije validan.');
            }
            return date.toISOString().split('T')[0];
        }

        const parsed = new Date(date);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        return date.includes('T') ? date.split('T')[0] : date;
    }

    private resolveShiftWindow(shift: WorkingShift): { startHour: number; endHour: number } {
        if (shift.startHour != null && shift.endHour != null) {
            return { startHour: shift.startHour, endHour: shift.endHour };
        }

        const preset = this.getPresetShiftWindow(shift.shiftType);

        if (!preset) {
            throw new BadRequestException(
                `Smenski tip '${shift.shiftType}' nije podržan dok ne definišete radno vreme.`,
            );
        }

        return preset;
    }

    private getPresetShiftWindow(
        shiftType: string,
    ): { startHour: number; endHour: number } | null {
        switch (shiftType) {
        case 'morning':
            return { startHour: 8, endHour: 14 };
        case 'afternoon':
            return { startHour: 14, endHour: 20 };
        case 'evening':
            return { startHour: 18, endHour: 24 };
        case 'full':
            return { startHour: 8, endHour: 20 };
        case 'custom':
            return null;
        default:
            return null;
        }
    }

    private handleShiftFailure(
        options: { throwOnFail?: boolean },
        message: string,
        shift?: WorkingShift,
        window?: { startHour: number; endHour: number },
    ): ShiftValidationResult {
        if (options.throwOnFail !== false) {
            throw new BadRequestException(message);
        }

        return {
            isWithinShift: false,
            message,
            shift,
            startHour: window?.startHour,
            endHour: window?.endHour,
        };
    }

    private ensureObjectId(value: ObjectIdLike, field: string): Types.ObjectId {
        if (!value) {
            throw new BadRequestException(`${field} je obavezan parametar.`);
        }

        if (value instanceof Types.ObjectId) {
            return value;
        }

        if (Types.ObjectId.isValid(value)) {
            return new Types.ObjectId(value);
        }

        throw new BadRequestException(`${field} mora biti validan identifikator.`);
    }

    private formatHourRange(start: number, end: number): string {
        return `${this.formatHour(start)} - ${this.formatHour(end)}`;
    }

    private formatHour(hour: number): string {
        const h = Math.floor(hour);
        const minutes = Math.round((hour - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

}
