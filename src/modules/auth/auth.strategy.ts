import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Custom extractor that checks both cookie and header
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (request: Request) => {
                    return request?.cookies?.['access_token'];
                },
            ]),
            ignoreExpiration: false, // Ensures expired tokens are rejected
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: false,
        });
    }

    async validate(payload: any) {
        // This method is called if the token is valid
        return {
            userId: payload.sub,
            username: payload.username,
            tenant: payload.tenant,
            role: payload.role,
            scopes: payload.scopes,
            isGlobalAdmin: payload.isGlobalAdmin === true,
        };
    }
}
