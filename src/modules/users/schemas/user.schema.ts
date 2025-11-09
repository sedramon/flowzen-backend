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
      role: Role | MongooseSchema.Types.ObjectId;

  @Prop({
      type: MongooseSchema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
      validate: {
          validator: function (value: MongooseSchema.Types.ObjectId | null) {
              return this.isGlobalAdmin ? !value : !!value;
          },
          message: 'Tenant reference is required unless the user is a global administrator'
      }
  }) // tenant id
      tenant: Tenant | MongooseSchema.Types.ObjectId | null;

  @Prop({ default: false })
      isGlobalAdmin: boolean;

  @Prop({ type: [String], default: [] })
      scopes: string[];

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
