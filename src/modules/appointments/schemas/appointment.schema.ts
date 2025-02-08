import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Service } from '../../services/schemas/service.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ toJSON: { virtuals: true, versionKey: false }, toObject: { virtuals: true } })
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

AppointmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

AppointmentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.serviceId;
    delete ret.userId;
    delete ret.id;
    return ret;
  },
});
