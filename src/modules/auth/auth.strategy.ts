import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensures expired tokens are rejected
      secretOrKey: process.env.JWT_SECRET, // Replace with your actual secret key
    });
  }

  async validate(payload: any) {
    // This method is called if the token is valid
    return {
    userId: payload.sub,
    username: payload.username,
    tenant: payload.tenant,
    role: payload.role, // This is now just the role ID
    scopes: payload.scopes, // Flat array of scope names
  };
  }
}
