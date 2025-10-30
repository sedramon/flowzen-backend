import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types, Connection } from 'mongoose';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistEntry } from '../schemas/waitlist.schema';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';
import { Appointment } from '../schemas/appointment.schema';
import { randomBytes } from 'crypto';
import { generateWaitlistNotificationEmail } from '../templates/waitlist-notification.template';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                            WAITLIST SERVICE                                   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║ Upravlja kompleksnim sistemom liste čekanja za termine                      ║
 * ║                                                                               ║
 * ║ GLAVNE FUNKCIONALNOSTI:                                                      ║
 * ║ 1. Dodavanje klijenata na listu čekanja                                     ║
 * ║ 2. Automatsko obaveštavanje email-om kada se termin oslobodi                ║
 * ║ 3. Prihvatanje termina sa liste čekanja (claim appointment)                 ║
 * ║ 4. Automatsko uklanjanje konkurenata kada jedan prihvati termin             ║
 * ║ 5. Provera statusa slota (zauzet/slobodan)                                  ║
 * ║                                                                               ║
 * ║ POSLOVNI TOK:                                                                ║
 * ║ Klijent traži zauzet termin → Dodaje se na waitlist → Admin obriše/otkaže   ║
 * ║ → Sistem proverava da li je CELI slot slobodan → Šalje email notifikaciju   ║
 * ║ → Klijent prihvata → Appointment se kreira → Ostali se uklanjaju sa liste   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Injectable()
export class WaitlistService {
    private readonly logger = new Logger(WaitlistService.name);
    private readonly WEBHOOK_URL: string;
    private readonly FRONTEND_URL: string;
    
