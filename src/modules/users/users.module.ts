import { Module } from '@nestjs/common';

import { UsersController } from './controller/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RolesModule } from '../roles/role.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersService } from './service/users.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        RolesModule,
        TenantsModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService,MongooseModule]
})
export class UsersModule {}
