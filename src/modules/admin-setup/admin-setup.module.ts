import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSetupService } from './admin-setup.service';
import { AdminSetupController } from './admin-setup.controller';
import { Scope, ScopeSchema } from '../scopes/schemas/scope.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { AdminSetupGuard } from './guards/admin-setup.guard';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Scope.name, schema: ScopeSchema },
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: Tenant.name, schema: TenantSchema },
        ]),
        AuditModule,
    ],
    controllers: [AdminSetupController],
    providers: [AdminSetupService, AdminSetupGuard],
})
export class AdminSetupModule {}

