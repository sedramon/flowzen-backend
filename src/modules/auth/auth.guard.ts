import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call the super method to run Passport's JWT validation logic
    const canActivate = await super.canActivate(context);

    // Additional custom logic if needed
    return canActivate as boolean;
  }
}
