import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from 'src/modules/roles/schemas/role.schema';

@Schema()
export class User extends Document {
  @Prop({default: 'User'})
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ select: false, required: true }) // Exclude password from queries by default
  password: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true }) // admin, manager, or employee
  role: Role;

  _id: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);
