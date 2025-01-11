import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScopeModule } from './modules/scopes/scope.module';
import { RolesModule } from './modules/roles/role.module';

@Module({
  imports: [
    DatabaseModule, UsersModule, AuthModule, ScopeModule, RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
