import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/modules/tenants/schemas/tenant.schema';
import { User, UserSchema } from 'src/modules/users/schemas/user.schema';
import { Role, RoleSchema } from 'src/modules/roles/schemas/role.schema';
import { Scope, ScopeSchema } from 'src/modules/scopes/schemas/scope.schema';
import { AuditLog, AuditLogSchema } from 'src/modules/audit/schemas/audit-log.schema';
import { AdminTenantsController } from './controllers/admin-tenants.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminScopesController } from './controllers/admin-scopes.controller';
import { AdminRolesController } from './controllers/admin-roles.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminTenantsService } from './services/admin-tenants.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminScopesService } from './services/admin-scopes.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AuditModule } from 'src/modules/audit/audit.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Tenant.name, schema: TenantSchema },
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Scope.name, schema: ScopeSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
        ]),
        AuditModule,
    ],
    controllers: [
        AdminTenantsController,
        AdminUsersController,
        AdminScopesController,
        AdminRolesController,
        AdminAuditController,
    ],
    providers: [
        AdminTenantsService,
        AdminUsersService,
        AdminScopesService,
        AdminRolesService,
        AdminAuditService,
    ],
})
export class AdminModule {}

