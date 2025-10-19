import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { WorkingShift } from 'src/modules/working-shifts/schemas/working-shift.schema';

@Injectable()
export class AppointmentsService {
    constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    @InjectModel(WorkingShift.name) private readonly workingShiftModel: Model<WorkingShift>,
    ) {}

    async create(
        createAppointmentDto: CreateAppointmentDto,
    ): Promise<Appointment> {
        try {
            const { employee, client, tenant, facility, service, ...appoitmentDetails } =
        createAppointmentDto;

            if (!isValidObjectId(tenant))
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const employeeDocument = await this.employeeModel
                .findOne({ _id: employee, tenant: tenant })
                .lean()
                .exec();

            if (!employeeDocument)
                throw new ConflictException(`Employee with ${employee} not found!`);

            // Check if employee works in the specified facility
            if (!employeeDocument.facilities || !employeeDocument.facilities.some(f => f.toString() === facility)) {
                throw new ConflictException(`Employee ${employee} does not work in facility ${facility}!`);
            }

            const clientDocument = await this.clientModel
                .findOne({ _id: client, tenant: tenant })
                .lean()
                .exec();

            if (!clientDocument)
                throw new ConflictException(`Client with ${client} not found!`);

            const facilityDocument = await this.facilityModel
                .findOne({ _id: facility, tenant: tenant })
                .lean()
                .exec();

            if (!facilityDocument)
                throw new ConflictException(`Facility with ${facility} not found or does not belong to this tenant!`);

            const serviceDocument = await this.serviceModel
                .findOne({ _id: service, tenant: tenant })
                .lean()
                .exec();

            if (!serviceDocument)
                throw new ConflictException(`Service with ${service} not found!`);

            // Validate working hours for the employee
            await this.validateWorkingHours(employee, facility, createAppointmentDto.date, createAppointmentDto.startHour, createAppointmentDto.endHour);

            const newAppoitments = new this.appointmentModel({
                ...appoitmentDetails,
                tenant: tenantDocument._id,
                client: clientDocument._id,
                employee: employeeDocument._id,
                facility: facilityDocument._id,
                service: serviceDocument._id,
            });

            const savedAppoitments = await newAppoitments.save();

            const populatedAppoitments = await this.appointmentModel
                .findById(savedAppoitments._id)
                .populate('client')
                .populate('service')
                .populate('employee')
                .populate('facility')
                .populate('tenant')
                .exec();

            return populatedAppoitments;
        } catch (error) {
            throw error;
        }
    }

    async bulkCreate(dtos: CreateAppointmentDto[]): Promise<Appointment[]> {
        if (!Array.isArray(dtos) || !dtos.length) {
            throw new BadRequestException('appointments array is required');
        }

        // Validate tenant consistency
        const tenant = dtos[0].tenant;
        if (!isValidObjectId(tenant)) {
            throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
        }
        const tenantDocument = await this.tenantModel.findById(tenant).exec();
        if (!tenantDocument) {
            throw new NotFoundException(`Tenant with ID ${tenant} not found`);
        }

        // Preload references for efficiency
        const employeeIds = dtos.map(d => d.employee);
        const clientIds = dtos.map(d => d.client);
        const facilityIds = dtos.map(d => d.facility);
        const serviceIds = dtos.map(d => d.service);

        const [employees, clients, facilities, services] = await Promise.all([
            this.employeeModel.find({ _id: { $in: employeeIds }, tenant }).lean().exec(),
            this.clientModel.find({ _id: { $in: clientIds }, tenant }).lean().exec(),
            this.facilityModel.find({ _id: { $in: facilityIds }, tenant }).lean().exec(),
            this.serviceModel.find({ _id: { $in: serviceIds }, tenant }).lean().exec(),
        ]);

        const employeeMap = new Map(employees.map(e => [e._id.toString(), e]));
        const clientMap = new Map(clients.map(c => [c._id.toString(), c]));
        const facilityMap = new Map(facilities.map(f => [f._id.toString(), f]));
        const serviceMap = new Map(services.map(s => [s._id.toString(), s]));

        const docs = dtos.map((d, idx) => {
            const e = employeeMap.get(d.employee);
            const c = clientMap.get(d.client);
            const f = facilityMap.get(d.facility);
            const s = serviceMap.get(d.service);
            if (!e) throw new ConflictException(`Row ${idx + 1}: employee not found`);
            if (!c) throw new ConflictException(`Row ${idx + 1}: client not found`);
            if (!f) throw new ConflictException(`Row ${idx + 1}: facility not found`);
            if (!s) throw new ConflictException(`Row ${idx + 1}: service not found`);

            // Employee must work in facility
            if (!e.facilities || !e.facilities.some((fid: any) => fid.toString() === d.facility)) {
                throw new ConflictException(`Row ${idx + 1}: employee does not work in facility`);
            }

            return {
                employee: e._id,
                client: c._id,
                facility: f._id,
                service: s._id,
                tenant: tenantDocument._id,
                startHour: d.startHour,
                endHour: d.endHour,
                date: d.date,
            } as any;
        });

        const created = await this.appointmentModel.insertMany(docs, { ordered: false });
        const ids = created.map(c => c._id);
        return this.appointmentModel
            .find({ _id: { $in: ids } })
            .populate('client')
            .populate('service')
            .populate('employee')
            .populate('facility')
            .populate('tenant')
            .exec();
    }

    async findOne(id: string): Promise<Appointment> {
        return this.appointmentModel.findById(id).exec();
    }

    async findAllWithFilters(tenant: string, facility?: string, date?: string): Promise<Appointment[]> {
        const filter: any = { tenant: new Types.ObjectId(tenant) };
    
        if (facility) {
            // Proveri da li facility pripada tenant-u
            const facilityDoc = await this.facilityModel.findOne({
                _id: facility,
                tenant: tenant
            }).exec();
      
            if (!facilityDoc) {
                throw new BadRequestException('Facility does not belong to this tenant');
            }
      
            filter.facility = new Types.ObjectId(facility);
        }
    
        if (date) {
            filter.date = date;
        }
    
        return this.appointmentModel
            .find(filter)
            .populate('client')
            .populate('service')
            .populate('employee')
            .populate('facility')
            .populate('tenant')
            .populate('sale')
            .exec();
    }

    async findOneByTenant(
        id: string,
        tenant: string,
    ): Promise<Appointment | null> {
        return this.appointmentModel
            .findOne({ _id: id, tenant: new Types.ObjectId(tenant) })
            .populate('client')
            .populate('service')
            .populate('employee')
            .populate('facility')
            .populate('tenant')
            .populate('sale')
            .exec();
    }

    async update(
        id: string,
        updateAppointmentDto: UpdateAppointmentDto,
    ): Promise<Appointment> {
        try {
            const { employee, client, tenant, facility, service, ...appoitmentDetails } =
        updateAppointmentDto;

            if (!isValidObjectId(tenant))
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            const employeeDocument = await this.employeeModel
                .findOne({ _id: employee, tenant: tenant })
                .lean()
                .exec();

            if (!employeeDocument)
                throw new ConflictException(`Employee with ${employee} not found!`);

            // Check if employee works in the specified facility
            if (!employeeDocument.facilities || !employeeDocument.facilities.some(f => f.toString() === facility)) {
                throw new ConflictException(`Employee ${employee} does not work in facility ${facility}!`);
            }

            const clientDocument = await this.clientModel
                .findOne({ _id: client, tenant: tenant })
                .lean()
                .exec();

            if (!clientDocument)
                throw new ConflictException(`Client with ${client} not found!`);

            const facilityDocument = await this.facilityModel
                .findOne({ _id: facility, tenant: tenant })
                .lean()
                .exec();

            if (!facilityDocument)
                throw new ConflictException(`Facility with ${facility} not found or does not belong to this tenant!`);

            const serviceDocument = await this.serviceModel
                .findOne({ _id: service, tenant: tenant })
                .lean()
                .exec();

            if (!serviceDocument)
                throw new ConflictException(`Service with ${service} not found!`);

            // Validate working hours for the employee if time is being updated
            if (updateAppointmentDto.startHour && updateAppointmentDto.endHour && updateAppointmentDto.date) {
                await this.validateWorkingHours(employee, facility, updateAppointmentDto.date, updateAppointmentDto.startHour, updateAppointmentDto.endHour);
            }

            return await this.appointmentModel
                .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
                .orFail(
                    () => new NotFoundException(`Appointment with id ${id} not found`),
                )
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        await this.appointmentModel.findByIdAndDelete(id).exec();
    }

    /**
   * Validates if the employee is working during the specified time period
   */
    private async validateWorkingHours(
        employeeId: string,
        facilityId: string,
        date: string,
        startHour: number,
        endHour: number
    ): Promise<void> {
    // Find working shift for the employee on the specified date and facility
        const workingShift = await this.workingShiftModel
            .findOne({
                employee: employeeId,
                facility: facilityId,
                date: date
            })
            .lean()
            .exec();

        if (!workingShift) {
            throw new BadRequestException(`Zaposleni nema definisanu smenu za ${date} u ovom objektu`);
        }

        // If no specific hours are defined, check shift type
        if (!workingShift.startHour || !workingShift.endHour) {
            // Handle predefined shift types
            const shiftHours = this.getShiftHours(workingShift.shiftType);
            if (!shiftHours) {
                throw new BadRequestException(`Tip smene '${workingShift.shiftType}' nije podržan`);
            }
      
            // Check if appointment time falls within shift hours
            if (startHour < shiftHours.start || endHour > shiftHours.end) {
                throw new BadRequestException(
                    `Termin (${startHour}-${endHour}) nije u okviru radnog vremena (${shiftHours.start}-${shiftHours.end}) za smenu '${workingShift.shiftType}'`
                );
            }
        } else {
            // Check if appointment time falls within specific working hours
            if (startHour < workingShift.startHour || endHour > workingShift.endHour) {
                throw new BadRequestException(
                    `Termin (${startHour}-${endHour}) nije u okviru radnog vremena (${workingShift.startHour}-${workingShift.endHour})`
                );
            }
        }
    }

    /**
   * Returns predefined shift hours based on shift type
   */
    private getShiftHours(shiftType: string): { start: number; end: number } | null {
        switch (shiftType) {
        case 'morning':
            return { start: 8, end: 14 };
        case 'afternoon':
            return { start: 14, end: 20 };
        case 'evening':
            return { start: 18, end: 24 };
        case 'full':
            return { start: 8, end: 20 };
        case 'custom':
            return null; // Custom shifts should have specific startHour/endHour
        default:
            return null;
        }
    }
}
