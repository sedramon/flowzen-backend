import { Module } from "@nestjs/common";
import { Scope, ScopeSchema } from "./schemas/scope.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ScopesController } from "./controller/scope.controller";
import { ScopesService } from "./service/scopes.service";

@Module({
    imports: [MongooseModule.forFeature([{name: Scope.name, schema: ScopeSchema}])],
    controllers: [ScopesController],
    providers: [ScopesService],
    exports: [MongooseModule]
})
export class ScopeModule{}