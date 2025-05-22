import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "./schemas/role.schema";
import { RolesController } from "./controller/role.controller";
import { ScopeModule } from "../scopes/scope.module";
import { TenantsModule } from "../tenants/tenants.module";
import { RoleService } from "./service/role.service";

@Module({
    imports: [MongooseModule.forFeature([{name: Role.name, schema: RoleSchema}]), ScopeModule, TenantsModule],
    controllers: [RolesController],
    providers: [RoleService],
    exports: [MongooseModule]
})
export class RolesModule {}