import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../schemas/appointment.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { WaitlistService } from './waitlist.service';
import { AppointmentValidationService } from './appointment-validation.service';

@Injectable()
export class AppointmentsService {
    constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    private readonly waitlistService: WaitlistService,
    private readonly appointmentValidation: AppointmentValidationService
    ) {}

    async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        try {
            const {
                employee,
                client,
                tenant,
                facility,
                service,
                date,
                startHour,
                endHour,
                ...payload
            } = createAppointmentDto;

            const context = await this.appointmentValidation.validateContext({
                tenantId: tenant,
                employeeId: employee,
                clientId: client,
                facilityId: facility,
                serviceId: service,
                date,
                startHour,
                endHour,
            });

            const newAppointment = new this.appointmentModel({
                ...payload,
                tenant: context.tenant._id,
                client: context.client._id,
                employee: context.employee._id,
                facility: context.facility._id,
                service: context.service._id,
                date: context.normalizedDate,
                startHour,
                endHour,
            } as any);

            const saved = await newAppointment.save();

            return this.appointmentModel
                .findById(saved._id)
                .populate('client')
                .populate('service')
                .populate('employee')
                .populate('facility')
                .populate('tenant')
                .exec();
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
        const contexts = await Promise.all(
            dtos.map((d, index) => {
                if (d.tenant !== tenant) {
                    throw new BadRequestException(
                        `Row ${index + 1}: tenant mismatch detected in bulk payload`,
                    );
                }

                return this.appointmentValidation
                    .validateContext({
                        tenantId: d.tenant,
                        employeeId: d.employee,
                        clientId: d.client,
                        facilityId: d.facility,
                        serviceId: d.service,
                        date: d.date,
                        startHour: d.startHour,
                        endHour: d.endHour,
                    })
                    .catch((error) => {
                        throw new BadRequestException(
                            `Row ${index + 1}: ${error.message ?? 'validation failed'}`,
                        );
                    });
            }),
        );

        const docs = contexts.map((context, idx) => {
            const dto = dtos[idx];
            return {
                tenant: context.tenant._id,
                client: context.client._id,
                employee: context.employee._id,
                facility: context.facility._id,
                service: context.service._id,
                date: context.normalizedDate,
                startHour: dto.startHour,
                endHour: dto.endHour,
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

    /**
     * Vraća sve appointmente sa filterima.
     * NE excludeuje cancelled appointmente - prikazuju se u rasporedu.
     */
    async findAllWithFilters(tenant: string, facility?: string, date?: string, clientId?: string): Promise<Appointment[]> {
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

        if (clientId) {
            filter.client = new Types.ObjectId(clientId);
        }
    
        // Handle date filtering - support both YYYY-MM-DD and ISO formats
        if (date) {
            // Support multiple date formats (YYYY-MM-DD and ISO with timezone)
            filter.date = {
                $in: [date, `${date}T00:00:00.000Z`, `${date}T23:00:00.000Z`]
            };
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
            const {
                employee,
                client,
                tenant,
                facility,
                service,
                date,
                startHour,
                endHour,
                ...payload
            } = updateAppointmentDto;

            const existing = await this.appointmentModel.findById(id).exec();

            if (!existing) {
                throw new NotFoundException(`Appointment with id ${id} not found`);
            }

            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            const context = await this.appointmentValidation.validateContext({
                tenantId: tenant,
                employeeId: employee,
                clientId: client,
                facilityId: facility,
                serviceId: service,
                date,
                startHour,
                endHour,
            });

            const updatePayload: any = {
                ...payload,
                tenant: context.tenant._id,
                employee: context.employee._id,
                client: context.client._id,
                facility: context.facility._id,
                service: context.service._id,
                date: context.normalizedDate,
                startHour,
                endHour,
            };

            const updated = await this.appointmentModel
                .findByIdAndUpdate(id, updatePayload, { new: true })
                .orFail(() => new NotFoundException(`Appointment with id ${id} not found`))
                .exec();

            return updated;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hard delete - briše appointment iz baze.
     * Koristi samo admin za potpuno uklanjanje.
     * Automatski notifikuje waitlist kada se slot oslobodi.
     */
    async delete(id: string): Promise<void> {
        // Get appointment data BEFORE deleting (need it for waitlist notification)
        const appointment = await this.appointmentModel
            .findById(id)
            .populate('employee')
            .populate('facility')
            .exec();

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        // Delete appointment from database
        await this.appointmentModel.findByIdAndDelete(id).exec();

        // Automatically notify waitlist when slot becomes available
        if (appointment?.employee && appointment?.facility) {
            const employeeId = (appointment.employee as any)._id.toString();
            const facilityId = (appointment.facility as any)._id.toString();
            
            // Run notification in background (non-blocking)
            this.waitlistService.notifyWaitlistForAvailableSlot(
                employeeId,
                facilityId,
                appointment.date,
                appointment.startHour,
                appointment.endHour
            ).catch(error => {
                console.error('[AppointmentsService] Error notifying waitlist after delete:', error);
            });
        }
    }

    /**
     * Soft delete - označava appointment kao 'cancelled' bez brisanja.
     * Koristi klijent da otkaže svoj termin.
     */
    async cancelAppointment(id: string): Promise<Appointment> {
        const appointment = await this.appointmentModel.findById(id).exec();

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        // Prevent cancellation if appointment is paid or fiscalized
        if (appointment.paid) {
            throw new BadRequestException('Cannot cancel appointment that is already paid');
        }

        if (appointment.sale?.fiscal?.status === 'success') {
            throw new BadRequestException('Cannot cancel appointment that is fiscalized');
        }

        const updated = await this.appointmentModel
            .findByIdAndUpdate(
                id,
                { cancelled: true },
                { new: true }
            )
            .exec();

        // Notify waitlist when appointment is cancelled
        if (updated) {
            // Get populated appointment to extract IDs
            const populatedAppointment = await this.appointmentModel
                .findById(id)
                .populate('employee')
                .populate('facility')
                .exec();

            if (populatedAppointment?.employee && populatedAppointment?.facility) {
                const employeeId = (populatedAppointment.employee as any)._id.toString();
                const facilityId = (populatedAppointment.facility as any)._id.toString();

                // Notify waitlist in background (don't wait for it)
                this.waitlistService.notifyWaitlistForAvailableSlot(
                    employeeId,
                    facilityId,
                    populatedAppointment.date,
                    populatedAppointment.startHour,
                    populatedAppointment.endHour
                ).catch(error => {
                    console.error('[AppointmentsService] Error notifying waitlist after cancel:', error);
                });
            }
        }

        return updated!;
    }
}
