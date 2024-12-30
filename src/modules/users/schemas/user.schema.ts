import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({default: 'User'})
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ select: false, required: true }) // Exclude password from queries by default
  password: string;

  @Prop({ default: 'employee' }) // admin, manager, or employee
  role: string;

  @Prop({ type: [String], default: [] })
  additionalScopes: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
