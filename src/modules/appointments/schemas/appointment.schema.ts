import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, Query, Types, Schema as MongooseSchema } from 'mongoose';
import { Client } from 'src/modules/clients/schemas/client.schema';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Service } from 'src/modules/services/schemas/service.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';

@Schema({timestamps: true, toJSON: { virtuals: true, versionKey: false, transform: docToJsonTransform }})
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employee: Employee;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true})
  client: Client;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenant: Tenant;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Facility', required: true })
  facility: Facility;

  @Prop({ required: true })
  startHour: number;

  @Prop({ required: true })
  endHour: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true})
  service: Service;

  @Prop({ required: true })
  date: string;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;

}

const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('tenant');
  next();
});

AppointmentSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('tenant');
  next();
});

AppointmentSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('client');
  next();
});

AppointmentSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('client');
  next();
});

AppointmentSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('employee');
  next();
});

AppointmentSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('employee');
  next();
});


AppointmentSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('service');
  next();
});


AppointmentSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('service');
  next();
});

AppointmentSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('facility');
  next();
});

AppointmentSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('facility');
  next();
});

function docToJsonTransform(doc: any, ret:any) {
  ret.id = ret._id;
  delete ret._id;
  return ret;
}

export { AppointmentSchema }