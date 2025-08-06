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
      .exec();
  }

  async findOneByTenant(
    id: string,
    tenant: string,
  ): Promise<Appointment | null> {
    return this.appointmentModel
      .findOne({ _id: id, tenant: new Types.ObjectId(tenant) })
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
}
