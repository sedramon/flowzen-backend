import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Extract JWT from cookie instead of Authorization header
        const token = request.cookies?.['access_token'];
        
        if (!token) {
            throw new UnauthorizedException('No authentication token found');
        }
        
        // Add token to headers for passport-jwt to extract
        request.headers.authorization = `Bearer ${token}`;
        
        const canActivate = await super.canActivate(context);
        
        return canActivate as boolean;
    }
}
