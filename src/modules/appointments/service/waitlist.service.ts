import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistEntry } from '../schemas/waitlist.schema';
import { Appointment } from '../schemas/appointment.schema';
import { randomBytes } from 'crypto';
import { generateWaitlistNotificationEmail } from '../templates/waitlist-notification.template';
import { AppointmentValidationService } from './appointment-validation.service';
import { resolveEntityId } from '../utils/reference.util';

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
    private readonly WEBHOOK_URL?: string;
    private readonly FRONTEND_URL: string;
    private readonly CLAIM_WEBHOOK_URL?: string;
    
    constructor(
    @InjectModel(WaitlistEntry.name)
    private readonly waitlistModel: Model<WaitlistEntry>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    private readonly appointmentValidationService: AppointmentValidationService
    ) {
        const rawWebhookUrl = this.configService.get<string>('WEBHOOK_URL')?.trim();
        this.WEBHOOK_URL = rawWebhookUrl && rawWebhookUrl.length > 0 ? rawWebhookUrl : undefined;

        const rawFrontendUrl = this.configService.get<string>('FRONTEND_URL')?.trim() || 'http://localhost:4200';
        this.FRONTEND_URL = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

        const rawClaimWebhook = this.configService.get<string>('WAITLIST_CLAIM_WEBHOOK_URL')?.trim();
        this.CLAIM_WEBHOOK_URL = rawClaimWebhook && rawClaimWebhook.length > 0 ? rawClaimWebhook : undefined;
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
    private async sendWaitlistNotificationEmail(entry: WaitlistEntry, claimLink: string): Promise<void> {
        const populatedClient = entry.client as any;
        const populatedEmployee = entry.employee as any;
        const populatedService = entry.service as any;
        const populatedFacility = entry.facility as any;

        const tenantId = resolveEntityId(entry.tenant as any);
        const facilityId = resolveEntityId(entry.facility as any);
        const employeeId = resolveEntityId(entry.employee as any);
        const clientId = resolveEntityId(entry.client as any);

        const clientName = `${populatedClient?.firstName || ''} ${populatedClient?.lastName || ''}`.trim() || 'Klijent';
        const clientEmail = populatedClient?.contactEmail || 'N/A';

        if (!this.WEBHOOK_URL) {
            this.logger.error('Email webhook URL is not configured. Cannot send waitlist notification.', {
                context: 'EmailNotification',
                tenantId,
                facilityId,
                employeeId,
                clientId,
            });
            return;
        }

        this.logger.log(`Starting email notification`, {
            context: 'EmailNotification',
            clientName,
            clientEmail,
            service: populatedService?.name,
            tenantId,
            facilityId,
            employeeId,
            clientId,
        });

        const webhookPayload = (() => {
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
                titleText: 'Vaš termin je dostupan!',
            });

            return {
                clientName,
                clientEmail,
                htmlBody,
            };
        })();

        try {
            await this.retryWithExponentialBackoff(async () => {
                const response = await fetch(this.WEBHOOK_URL!, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload),
                });

                if (!response.ok) {
                    throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);
                }

                this.logger.log(`Email notification sent successfully`, {
                    context: 'EmailNotification',
                    clientName,
                    clientEmail,
                    status: response.status,
                });

                return response;
            }, 3, 1000);
        } catch (error) {
            this.logger.error(`Failed to send email notification after all retries`, (error as Error).stack, {
                context: 'EmailNotification',
                clientName,
                clientEmail,
                tenantId,
                facilityId,
                employeeId,
                clientId,
                claimLink,
                error: (error as Error).message,
            });

            await this.enqueueEmailFallback({
                tenantId,
                facilityId,
                employeeId,
                clientId,
                claimLink,
                payload: webhookPayload,
            });
        }
    }

    /**
     * Obogaćuje waitlist entries sa informacijom o statusu slota.
     * Koristi bulk query da izbegne N+1 problem.
     */
    private async enrichWaitlistEntriesWithSlotStatus(entries: any[]): Promise<any[]> {
        if (!entries.length) {
            return [];
        }

        const appointmentQueries = entries.map((entry) => ({
            employee: resolveEntityId((entry.employee as any)?._id ?? entry.employee),
            facility: resolveEntityId((entry.facility as any)?._id ?? entry.facility),
            date: entry.preferredDate,
            $or: [
                {
                    startHour: { $lt: entry.preferredEndHour },
                    endHour: { $gt: entry.preferredStartHour },
                },
            ],
            cancelled: false,
        }));

        const conflictingAppointments = await this.appointmentModel
            .find({
                $or: appointmentQueries,
            })
            .lean()
            .exec();

        return Promise.all(
            entries.map(async (entry) => {
                const employeeId = resolveEntityId((entry.employee as any)?._id ?? entry.employee);
                const facilityId = resolveEntityId((entry.facility as any)?._id ?? entry.facility);
                const tenantId = resolveEntityId((entry.tenant as any)?._id ?? entry.tenant);

                const isOccupied = conflictingAppointments.some(
                    (apt) =>
                        resolveEntityId(apt.employee) === employeeId &&
                        resolveEntityId(apt.facility) === facilityId &&
                        apt.date === entry.preferredDate &&
                        apt.startHour < entry.preferredEndHour &&
                        apt.endHour > entry.preferredStartHour,
                );

                const shiftResult = await this.appointmentValidationService.checkShift(
                    {
                        employeeId,
                        facilityId,
                        tenantId,
                        date: entry.preferredDate,
                        startHour: entry.preferredStartHour,
                        endHour: entry.preferredEndHour,
                    },
                    { throwOnFail: false },
                );

                const shiftRange = this.formatHourRange(shiftResult.startHour, shiftResult.endHour);
                const shiftMessage = shiftResult.isWithinShift
                    ? shiftRange
                        ? `Radno vreme smene: ${shiftRange}`
                        : null
                    : shiftResult.message ?? 'Termin je van radnog vremena zaposlenog.';

                return {
                    ...entry,
                    slotStatus: isOccupied
                        ? 'Slot je trenutno zauzet. Prijavili ste se na listu čekanja.'
                        : 'Slot je slobodan. Nema zakazanih termina.',
                    isSlotOccupied: isOccupied,
                    isWithinShift: shiftResult.isWithinShift,
                    shiftValidationMessage: shiftMessage,
                    shiftStartHour: shiftResult.startHour ?? null,
                    shiftEndHour: shiftResult.endHour ?? null,
                };
            }),
        );
    }

    private formatHourRange(start?: number | null, end?: number | null): string | null {
        if (start == null || end == null) {
            return null;
        }
        return `${this.formatHour(start)} - ${this.formatHour(end)}`;
    }

    private formatHour(value: number): string {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

            const context = await this.appointmentValidationService.validateContext({
                tenantId: tenant,
                employeeId: employee,
                clientId: client,
                facilityId: facility,
                serviceId: service,
                date: waitlistDetails.preferredDate,
                startHour: waitlistDetails.preferredStartHour,
                endHour: waitlistDetails.preferredEndHour,
            });

            this.logger.log('Creating waitlist entry', {
                context: 'Waitlist',
                tenantId: context.tenant._id.toString(),
                facilityId: context.facility._id.toString(),
                employeeId: context.employee._id.toString(),
                clientId: context.client._id.toString(),
                date: context.normalizedDate,
                startHour: waitlistDetails.preferredStartHour,
                endHour: waitlistDetails.preferredEndHour,
            });

            await this.waitlistModel.updateMany(
                { claimToken: null },
                { $unset: { claimToken: '', claimTokenExpiresAt: '' } },
            );

            const existingWaitlistEntry = await this.waitlistModel
                .findOne({
                    client: context.client._id,
                    employee: context.employee._id,
                    facility: context.facility._id,
                    preferredDate: context.normalizedDate,
                    preferredStartHour: waitlistDetails.preferredStartHour,
                    preferredEndHour: waitlistDetails.preferredEndHour,
                    isClaimed: false,
                })
                .lean()
                .exec();

            if (existingWaitlistEntry) {
                throw new ConflictException('Client is already on the waitlist for this time slot');
            }

            const slotStatus = await this.checkSlotStatus(
                context.employee._id.toString(),
                context.facility._id.toString(),
                context.normalizedDate,
                waitlistDetails.preferredStartHour,
                waitlistDetails.preferredEndHour,
            );

            const newWaitlistEntry = new this.waitlistModel({
                client: context.client._id,
                employee: context.employee._id,
                service: context.service._id,
                tenant: context.tenant._id,
                facility: context.facility._id,
                preferredDate: context.normalizedDate,
                preferredStartHour: waitlistDetails.preferredStartHour,
                preferredEndHour: waitlistDetails.preferredEndHour,
                isNotified: false,
                isClaimed: false,
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

            const shiftLabel = this.formatHourRange(
                context.shiftWindow.startHour,
                context.shiftWindow.endHour,
            );

            return {
                ...populatedWaitlistEntry,
                slotStatus: slotStatus.statusMessage,
                isSlotOccupied: slotStatus.isOccupied,
                isWithinShift: true,
                shiftValidationMessage: shiftLabel ? `Radno vreme smene: ${shiftLabel}` : null,
                shiftStartHour: context.shiftWindow.startHour,
                shiftEndHour: context.shiftWindow.endHour,
            } as any;
        } catch (error) {
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            throw new Error(`Failed to add client to waitlist: ${(error as Error).message}`);
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

    async describeShiftWindow(params: { tenant: string; employee: string; facility: string; date: string }) {
        return this.appointmentValidationService.describeShift({
            tenantId: params.tenant,
            employeeId: params.employee,
            facilityId: params.facility,
            date: params.date,
        });
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

        const entries = await this.waitlistModel
            .find(query)
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .sort({ createdAt: 1 })
            .lean()
            .exec();

        return this.enrichWaitlistEntriesWithSlotStatus(entries);
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
        this.logger.log('Processing waitlist notification for slot', {
            context: 'WaitlistNotification',
            employeeId,
            facilityId,
            date,
            startHour,
            endHour,
        });

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

                const shiftCheck = await this.appointmentValidationService.checkShift(
                    {
                        employeeId: entry.employee._id.toString(),
                        facilityId: entry.facility._id.toString(),
                        tenantId: entry.tenant?._id?.toString() ?? String(entry.tenant),
                        date: entry.preferredDate,
                        startHour: entry.preferredStartHour,
                        endHour: entry.preferredEndHour,
                    },
                    { throwOnFail: false },
                );

                if (!shiftCheck.isWithinShift) {
                    this.logger.warn('Skipping waitlist notification due to shift mismatch', {
                        waitlistId: entry._id.toString(),
                        message: shiftCheck.message,
                    });
                    return null;
                }

                const claimToken = randomBytes(32).toString('hex');
                const claimLink = this.buildClaimLink(claimToken);

                if (!claimLink) {
                    this.logger.error('Claim link could not be generated. Skipping waitlist notification.', {
                        context: 'WaitlistNotification',
                        waitlistId: entry._id.toString(),
                        tenantId: resolveEntityId(entry.tenant as any),
                    });
                    return null;
                }

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
        this.logger.log('Processing waitlist notification sweep for day', {
            context: 'WaitlistNotificationDay',
            tenantId,
            date,
        });

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

            if (existingAppointment) {
                continue;
            }

            const shiftCheck = await this.appointmentValidationService.checkShift(
                {
                    employeeId: entry.employee._id.toString(),
                    facilityId: entry.facility._id.toString(),
                    tenantId: entry.tenant?._id?.toString() ?? String(entry.tenant),
                    date: entry.preferredDate,
                    startHour: entry.preferredStartHour,
                    endHour: entry.preferredEndHour,
                },
                { throwOnFail: false },
            );

            if (!shiftCheck.isWithinShift) {
                this.logger.warn('Skipping daily waitlist notification due to shift mismatch', {
                    waitlistId: entry._id.toString(),
                    message: shiftCheck.message,
                });
                continue;
            }

            const claimToken = randomBytes(32).toString('hex');
            const claimLink = this.buildClaimLink(claimToken);

            if (!claimLink) {
                this.logger.error('Claim link could not be generated. Skipping waitlist notification.', {
                    context: 'WaitlistNotificationDay',
                    waitlistId: entry._id.toString(),
                    tenantId: resolveEntityId(entry.tenant as any),
                });
                continue;
            }
            
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
        const waitlistEntryRaw = await this.waitlistModel
            .findOne({ claimToken })
            .populate('client')
            .populate('employee')
            .populate('service')
            .populate('facility')
            .populate('tenant')
            .exec();

        if (!waitlistEntryRaw) {
            throw new BadRequestException('Link nije validan. Molimo kontaktirajte nas.');
        }

        if (waitlistEntryRaw.isClaimed) {
            throw new ConflictException('Termin je već prihvaćen od strane drugog klijenta.');
        }

        // Check if token has expired (24h from notification)
        if (waitlistEntryRaw.claimTokenExpiresAt && new Date() > waitlistEntryRaw.claimTokenExpiresAt) {
            throw new BadRequestException('Link je istekao. Termin je bio dostupan 24 sata. Molimo kontaktirajte nas za novi termin.');
        }

        if (clientId) {
            const normalizedClientId = resolveEntityId(waitlistEntryRaw.client);
            if (clientId !== normalizedClientId) {
                throw new BadRequestException('Link nije validan za ovog korisnika.');
            }
        }

        const waitlistEntry = waitlistEntryRaw;

        // ═══════════════════════════════════════════════════════════════════════════
        // MONGODB TRANSACTION - Atomicity za sve kritične operacije
        // ═══════════════════════════════════════════════════════════════════════════
        
        const context = await this.appointmentValidationService.validateContext({
            tenantId: resolveEntityId(waitlistEntry.tenant),
            employeeId: resolveEntityId(waitlistEntry.employee),
            clientId: resolveEntityId(waitlistEntry.client),
            facilityId: resolveEntityId(waitlistEntry.facility),
            serviceId: resolveEntityId(waitlistEntry.service),
            date: waitlistEntry.preferredDate,
            startHour: waitlistEntry.preferredStartHour,
            endHour: waitlistEntry.preferredEndHour,
        });

        const normalizedClientId = resolveEntityId(waitlistEntry.client);
        if (clientId && clientId !== normalizedClientId) {
            throw new BadRequestException('Link nije validan za ovog korisnika.');
        }

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            this.logger.log('Starting transaction for claim appointment', {
                context: 'Transaction',
                waitlistId: waitlistEntry._id.toString(),
                clientId: context.client._id.toString(),
            });

            await this.appointmentModel.deleteMany(
                {
                    employee: context.employee._id,
                    facility: context.facility._id,
                    date: context.normalizedDate,
                    $or: [
                        {
                            startHour: { $lt: waitlistEntry.preferredEndHour },
                            endHour: { $gt: waitlistEntry.preferredStartHour },
                        },
                    ],
                    cancelled: true,
                },
                { session },
            );

            const existingAppointment = await this.findConflictingAppointment(
                context.employee._id.toString(),
                context.facility._id.toString(),
                context.normalizedDate,
                waitlistEntry.preferredStartHour,
                waitlistEntry.preferredEndHour,
            );

            if (existingAppointment) {
                throw new ConflictException('Termin nije više dostupan. Neko je već zauzeo ovaj slot.');
            }

            const appointmentData = {
                employee: context.employee._id,
                client: context.client._id,
                service: context.service._id,
                tenant: context.tenant._id,
                facility: context.facility._id,
                date: context.normalizedDate,
                startHour: waitlistEntry.preferredStartHour,
                endHour: waitlistEntry.preferredEndHour,
                paid: false,
            };

            const lastMinuteCheck = await this.findConflictingAppointment(
                context.employee._id.toString(),
                context.facility._id.toString(),
                context.normalizedDate,
                waitlistEntry.preferredStartHour,
                waitlistEntry.preferredEndHour,
            );

            if (lastMinuteCheck) {
                throw new ConflictException('Termin je upravo zauzet. Neko drugi je bio brži.');
            }

            const newAppointment = new this.appointmentModel(appointmentData);
            const savedAppointment = await newAppointment.save({ session });

            this.logger.log('Appointment created in transaction', {
                context: 'Transaction',
                appointmentId: savedAppointment._id.toString(),
                date: appointmentData.date,
                startHour: appointmentData.startHour,
                endHour: appointmentData.endHour,
            });

            await this.waitlistModel.findByIdAndUpdate(
                waitlistEntry._id,
                {
                    $set: {
                        isClaimed: true,
                        claimedAt: new Date(),
                    },
                    $unset: {
                        claimToken: '',
                        claimTokenExpiresAt: '',
                    },
                },
                { session },
            );

            this.logger.log('Waitlist entry marked as claimed', {
                context: 'Transaction',
                waitlistId: waitlistEntry._id.toString(),
            });

            const deleteResult = await this.waitlistModel.deleteMany(
                {
                    employee: context.employee._id,
                    facility: context.facility._id,
                    preferredDate: context.normalizedDate,
                    isClaimed: false,
                    _id: { $ne: waitlistEntry._id },
                },
                { session },
            );

            this.logger.log('Deleted other waitlist entries', {
                context: 'Transaction',
                deletedCount: deleteResult.deletedCount,
            });

            await session.commitTransaction();

            const populatedAppointment = await this.appointmentModel
                .findById(savedAppointment._id)
                .populate('client')
                .populate('employee')
                .populate('service')
                .populate('facility')
                .populate('tenant')
                .exec();

            await this.emitWaitlistClaimEvent({
                waitlistId: waitlistEntry._id.toString(),
                appointmentId: savedAppointment._id.toString(),
                tenantId: context.tenant._id.toString(),
                facilityId: context.facility._id.toString(),
                employeeId: context.employee._id.toString(),
                clientId: context.client._id.toString(),
                date: context.normalizedDate,
                startHour: waitlistEntry.preferredStartHour,
                endHour: waitlistEntry.preferredEndHour,
            });

            return {
                success: true,
                appointment: populatedAppointment,
                message: 'Appointment successfully claimed from waitlist',
            };
        } catch (error) {
            await session.abortTransaction();

            this.logger.error('Transaction aborted due to error', (error as Error).stack, {
                context: 'Transaction',
                operation: 'claimAppointment',
                error: (error as Error).message,
                code: (error as any)?.code,
            });

            if ((error as any)?.code === 11000) {
                throw new ConflictException('Termin je upravo zauzet. Race condition detektovan.');
            }

            throw error;
        } finally {
            session.endSession();
            this.logger.debug('Transaction session ended', {
                context: 'Transaction',
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

    private buildClaimLink(claimToken: string): string | null {
        if (!claimToken) {
            return null;
        }

        const sanitizedToken = claimToken.trim();
        if (!sanitizedToken) {
            return null;
        }

        if (!this.FRONTEND_URL) {
            return null;
        }

        return `${this.FRONTEND_URL}/appointments/claim/${sanitizedToken}`;
    }

    private async enqueueEmailFallback(payload: {
        tenantId: string;
        facilityId: string;
        employeeId: string;
        clientId: string;
        claimLink: string;
        payload: Record<string, any>;
    }): Promise<void> {
        this.logger.warn('Email notification fallback queued (no queue configured)', {
            context: 'EmailNotificationFallback',
            ...payload,
        });
    }

    private async emitWaitlistClaimEvent(payload: {
        waitlistId: string;
        appointmentId: string;
        tenantId: string;
        facilityId: string;
        employeeId: string;
        clientId: string;
        date: string;
        startHour: number;
        endHour: number;
    }): Promise<void> {
        if (!this.CLAIM_WEBHOOK_URL) {
            this.logger.debug('Skipping waitlist claim webhook dispatch; URL not configured', {
                context: 'WaitlistClaimWebhook',
                waitlistId: payload.waitlistId,
            });
            return;
        }

        try {
            await this.retryWithExponentialBackoff(async () => {
                const response = await fetch(this.CLAIM_WEBHOOK_URL!, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`Claim webhook returned status ${response.status}`);
                }

                this.logger.log('Waitlist claim webhook dispatched', {
                    context: 'WaitlistClaimWebhook',
                    waitlistId: payload.waitlistId,
                    appointmentId: payload.appointmentId,
                });

                return response;
            }, 3, 500);
        } catch (error) {
            this.logger.error('Failed to dispatch waitlist claim webhook', (error as Error).stack, {
                context: 'WaitlistClaimWebhook',
                waitlistId: payload.waitlistId,
                appointmentId: payload.appointmentId,
                error: (error as Error).message,
            });
        }
    }
}
