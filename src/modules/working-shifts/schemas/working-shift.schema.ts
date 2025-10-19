import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Employee } from 'src/modules/employees/schema/employee.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';
import { Facility } from 'src/modules/facility/schema/facility.schema';

export type WorkingShiftDocument = WorkingShift & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true, versionKey: false, transform: docToJsonTransform } })
export class WorkingShift {
  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Employee', 
      required: true,
      autopopulate: { select: 'firstName lastName' }
  })
      employee: Employee;

  @Prop({ type: String, required: true }) // ISO string: '2025-06-10'
      date: string;

  @Prop({ type: String, enum: ['morning', 'afternoon', 'evening', 'full', 'custom'], required: true })
      shiftType: string;

  @Prop({ type: Number, min: 0, max: 24 })
      startHour?: number;

  @Prop({ type: Number, min: 0, max: 24 })
      endHour?: number;

  @Prop({ type: String })
      note?: string;

  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Tenant', 
      required: true,
      autopopulate: { select: 'name' }
  })
      tenant: Tenant;

  @Prop({ 
      type: MongooseSchema.Types.ObjectId, 
      ref: 'Facility', 
      required: true,
      autopopulate: { select: 'name' }
  })
      facility: Facility;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

const WorkingShiftSchema = SchemaFactory.createForClass(WorkingShift);

// Apply mongoose-autopopulate plugin
WorkingShiftSchema.plugin(require('mongoose-autopopulate'));

function docToJsonTransform(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
}

export { WorkingShiftSchema }
