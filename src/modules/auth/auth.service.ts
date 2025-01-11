/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';

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
    // Include roles and scopes in the payload
    const payload = {
      username: user.name,
      sub: user._id,
      role: user.role
    };
  
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
  
}
