import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';

/**
 * Waitlist Entry Schema
 * 
 * Entitet za listu čekanja kada termini nisu dostupni.
 * 
 * Polja:
 * - client: Klijent koji čeka
 * - employee: Zaposleni za koga se čeka
 * - service: Usluga za koju se čeka
 * - facility: Lokacija
 * - preferredDate: Preferirani datum
 * - preferredStartHour/EndHour: Preferirano vreme
 * - isNotified: Da li je klijent obavešten da je termin slobodan
 * - claimToken: Unique token za prihvatanje termina (generiše se u notifyWaitlistForAvailableSlot)
 * - isClaimed: Da li je termin već prihvaćen
 */
@Schema({
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: docToJsonTransform },
})
export class WaitlistEntry {
    _id?: MongooseSchema.Types.ObjectId;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Client',
      required: true,
      autopopulate: { select: 'firstName lastName contactEmail' },
  })
      client: Client;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      autopopulate: { select: 'firstName lastName' },
  })
      employee: Employee;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Service',
      required: true,
      autopopulate: { select: 'name durationMinutes' },
  })
      service: Service;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      autopopulate: { select: 'name' },
  })
      tenant: Tenant;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      autopopulate: { select: 'name address' },
  })
      facility: Facility;

  @Prop({ required: true })
      preferredDate: string;

  @Prop({ required: true })
      preferredStartHour: number;

  @Prop({ required: true })
      preferredEndHour: number;

  /**
   * Flag koji označava da li je klijent obavešten da je termin dostupan.
   * Postavlja se na true u notifyWaitlistForAvailableSlot() metodi.
   */
  @Prop({ type: Boolean, default: false })
      isNotified: boolean;

  /**
   * Timestamp kada je klijent obavešten.
   */
  @Prop({ type: Date, default: null })
      notifiedAt: Date;

  /**
   * Flag koji označava da li je termin već prihvaćen.
   * Postavlja se na true u claimAppointmentFromWaitlist() metodi.
   */
  @Prop({ type: Boolean, default: false })
      isClaimed: boolean;

  /**
   * Timestamp kada je termin prihvaćen.
   */
  @Prop({ type: Date, default: null })
      claimedAt: Date;

  /**
   * Unique token za prihvatanje termina.
   * Generiše se kada se termin oslobodi (notifyWaitlistForAvailableSlot).
   * Koristi se u claimAppointmentFromWaitlist() metodi.
   */
  @Prop({ type: String, default: undefined })
      claimToken: string;

  /**
   * Timestamp kada claimToken ističe.
   * Token je validan 24 sata od trenutka slanja notifikacije.
   * Nakon isteka, klijent ne može više da prihvati termin sa tim tokenom.
   */
  @Prop({ type: Date, default: undefined })
      claimTokenExpiresAt: Date;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

const WaitlistEntrySchema = SchemaFactory.createForClass(WaitlistEntry);

// Apply mongoose-autopopulate plugin
WaitlistEntrySchema.plugin(require('mongoose-autopopulate'));

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INDEXES - Performance Optimization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compound index za tenant + facility + date queries.
 * Koristi se za dohvatanje svih waitlist entries za određeni dan u notifyAvailableSlotsForDay().
 */
WaitlistEntrySchema.index({ tenant: 1, facility: 1, preferredDate: 1 });

/**
 * Compound index za employee + facility + date queries.
 * Kritičan za getWaitlistForTimeSlot() koji se izvršava pri svakoj notifikaciji.
 * Ovaj query traži sve waitlist entries za specifičan time slot.
 */
WaitlistEntrySchema.index({ employee: 1, facility: 1, preferredDate: 1 });

/**
 * Compound index za client + tenant queries.
 * Koristi se u getClientWaitlist() za client dashboard view.
 */
WaitlistEntrySchema.index({ client: 1, tenant: 1 });

/**
 * Unique sparse index za claimToken.
 * Sparse = samo non-null vrednosti se indexiraju (štedi memoriju).
 * Unique = svaki token je jedinstven, ne može biti duplikata.
 * Koristi se u claimAppointmentFromWaitlist() za brzo pronalaženje entry-ja po tokenu.
 */
WaitlistEntrySchema.index({ claimToken: 1 }, { unique: true, sparse: true });

/**
 * Compound index za isNotified + isClaimed status queries.
 * Koristi se za brzo filtriranje pending waitlist entries (isNotified=false, isClaimed=false).
 */
WaitlistEntrySchema.index({ isNotified: 1, isClaimed: 1 });

/**
 * Index za claimTokenExpiresAt.
 * Korisno za background job koji bi automatski čistio expired tokens (buduća funkcionalnost).
 */
WaitlistEntrySchema.index({ claimTokenExpiresAt: 1 });

function docToJsonTransform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
}

export { WaitlistEntrySchema }
