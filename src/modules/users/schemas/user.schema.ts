import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Query, Types } from 'mongoose';
import { Role } from 'src/modules/roles/schemas/role.schema';
import { Tenant } from 'src/modules/tenants/schemas/tenant.schema';

@Schema({timestamps: true})
export class User extends Document {
  @Prop({default: 'User'})
      name: string;

  @Prop({ unique: true, required: true })
      email: string;

  @Prop({ select: false, required: true }) // Exclude password from queries by default
      password: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true }) // admin, manager, or employee
      role: Role;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true, index: true}) // tenant id
      tenant: Tenant;

  _id: Types.ObjectId;

  readonly createdAt?: Date;
  readonly updatedAt?: Date;

}

const UserSchema = SchemaFactory.createForClass(User);

// Automatically populate the tenant field for all queries
UserSchema.pre(/^find/, function (next) {
    const query = this as Query<any, Document>;
    query.populate('tenant'); // Ensure 'this' is cast as a Mongoose Query
    next();
});

UserSchema.pre(/^findOne/, function (next) {
    const query = this as Query<any, Document>;
    query.populate('tenant'); // Ensure 'this' is cast as a Mongoose Query
    next();
});

export { UserSchema }
