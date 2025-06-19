import { Module } from "@nestjs/common";
import { FacilityController } from "./controller/facility.controller";
import { FacilityService } from "./service/facility.service";
import { Facility, FacilitySchema } from "./schema/facility.schema";
import { TenantsModule } from "../tenants/tenants.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{ name: Facility.name, schema: FacilitySchema }]), TenantsModule],
    controllers: [FacilityController],
    providers: [FacilityService],
    exports: []
})
export class FacilityModule {

}