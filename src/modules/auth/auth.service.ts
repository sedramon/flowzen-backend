import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService
  ) {}

  async validateUser(email: string, password: string) : Promise<any> {
    const user = await this.userService.findByEmail(email);

    if(user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  

  async login(user: any) {
    const payload = {username: user.name, sub: user._id, role: user.role};
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