    constructor(
    @InjectModel(WaitlistEntry.name)
    private readonly waitlistModel: Model<WaitlistEntry>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(Service.name) private readonly serviceModel: Model<Service>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
    @InjectModel(Facility.name) private readonly facilityModel: Model<Facility>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection
    ) {
        // Initialize URLs from environment variables
        this.WEBHOOK_URL = this.configService.get<string>('WEBHOOK_URL');
        this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS (Private)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Pronalazi appointment koji se preklapa sa datim time slotom.
     * Centralizovana funkcija za proveru konflikta - koristi se svuda u servisu.
     */
    private async findConflictingAppointment(
        employeeId: string,
        facilityId: string,
        date: string,
        startHour: number,
        endHour: number
    ): Promise<Appointment | null> {
        return this.appointmentModel
            .findOne({
                employee: employeeId,
                facility: facilityId,
                date: date,
                $or: [
                    {
                        startHour: { $lt: endHour },
                        endHour: { $gt: startHour }
                    }
                ],
                cancelled: false
            })
            .lean()
            .exec();
    }

    /**
     * Proverava da li je time slot zauzet postojećim appointmentom.
     */
    private async checkSlotStatus(
        employeeId: string,
        facilityId: string,
        date: string,
        startHour: number,
        endHour: number
    ): Promise<{ isOccupied: boolean; statusMessage: string }> {
        const existingAppointment = await this.findConflictingAppointment(
            employeeId,
            facilityId,
            date,
            startHour,
            endHour
        );

        return {
            isOccupied: !!existingAppointment,
            statusMessage: existingAppointment
                ? 'Slot je trenutno zauzet. Prijavili ste se na listu čekanja.'
                : 'Slot je slobodan. Nema zakazanih termina.'
        };
    }

    /**
     * Validira sve entitete potrebne za kreiranje waitlist entry.
     * Bacaj exception ako bilo koji entitet nije validan.
     */
    private async validateWaitlistEntities(dto: CreateWaitlistDto): Promise<void> {
        const { client, employee, service, tenant, facility } = dto;

            // Validate tenant
            if (!isValidObjectId(tenant)) {
                throw new BadRequestException(`Invalid tenant ID: ${tenant}`);
            }

            const tenantDocument = await this.tenantModel.findById(tenant).exec();
            if (!tenantDocument) {
                throw new NotFoundException(`Tenant with ID ${tenant} not found`);
            }

            // Validate client
            // First check if client exists at all
            const clientExists = await this.clientModel.findById(client).lean().exec();
            if (!clientExists) {
                throw new NotFoundException(`Client with ID ${client} does not exist!`);
            }
            
            // Then check if client belongs to the specified tenant
            const clientDocument = await this.clientModel.findOne({ _id: client, tenant }).lean().exec();
            if (!clientDocument) {
                throw new NotFoundException(
                    `Client with ID ${client} not found for tenant ${tenant}. ` +
                    `The client may belong to a different tenant.`
                );
            }

            // Validate employee
            const employeeExists = await this.employeeModel.findById(employee).lean().exec();
            if (!employeeExists) {
                throw new NotFoundException(`Employee with ID ${employee} does not exist!`);
            }
            
            const employeeDocument = await this.employeeModel.findOne({ _id: employee, tenant }).lean().exec();
            if (!employeeDocument) {
                throw new NotFoundException(
                    `Employee with ID ${employee} not found for tenant ${tenant}. ` +
                    `The employee may belong to a different tenant.`
                );
            }

            // Check if employee works in the specified facility
            if (!employeeDocument.facilities || !employeeDocument.facilities.some(f => f.toString() === facility)) {
                throw new ConflictException(`Employee ${employee} does not work in facility ${facility}!`);
            }

            // Validate service
            const serviceExists = await this.serviceModel.findById(service).lean().exec();
            if (!serviceExists) {
                throw new NotFoundException(`Service with ID ${service} does not exist!`);
            }
            
            const serviceDocument = await this.serviceModel.findOne({ _id: service, tenant }).lean().exec();
            if (!serviceDocument) {
                throw new NotFoundException(
                    `Service with ID ${service} not found for tenant ${tenant}. ` +
                    `The service may belong to a different tenant.`
                );
            }

            // Validate facility
            const facilityExists = await this.facilityModel.findById(facility).lean().exec();
            if (!facilityExists) {
                throw new NotFoundException(`Facility with ID ${facility} does not exist!`);
            }
            
            const facilityDocument = await this.facilityModel.findOne({ _id: facility, tenant }).lean().exec();
            if (!facilityDocument) {
                throw new NotFoundException(
                    `Facility with ID ${facility} not found for tenant ${tenant}. ` +
                    `The facility may belong to a different tenant.`
                );
            }
    }

    /**
     * Helper funkcija za retry sa exponential backoff.
     * Pokušava izvršiti async funkciju do maxRetries puta sa eksponencijalnim delayem.
     * 
     * @param fn - Async funkcija koju treba izvršiti
     * @param maxRetries - Maksimalan broj pokušaja (default: 3)
     * @param baseDelay - Bazni delay u milisekundama (default: 1000ms = 1s)
     * @returns Promise sa rezultatom funkcije
     * @throws Error ako svi pokušaji ne uspeju
     */
    private async retryWithExponentialBackoff<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;
                
                if (attempt < maxRetries - 1) {
                    // Exponential backoff: 1s, 2s, 4s, 8s, ...
                    const delay = baseDelay * Math.pow(2, attempt);
                    this.logger.warn(`Retry ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`, {
                        attempt: attempt + 1,
                        maxRetries,
                        delay,
                        error: lastError.message
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    this.logger.error(`All ${maxRetries} retry attempts exhausted`, lastError.stack);
                }
            }
        }

        throw lastError!;
    }

