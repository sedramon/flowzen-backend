import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsSchema } from "./schemas/client.schema";
import { TenantsModule } from "../tenants/tenants.module";
import { UserSchema } from "../users/schemas/user.schema";

import { ClientsController } from "./controller/clients.controller";
import { ClientsService } from "./service/clients.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: 'Client', schema: ClientsSchema},
            {name: 'User', schema: UserSchema}
        ]), 
        TenantsModule
    ],
    controllers: [ClientsController],
    providers: [ClientsService],
    exports: [MongooseModule]
})
export class ClientsModule {}