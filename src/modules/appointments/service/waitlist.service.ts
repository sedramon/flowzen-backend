import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistEntry } from '../schemas/waitlist.schema';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { Appointment } from '../schemas/appointment.schema';
import { randomBytes } from 'crypto';

/**
 * Waitlist Service
 * 
 * Upravlja sistemom liste čekanja za termine.
 * Funkcionalnosti:
 * - Dodavanje klijenata na listu čekanja kada termin nije dostupan
 * - Obaveštavanje klijenata kada se termin oslobodi (email notifikacije)
 * - Prihvatanje termina sa liste čekanja (claim appointment)
 * - Automatsko uklanjanje ostalih sa liste kada jedan prihvati termin
 */
@Injectable()
export class WaitlistService {
    constructor(
    @InjectModel(WaitlistEntry.name)
    private readonly waitlistModel: Model<WaitlistEntry>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    ) {}

    /**
     * Dodaje klijenta na listu čekanja.
     * Proverava validnost svih entiteta (client, employee, service, facility).
     * Proverava da li klijent već nije na listi za isti time slot.
     * Proverava da li postoji appointment za taj time slot.
     */
    async addToWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<WaitlistEntry> {
        try {
            const { client, employee, service, tenant, facility, ...waitlistDetails } = createWaitlistDto;

            // Validate tenant
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            // Validate client
            const clientDocument = await this.clientModel
                .findOne({ _id: client, tenant: tenant })
                .lean()
                .exec();

            if (!clientDocument) {
                throw new ConflictException(`Client with ID ${client} not found!`);
            }

            // Validate employee
            const employeeDocument = await this.employeeModel
                .findOne({ _id: employee, tenant: tenant })
                .lean()
                .exec();

            if (!employeeDocument) {
                throw new ConflictException(`Employee with ID ${employee} not found!`);
            }

            // Check if employee works in the specified facility
            if (!employeeDocument.facilities || !employeeDocument.facilities.some(f => f.toString() === facility)) {
                throw new ConflictException(`Employee ${employee} does not work in facility ${facility}!`);
            }

            // Validate service
            const serviceDocument = await this.serviceModel
                .findOne({ _id: service, tenant: tenant })
                .lean()
                .exec();

            if (!serviceDocument) {
                throw new ConflictException(`Service with ID ${service} not found!`);
            }

            // Validate facility
            const facilityDocument = await this.facilityModel
                .findOne({ _id: facility, tenant: tenant })
                .lean()
                .exec();

            if (!facilityDocument) {
                throw new ConflictException(`Facility with ID ${facility} not found or does not belong to this tenant!`);
            }

            // Check if client is already on waitlist for this time slot
            const existingWaitlist = await this.waitlistModel
                .findOne({
                    client: client,
                    employee: employee,
                    facility: facility,
                    preferredDate: waitlistDetails.preferredDate,
                    preferredStartHour: waitlistDetails.preferredStartHour,
                    isClaimed: false
                })
                .exec();

            if (existingWaitlist) {
                throw new ConflictException('Client is already on waitlist for this time slot');
            }

            // Check if appointment already exists for this time slot
            const existingAppointment = await this.appointmentModel
                .findOne({
                    employee: employee,
                    facility: facility,
                    date: waitlistDetails.preferredDate,
                    $or: [
                        {
                            startHour: { $lt: waitlistDetails.preferredEndHour },
                            endHour: { $gt: waitlistDetails.preferredStartHour }
                        }
                    ]
                })
                .exec();

            if (existingAppointment) {
                throw new ConflictException('Time slot is already booked');
            }

            const newWaitlistEntry = new this.waitlistModel({
                ...waitlistDetails,
                client: clientDocument._id,
                employee: employeeDocument._id,
                service: serviceDocument._id,
                tenant: tenantDocument._id,
                facility: facilityDocument._id,
            });

            const savedWaitlistEntry = await newWaitlistEntry.save();

            const populatedWaitlistEntry = await this.waitlistModel
                .findById(savedWaitlistEntry._id)
                .populate('client')
                .populate('employee')
                .populate('service')
                .populate('facility')
                .populate('tenant')
                .exec();

            return populatedWaitlistEntry;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Uklanja klijenta sa liste čekanja.
     * Proverava da entry još uvek nije prihvaćen (isClaimed: false).
     */
    async removeFromWaitlist(waitlistId: string, clientId: string, tenantId: string): Promise<void> {
        const waitlistEntry = await this.waitlistModel
            .findOne({ 
                _id: waitlistId, 
                client: clientId, 
                tenant: tenantId,
                isClaimed: false 
            })
            .exec();

        if (!waitlistEntry) {
            throw new NotFoundException('Waitlist entry not found or already claimed');
        }

        await this.waitlistModel.findByIdAndDelete(waitlistId).exec();
    }

    /**
     * Vraća sve waitlist entries za određenog klijenta.
     * Koristi se da klijent vidi gde je se prijavio na čekanje.
     */
    async getClientWaitlist(clientId: string, tenantId: string): Promise<WaitlistEntry[]> {
        return this.waitlistModel
            .find({ 
                client: clientId, 
                tenant: tenantId,
                isClaimed: false 
            })
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .sort({ createdAt: 1 })
            .exec();
    }

    /**
     * Vraća sve waitlist entries za određeni time slot.
     * Koristi se kada se termin oslobodi da se pronađu svi zainteresovani klijenti.
     */
    async getWaitlistForTimeSlot(employeeId: string, facilityId: string, date: string, startHour: number, endHour: number): Promise<WaitlistEntry[]> {
        return this.waitlistModel
            .find({
                employee: employeeId,
                facility: facilityId,
                preferredDate: date,
                $or: [
                    {
                        preferredStartHour: { $lt: endHour },
                        preferredEndHour: { $gt: startHour }
                    }
                ],
                isClaimed: false
            })
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .sort({ createdAt: 1 })
            .exec();
    }

    /**
     * Obaveštava sve klijente sa liste čekanja kada se termin oslobodi.
     * Generiše unique claimToken za svakog klijenta.
     * Postavlja isNotified: true i notifiedAt timestamp.
     * 
     * PRIMER: Kada neko otkaže appointment, ova metoda se poziva,
     * generiše se claimToken za sve klijente na listi, i oni dobijaju email notifikaciju.
     */
    async notifyWaitlistForAvailableSlot(employeeId: string, facilityId: string, date: string, startHour: number, endHour: number): Promise<WaitlistEntry[]> {
        const waitlistEntries = await this.getWaitlistForTimeSlot(employeeId, facilityId, date, startHour, endHour);

        if (waitlistEntries.length === 0) {
            return [];
        }

        // Generate unique claim tokens for each entry
        const updatedEntries = await Promise.all(
            waitlistEntries.map(async (entry) => {
                const claimToken = randomBytes(32).toString('hex');
                return this.waitlistModel
                    .findByIdAndUpdate(
                        entry._id,
                        { 
                            isNotified: true, 
                            notifiedAt: new Date(),
                            claimToken: claimToken
                        },
                        { new: true }
                    )
                    .populate('client')
                    .populate('employee')
                    .populate('service')
                    .populate('facility')
                    .exec();
            })
        );

        return updatedEntries.filter(entry => entry !== null) as WaitlistEntry[];
    }

    /**
     * Prihvata termin sa liste čekanja.
     * 
     * Proces:
     * 1. Verifikuje claimToken i clientId
     * 2. Proverava da li termin još uvek postoji
     * 3. Kreira appointment
     * 4. Označava waitlist entry kao claimed
     * 5. UKLANJA SVE OSTALE waitlist entries za taj time slot (first-come-first-served)
     * 
     * PRIMER: 5 klijenata čeka. Jedan primi notifikaciju i prvi prihvati termin,
     * ostala 4 waitlist entries se automatski brišu.
     */
    async claimAppointmentFromWaitlist(claimToken: string, clientId: string): Promise<{ success: boolean; appointment?: any; message: string }> {
        const waitlistEntry = await this.waitlistModel
            .findOne({ 
                claimToken: claimToken, 
                client: clientId,
                isClaimed: false 
            })
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .exec();

        if (!waitlistEntry) {
            return { 
                success: false, 
                message: 'Invalid or expired claim token' 
            };
        }

        // Check if time slot is still available
        const existingAppointment = await this.appointmentModel
            .findOne({
                employee: waitlistEntry.employee._id,
                facility: waitlistEntry.facility._id,
                date: waitlistEntry.preferredDate,
                $or: [
                    {
                        startHour: { $lt: waitlistEntry.preferredEndHour },
                        endHour: { $gt: waitlistEntry.preferredStartHour }
                    }
                ]
            })
            .exec();

        if (existingAppointment) {
            return { 
                success: false, 
                message: 'Time slot is no longer available' 
            };
        }

        // Create appointment
        const appointmentData = {
            employee: waitlistEntry.employee._id,
            client: waitlistEntry.client._id,
            service: waitlistEntry.service._id,
            tenant: waitlistEntry.tenant._id,
            facility: waitlistEntry.facility._id,
            date: waitlistEntry.preferredDate,
            startHour: waitlistEntry.preferredStartHour,
            endHour: waitlistEntry.preferredEndHour,
            paid: false
        };

        const newAppointment = new this.appointmentModel(appointmentData);
        const savedAppointment = await newAppointment.save();

        // Mark waitlist entry as claimed
        await this.waitlistModel.findByIdAndUpdate(
            waitlistEntry._id,
            { 
                isClaimed: true, 
                claimedAt: new Date() 
            }
        ).exec();

        // Remove all other waitlist entries for this time slot
        await this.waitlistModel.deleteMany({
            employee: waitlistEntry.employee._id,
            facility: waitlistEntry.facility._id,
            preferredDate: waitlistEntry.preferredDate,
            _id: { $ne: waitlistEntry._id }
        }).exec();

        const populatedAppointment = await this.appointmentModel
            .findById(savedAppointment._id)
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .exec();

        return { 
            success: true, 
            appointment: populatedAppointment,
            message: 'Appointment successfully claimed from waitlist' 
        };
    }

    /**
     * Vraća sve waitlist entries za tenant ili facility.
     * Koristi se u admin panelu za pregled svih lista čekanja.
     */
    async getAllWaitlistEntries(tenantId: string, facilityId?: string): Promise<WaitlistEntry[]> {
        const filter: any = { tenant: new Types.ObjectId(tenantId) };
        
        if (facilityId) {
            filter.facility = new Types.ObjectId(facilityId);
        }

        return this.waitlistModel
            .find(filter)
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .sort({ createdAt: 1 })
            .exec();
    }
}
