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
      autopopulate: { select: 'firstName lastName email' },
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
  @Prop({ type: String, default: null })
      claimToken: string;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

const WaitlistEntrySchema = SchemaFactory.createForClass(WaitlistEntry);

// Apply mongoose-autopopulate plugin
WaitlistEntrySchema.plugin(require('mongoose-autopopulate'));

// Index for efficient queries
WaitlistEntrySchema.index({ tenant: 1, facility: 1, preferredDate: 1 });
WaitlistEntrySchema.index({ client: 1, tenant: 1 });
WaitlistEntrySchema.index({ claimToken: 1 }, { unique: true, sparse: true });

function docToJsonTransform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
}

export { WaitlistEntrySchema }
