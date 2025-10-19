import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './auth.strategy';
import { UsersModule } from '../users/users.module';
import { CsrfService } from '../../common/services/csrf.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET, // Use the secret from .env
            signOptions: { expiresIn: '60m' }, // Token validity
        }),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, CsrfService],
    exports: [CsrfService], // Export for use in other modules
})
export class AuthModule {}
