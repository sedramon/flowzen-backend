/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/service/users.service';

@Injectable()
export class AuthService {
    constructor(
    private jwtService: JwtService,
    private userService: UsersService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user: User | null = await this.userService.findByEmail(email);
  
        if (user && (await bcrypt.compare(password, user.password))) {
            const populatedUser: User | null = await this.userService.findOne(user._id);
      
            if (populatedUser) {
                const { password, ...result } = populatedUser.toObject();
                return result;
            }
        }
        throw new UnauthorizedException('Invalid email or password');
    }
  

  

    async login(user: any) {
        const roleId = user.role?._id || user.role;
        const roleScopes = user.role?.availableScopes?.map((scope) => scope.name) || [];
        const userScopes = Array.isArray(user.scopes) && user.scopes.length > 0 ? user.scopes : roleScopes;
        const tenantRecord = user.tenant && typeof user.tenant === 'object' ? user.tenant : null;
        const tenantId = tenantRecord?._id || user.tenant || null;

        const tenantInfo = tenantRecord
            ? {
                tenantId: tenantRecord._id?.toString() ?? null,
                name: tenantRecord.name,
                status: tenantRecord.status,
                hasActiveLicense: tenantRecord.hasActiveLicense,
                licenseStartDate: tenantRecord.licenseStartDate ?? null,
                licenseExpiryDate: tenantRecord.licenseExpiryDate ?? null,
                suspendedAt: tenantRecord.suspendedAt ?? null,
                suspensionReason: tenantRecord.suspensionReason ?? null,
            }
            : null;

        const payload = {
            username: user.name,
            sub: user._id,
            role: roleId,
            scopes: userScopes,
            tenant: tenantId,
            isGlobalAdmin: !!user.isGlobalAdmin
        };
  
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                userId: user._id,
                tenant: tenantInfo ?? tenantId,
                email: user.email,
                username: user.email,
                name: user.name,
                role: roleId,
                scopes: userScopes,
                isGlobalAdmin: !!user.isGlobalAdmin
            }
        };
    }
  
}
