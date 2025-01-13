import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Tenant, TenantSchema } from "./schemas/tenant.schema";
import { TenantsController } from "./tenants.controller";
import { TenantsService } from "./tenants.service";

@Module({
    imports: [MongooseModule.forFeature([{name: Tenant.name, schema: TenantSchema}])],
    controllers: [TenantsController],
    providers: [TenantsService],
    exports: [MongooseModule]
})
export class TenantsModule{}