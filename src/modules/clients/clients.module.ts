import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsSchema } from "./schemas/client.schema";
import { TenantsModule } from "../tenants/tenants.module";
import { ClientsService } from "./clients.service";
import { ClientsController } from "./clients.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: 'Client', schema: ClientsSchema}]), TenantsModule],
    controllers: [ClientsController],
    providers: [ClientsService],
    exports: []
})
export class ClientsModule {}