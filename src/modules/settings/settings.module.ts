import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SettingsSchema } from "./schemas/settings.schema";
import { UsersModule } from "../users/users.module";
import { TenantsModule } from "../tenants/tenants.module";
import { SettingsController } from "./controller/settings.controller";
import { SettingsService } from "./service/settings.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Settings', schema: SettingsSchema}]),
        UsersModule,
        TenantsModule
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: []
})
export class SettingsModule {}