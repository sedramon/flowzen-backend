import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "./schemas/role.schema";
import { RoleService } from "./role.service";
import { RolesController } from "./role.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: Role.name, schema: RoleSchema}])],
    controllers: [RolesController],
    providers: [RoleService],
    exports: [MongooseModule]
})
export class RolesModule {}