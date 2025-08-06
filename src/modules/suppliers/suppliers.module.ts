import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SupplierSchema } from "./schema/supplier.schema";
import { SupplierController } from "./controller/supplier.controller";
import { SuppliersService } from "./service/supplier.service";
import { TenantsModule } from "../tenants/tenants.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Supplier',
                schema: SupplierSchema
            }
        ]),
        TenantsModule
    ],
    controllers: [
        SupplierController
    ],
    providers: [
        SuppliersService
    ],
    exports: [MongooseModule]
})
export class SuppliersModule {}