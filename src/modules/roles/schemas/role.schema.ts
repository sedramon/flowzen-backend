import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Query } from "mongoose";
import { Tenant } from "src/modules/tenants/schemas/tenant.schema";
import { Scope } from "src/modules/scopes/schemas/scope.schema"; // Correct import for Scope schema

@Schema({ timestamps: true })
export class Role extends Document {
    @Prop({ required: true })
        name: string; // Role name, e.g., admin, manager, employee

    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Scope' }], // Reference to Scope model
        required: true,
    })
        availableScopes: Scope[]; // Use Scope type for populated data

    @Prop({
        type: MongooseSchema.Types.ObjectId, // Reference to Tenant model
        ref: 'Tenant',
        required: true,
    })
        tenant: Tenant; // Use Tenant type for populated data

    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

const RoleSchema = SchemaFactory.createForClass(Role);

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INDEXES - Performance & Data Integrity
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compound unique index: name + tenant
 * Dozvoljava da ista rola (npr. "admin") postoji za različite tenant-e,
 * ali sprečava duplikate unutar istog tenant-a.
 */
RoleSchema.index({ name: 1, tenant: 1 }, { unique: true });

// Automatically populate the availableScopes field for all queries
RoleSchema.pre(/^find/, function (next) {
    const query = this as Query<any, Document>;
    query.populate('availableScopes'); // Automatically populate the availableScopes field
    next();
});

RoleSchema.pre(/^findOne/, function (next) {
    const query = this as Query<any, Document>;
    query.populate('availableScopes'); // Automatically populate the availableScopes field
    next();
});

export { RoleSchema };

