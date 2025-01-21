import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Query } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { Scope } from "src/modules/scopes/schemas/scope.schema"; // Correct import for Scope schema

@Schema({ timestamps: true })
export class Role extends Document {
    @Prop({ unique: true, required: true })
    name: string; // Role name, e.g., admin, manager, employee

    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Scope' }], // Reference to Scope model
        required: true,
    })
    availableScopes: MongooseSchema.Types.ObjectId[]; // Use ObjectId array for references

    @Prop({
        type: MongooseSchema.Types.ObjectId, // Reference to Tenant model
        ref: 'Tenant',
        required: true,
    })
    tenant: MongooseSchema.Types.ObjectId; // Use ObjectId for tenant reference

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

const RoleSchema = SchemaFactory.createForClass(Role);

// Automatically populate the tenant field for all queries
RoleSchema.pre(/^find/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('availableScopes'); // Ensure 'this' is cast as a Mongoose Query
  next();
});

RoleSchema.pre(/^findOne/, function (next) {
  const query = this as Query<any, Document>;
  query.populate('availableScopes'); // Ensure 'this' is cast as a Mongoose Query
  next();
});



export { RoleSchema };