    /**
     * Šalje email notifikaciju klijentu o dostupnom terminu preko webhook-a.
     * Centralizovana funkcija za slanje email-ova sa retry logikom.
     * 
     * Retry mehanizam:
     * - Maksimalno 3 pokušaja
     * - Exponential backoff: 1s → 2s → 4s
     * - Loguje svaki pokušaj i finalni rezultat
     */
    private async sendWaitlistNotificationEmail(
        entry: WaitlistEntry,
        claimLink: string
    ): Promise<void> {
        const populatedClient = entry.client as any;
        const populatedEmployee = entry.employee as any;
        const populatedService = entry.service as any;
        const populatedFacility = entry.facility as any;

        const clientName = `${populatedClient?.firstName || ''} ${populatedClient?.lastName || ''}`.trim() || 'Klijent';
        const clientEmail = populatedClient?.contactEmail || 'N/A';

        this.logger.log(`Starting email notification`, {
            context: 'EmailNotification',
            clientName,
            clientEmail,
            service: populatedService?.name
        });

        try {
            let formattedDate = entry.preferredDate;
            if (formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }

            const htmlBody = generateWaitlistNotificationEmail({
                claimLink,
                client: populatedClient,
                employee: populatedEmployee,
                service: populatedService,
                facility: populatedFacility,
                formattedDate,
                startHour: entry.preferredStartHour,
                endHour: entry.preferredEndHour,
                titleText: 'Vaš termin je dostupan!'
            });

            // HTML generated

            const webhookPayload = {
                clientName,
                clientEmail,
                htmlBody
            };

            // Sending webhook payload

            // Retry mehanizam: 3 pokušaja sa exponential backoff
            await this.retryWithExponentialBackoff(async () => {
                const response = await fetch(this.WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                });

                if (!response.ok) {
                    throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);
                }

                this.logger.log(`Email notification sent successfully`, {
                    context: 'EmailNotification',
                    clientName,
                    clientEmail,
                    status: response.status
                });
                return response;
            }, 3, 1000);

        } catch (error) {
            this.logger.error(`Failed to send email notification after all retries`, error.stack, {
                context: 'EmailNotification',
                clientName,
                clientEmail,
                error: error.message
            });
            // Ne bacamo error dalje - ne želimo da blokiramo ostatak logike
        }
    }

    /**
     * Obogaćuje waitlist entries sa informacijom o statusu slota.
     * Koristi bulk query da izbegne N+1 problem.
     */
    private async enrichWaitlistEntriesWithSlotStatus(entries: any[]): Promise<any[]> {
        if (entries.length === 0) return [];

        const appointmentQueries = entries.map(entry => ({
            employee: (entry.employee as any)._id || entry.employee,
            facility: (entry.facility as any)._id || entry.facility,
            date: entry.preferredDate,
                    $or: [
                        {
                    startHour: { $lt: entry.preferredEndHour },
                    endHour: { $gt: entry.preferredStartHour }
                }
            ],
            cancelled: false
        }));

        const conflictingAppointments = await this.appointmentModel
            .find({
                $or: appointmentQueries
            })
                .lean()
                .exec();

        return entries.map(entry => {
            const employeeId = (entry.employee as any)._id || entry.employee;
            const facilityId = (entry.facility as any)._id || entry.facility;
            
            const isOccupied = conflictingAppointments.some(apt => 
                apt.employee.toString() === employeeId.toString() &&
                apt.facility.toString() === facilityId.toString() &&
                apt.date === entry.preferredDate &&
                apt.startHour < entry.preferredEndHour &&
                apt.endHour > entry.preferredStartHour
            );

            return {
                ...entry,
                slotStatus: isOccupied
                    ? 'Slot je trenutno zauzet. Prijavili ste se na listu čekanja.'
                    : 'Slot je slobodan. Nema zakazanih termina.',
                isSlotOccupied: isOccupied
            };
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CRUD OPERATIONS - Dodavanje i upravljanje waitlist entries
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Dodaje klijenta na listu čekanja.
     * Validira sve entitete, proverava duplikate, i vraća entry sa slot statusom.
     */
    async addToWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<WaitlistEntry> {
        try {
            const { client, employee, service, tenant, facility, ...waitlistDetails } = createWaitlistDto;

            // Validate all entities
            await this.validateWaitlistEntities(createWaitlistDto);

            // Check if client already on waitlist for this exact slot
            const existingWaitlistEntry = await this.waitlistModel
                .findOne({
                    client,
                    employee,
                    facility,
                    preferredDate: waitlistDetails.preferredDate,
                    preferredStartHour: waitlistDetails.preferredStartHour,
                    preferredEndHour: waitlistDetails.preferredEndHour,
                    isClaimed: false
                })
                .lean()
                .exec();

            if (existingWaitlistEntry) {
                throw new ConflictException('Client is already on the waitlist for this time slot');
            }

            // Check slot status (but allow adding even if occupied - that's the point of waitlist!)
            const slotStatus = await this.checkSlotStatus(
                employee,
                facility,
                waitlistDetails.preferredDate,
                waitlistDetails.preferredStartHour,
                waitlistDetails.preferredEndHour
            );

            // Create new waitlist entry
            const newWaitlistEntry = new this.waitlistModel({
                client,
                employee,
                service,
                tenant,
                facility,
                ...waitlistDetails,
                isNotified: false,
                isClaimed: false
            });

            const savedWaitlistEntry = await newWaitlistEntry.save();

            const populatedWaitlistEntry = await this.waitlistModel
                .findById(savedWaitlistEntry._id)
                .populate('client')
                .populate('employee')
                .populate('service')
                .populate('facility')
                .populate('tenant')
                .lean()
                .exec();

            return {
                ...populatedWaitlistEntry,
                slotStatus: slotStatus.statusMessage,
                isSlotOccupied: slotStatus.isOccupied
            } as any;
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
        }
            throw new Error(`Failed to add client to waitlist: ${error.message}`);
        }
    }

    /**
     * Vraća sve waitlist entries za određenog klijenta.
     * Obogaćuje svaki entry sa informacijom o statusu slota.
     */
    async getClientWaitlist(clientId: string, tenantId: string): Promise<WaitlistEntry[]> {
        const waitlistEntries = await this.waitlistModel
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
            .lean()
            .exec();

        return this.enrichWaitlistEntriesWithSlotStatus(waitlistEntries);
    }

    /**
     * Pronalazi waitlist entries za određeni time slot.
     * Koristi se kada se termin oslobodi da se pronađu zainteresovani klijenti.
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
     * Uklanja klijenta sa liste čekanja.
     */
    async removeFromWaitlist(waitlistId: string, clientId: string, tenantId?: string): Promise<void> {
        const query: any = {
            _id: waitlistId,
            client: clientId
        };

        if (tenantId) {
            query.tenant = tenantId;
        }

        const entry = await this.waitlistModel.findOne(query).exec();

        if (!entry) {
            throw new NotFoundException('Waitlist entry not found');
        }

        await this.waitlistModel.findByIdAndDelete(waitlistId).exec();
    }

    /**
     * Vraća sve waitlist entries za određeni tenant (opciono filtrirane po facility).
     * Koristi se u admin panelu za prikaz svih waitlist entries.
     */
    async getAllWaitlistEntries(tenantId: string, facilityId?: string): Promise<WaitlistEntry[]> {
        const query: any = { 
            tenant: tenantId,
            isClaimed: false 
        };

        if (facilityId) {
            query.facility = facilityId;
        }

        return this.waitlistModel
            .find(query)
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .sort({ createdAt: 1 })
            .exec();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NOTIFICATION SYSTEM - Obaveštavanje klijenata o slobodnim terminima
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Obaveštava klijente sa liste čekanja kada se SPECIFIČAN termin oslobodi.
     * 
     * VAŽNO: Notifikuje samo ako je CELI traženi slot slobodan, ne samo deo!
     * 
     * @example
     * await notifyWaitlistForAvailableSlot('employeeId', 'facilityId', '2025-10-29', 9.0, 10.5);
     */
    async notifyWaitlistForAvailableSlot(employeeId: string, facilityId: string, date: string, startHour: number, endHour: number): Promise<WaitlistEntry[]> {
        const waitlistEntries = await this.getWaitlistForTimeSlot(employeeId, facilityId, date, startHour, endHour);

        if (waitlistEntries.length === 0) {
            return [];
        }

        const updatedEntries = await Promise.all(
            waitlistEntries.map(async (entry) => {
                // KRITIČNA PROVERA: Da li je CELI slot za ovaj waitlist entry zaista slobodan?
                const conflictingAppointment = await this.findConflictingAppointment(
                    entry.employee._id.toString(),
                    entry.facility._id.toString(),
                    entry.preferredDate,
                    entry.preferredStartHour,
                    entry.preferredEndHour
                );

                // Ako postoji appointment u slotu, NE notifikuj klijenta
                if (conflictingAppointment) {
                    return null;
                }

                const claimToken = randomBytes(32).toString('hex');
                const claimLink = `${this.FRONTEND_URL}/appointments/claim/${claimToken}`;
                
                // claim link generated
                
                // Token expiration: 24 sata od sada
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                
                // Send email notification
                await this.sendWaitlistNotificationEmail(entry, claimLink);

                // Update entry with notification status
                const updated = await this.waitlistModel
                    .findByIdAndUpdate(
                        entry._id,
                        { 
                            isNotified: true, 
                            notifiedAt: new Date(),
                            claimToken: claimToken,
                            claimTokenExpiresAt: expiresAt
                        },
                        { new: true }
                    )
                    .populate('client')
                    .populate('employee')
                    .populate('service')
                    .populate('facility')
                    .exec();

                // claim token saved

                return updated;
            })
        );

        return updatedEntries.filter(entry => entry !== null) as WaitlistEntry[];
    }

    /**
     * Prolazi kroz SVE waitlist entries za određeni dan i notifikuje za slobodne termine.
     * Koristi se za batch processing (npr. cron job koji proverava svaki dan).
     */
    async notifyAvailableSlotsForDay(date: string, tenantId: string): Promise<{ notified: number; entries: WaitlistEntry[] }> {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
        
        const waitlistEntries = await this.waitlistModel
            .find({
                $and: [
                    { 
                        preferredDate: {
                            $gte: startOfDay.toISOString(),
                            $lte: endOfDay.toISOString()
                        }
                    },
                    { tenant: tenantId },
                    { isNotified: false },
                    { isClaimed: false }
                ]
            })
            .populate('employee')
            .populate('client')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .exec();

        const notifiedEntries: WaitlistEntry[] = [];

        for (const entry of waitlistEntries) {
            const existingAppointment = await this.findConflictingAppointment(
                entry.employee._id.toString(),
                entry.facility._id.toString(),
                entry.preferredDate,
                entry.preferredStartHour,
                entry.preferredEndHour
            );

            if (!existingAppointment) {
                const claimToken = randomBytes(32).toString('hex');
                const claimLink = `${this.FRONTEND_URL}/appointments/claim/${claimToken}`;
                
                // claim link generated (notify day)
                
                // Token expiration: 24 sata od sada
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                
                await this.sendWaitlistNotificationEmail(entry, claimLink);

                const updated = await this.waitlistModel.findByIdAndUpdate(
                    entry._id,
                    { 
                        isNotified: true, 
                        notifiedAt: new Date(), 
                        claimToken,
                        claimTokenExpiresAt: expiresAt
                    },
                    { new: true }
                ).populate('client').populate('employee').populate('service').populate('facility').exec();

                if (updated) {
                    notifiedEntries.push(updated);
                }
            }
        }

        return { notified: notifiedEntries.length, entries: notifiedEntries };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CLAIM APPOINTMENT - Prihvatanje termina sa liste čekanja
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Prihvata termin sa liste čekanja.
     * 
     * PROCES:
     * 1. Verifikuje claimToken (i opciono clientId)
     * 2. Automatski briše sve cancelled appointmente za taj slot
     * 3. Proverava da li termin još uvek postoji (cancelled: false)
     * 4. Kreira appointment
     * 5. Označava waitlist entry kao claimed
     * 6. Automatski BRIŠE sve ostale waitlist entries za taj slot (first-come-first-served)
     * 
     * @param claimToken - Token iz email linka
     * @param clientId - Opciono: ID klijenta za dodatnu verifikaciju (dashboard flow)
     */
    async claimAppointmentFromWaitlist(claimToken: string, clientId?: string): Promise<{ success: boolean; appointment?: any; message: string }> {
        // Find waitlist entry (with or without clientId verification)
        const query: any = { 
                claimToken: claimToken, 
                isClaimed: false 
        };

        if (clientId) {
            query.client = clientId;
        }

        const waitlistEntry = await this.waitlistModel
            .findOne(query)
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .exec();

        if (!waitlistEntry) {
            throw new BadRequestException('Link nije validan. Molimo kontaktirajte nas.');
        }

        // Check if token has expired (24h from notification)
        if (waitlistEntry.claimTokenExpiresAt && new Date() > waitlistEntry.claimTokenExpiresAt) {
            throw new BadRequestException('Link je istekao. Termin je bio dostupan 24 sata. Molimo kontaktirajte nas za novi termin.');
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // MONGODB TRANSACTION - Atomicity za sve kritične operacije
        // ═══════════════════════════════════════════════════════════════════════════
        
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            this.logger.log('Starting transaction for claim appointment', {
                context: 'Transaction',
                waitlistId: waitlistEntry._id.toString(),
                clientId: waitlistEntry.client._id.toString()
            });

            // Delete any cancelled appointments for this slot first
            await this.appointmentModel.deleteMany({
                employee: waitlistEntry.employee._id,
                facility: waitlistEntry.facility._id,
                date: waitlistEntry.preferredDate,
                $or: [
                    {
                        startHour: { $lt: waitlistEntry.preferredEndHour },
                        endHour: { $gt: waitlistEntry.preferredStartHour }
                    }
                ],
                cancelled: true
            }, { session });

        // Initial check if time slot is available
        const existingAppointment = await this.findConflictingAppointment(
            waitlistEntry.employee._id.toString(),
            waitlistEntry.facility._id.toString(),
            waitlistEntry.preferredDate,
            waitlistEntry.preferredStartHour,
            waitlistEntry.preferredEndHour
        );

        if (existingAppointment) {
            throw new ConflictException('Termin nije više dostupan. Neko je već zauzeo ovaj slot.');
        }

        // Create appointment data
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

        // RACE CONDITION PROTECTION:
        // Last-minute check NEPOSREDNO pre save() operacije.
        // Ako dva klijenta istovremeno kliknu "Prihvati termin", oba mogu proći kroz gornju proveru.
        // Ova dodatna provera minimizuje window za race condition.
        const lastMinuteCheck = await this.findConflictingAppointment(
            waitlistEntry.employee._id.toString(),
            waitlistEntry.facility._id.toString(),
            waitlistEntry.preferredDate,
            waitlistEntry.preferredStartHour,
            waitlistEntry.preferredEndHour
        );

        if (lastMinuteCheck) {
            throw new ConflictException('Termin je upravo zauzet. Neko drugi je bio brži.');
        }

            // Create and save appointment (within transaction)
        const newAppointment = new this.appointmentModel(appointmentData);
            const savedAppointment = await newAppointment.save({ session });

            this.logger.log('Appointment created in transaction', {
                context: 'Transaction',
                appointmentId: savedAppointment._id.toString(),
                date: appointmentData.date,
                startHour: appointmentData.startHour,
                endHour: appointmentData.endHour
            });

            // Mark waitlist entry as claimed (within transaction)
        await this.waitlistModel.findByIdAndUpdate(
            waitlistEntry._id,
            { 
                isClaimed: true, 
                claimedAt: new Date() 
                },
                { session }
            );

            this.logger.log('Waitlist entry marked as claimed', {
                context: 'Transaction',
                waitlistId: waitlistEntry._id.toString()
            });

            // Remove all other waitlist entries for this time slot (within transaction)
            const deleteResult = await this.waitlistModel.deleteMany({
            employee: waitlistEntry.employee._id,
            facility: waitlistEntry.facility._id,
            preferredDate: waitlistEntry.preferredDate,
            _id: { $ne: waitlistEntry._id }
            }, { session });

            this.logger.log('Deleted other waitlist entries', {
                context: 'Transaction',
                deletedCount: deleteResult.deletedCount
            });

            // Commit transaction - sve je uspelo!
            await session.commitTransaction();
            this.logger.log('Transaction committed successfully', {
                context: 'Transaction',
                operation: 'claimAppointment'
            });

            // Populate appointment (posle transakcije, nije kritično)
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

        } catch (error) {
            // Rollback transaction - ništa se ne menja!
            await session.abortTransaction();
            this.logger.error('Transaction aborted due to error', error.stack, {
                context: 'Transaction',
                operation: 'claimAppointment',
                error: error.message,
                code: error.code
            });

            // Proveri da li je duplicate key error (race condition uhvaćen)
            if (error.code === 11000) {
                throw new ConflictException('Termin je upravo zauzet. Race condition detektovan.');
            }

            // Re-throw error dalje
            throw error;

        } finally {
            // Cleanup session
            session.endSession();
            this.logger.debug('Transaction session ended', {
                context: 'Transaction'
            });
        }
    }

    /**
     * Prihvata termin sa liste čekanja (SAMO sa claimToken, bez clientId).
     * Wrapper metoda za backward compatibility - poziva claimAppointmentFromWaitlist bez clientId.
     */
    async claimAppointmentWithToken(claimToken: string): Promise<{ success: boolean; appointment?: any; message: string }> {
        return this.claimAppointmentFromWaitlist(claimToken);
    }
}
