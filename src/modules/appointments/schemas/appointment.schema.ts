import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: docToJsonTransform },
})
export class Appointment {
  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      autopopulate: { select: 'firstName lastName' },
  })
      employee: Employee;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Client',
      required: true,
      autopopulate: { select: 'firstName lastName' },
  })
      client: Client;

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
      autopopulate: true,
  })
      facility: Facility;

  @Prop({ required: true })
      startHour: number;

  @Prop({ required: true })
      endHour: number;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Service',
      required: true,
      autopopulate: true,
  })
      service: Service;

  @Prop({ required: true })
      date: string;

  @Prop({ type: Boolean, default: false })
      paid: boolean;

  @Prop({ type: Boolean, default: false })
      cancelled: boolean;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Sale',
      autopopulate: true,
  })
      sale?: any;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Apply mongoose-autopopulate plugin
AppointmentSchema.plugin(require('mongoose-autopopulate'));

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INDEXES - Performance Optimization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compound index za konflikt proveru (najkritičniji query u waitlist sistemu).
 * Koristi se u findConflictingAppointment() za brzu proveru da li slot već postoji.
 * Ovaj query se izvršava MNOGO puta (pri svakom claim-u, notifikaciji, itd.)
 */
AppointmentSchema.index({ employee: 1, facility: 1, date: 1, cancelled: 1 });

/**
 * Compound index za tenant + date queries.
 * Koristi se za dohvatanje svih appointmenta za određeni dan (admin calendar view).
 */
AppointmentSchema.index({ tenant: 1, date: 1 });

/**
 * Simple index za client queries.
 * Koristi se u client dashboard-u za dohvatanje svih appointmenta jednog klijenta.
 */
AppointmentSchema.index({ client: 1 });

function docToJsonTransform(doc: any, ret:any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
}

export { AppointmentSchema }