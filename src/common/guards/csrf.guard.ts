import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { CsrfService } from '../services/csrf.service';

/**
 * Optional CSRF Guard for per-route protection
 * 
 * NOTE: CSRF protection is automatically handled by CsrfMiddleware.
 * This guard is only needed if you want to explicitly enforce CSRF validation
 * on specific routes or if middleware is not applied globally.
 * 
 * Usage:
 * @UseGuards(CsrfGuard)
 * @Post('sensitive-action')
 * async doSomething() { ... }
 */
@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(private readonly csrfService: CsrfService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const method = request.method;

        // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return true;
        }

        // Get CSRF token from header
        const headerToken = request.headers['x-csrf-token'] as string;
        
        // Get CSRF token from cookie
        const cookieToken = request.cookies?.['csrf-token'];

        // Validate tokens
        if (!this.csrfService.validateToken(headerToken, cookieToken)) {
            throw new ForbiddenException('Invalid CSRF token');
        }

        return true;
    }
}

