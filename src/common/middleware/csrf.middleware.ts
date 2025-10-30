import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../services/csrf.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    constructor(
        private readonly csrfService: CsrfService,
        private readonly configService: ConfigService,
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        // Exclude auth endpoints and public waitlist claim from CSRF validation
        const path = req.originalUrl || req.url || req.path;
        const excludedPaths = ['/auth/login', '/auth/register', '/appointments/waitlist/claim-public'];
        
        if (excludedPaths.some(excluded => path.startsWith(excluded))) {
            return next();
        }

        const method = req.method;
        const existingCookieToken = req.cookies?.['csrf-token'];
        const headerToken = req.headers['x-csrf-token'] as string;

        // For safe methods (GET, HEAD, OPTIONS)
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            // If no token exists, generate one
            if (!existingCookieToken) {
                const { token } = this.csrfService.generateToken();
                
                const cookieOptions: any = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 3600000, // 1 hour
                };
                
                const domain = this.configService.get<string>('COOKIE_DOMAIN');
                if (domain) {
                    cookieOptions.domain = domain;
                }
                
                res.cookie('csrf-token', token, cookieOptions);
                res.setHeader('X-CSRF-Token', token);
            } else {
                // Token exists, just send it in header for frontend convenience
                res.setHeader('X-CSRF-Token', existingCookieToken);
            }
            return next();
        }

        // For state-changing methods, token must exist
        if (!existingCookieToken) {
            throw new ForbiddenException('CSRF token required');
        }

        // For state-changing methods (POST, PUT, DELETE, PATCH)
        // Validate FIRST, then rotate
        if (!this.csrfService.validateToken(headerToken, existingCookieToken)) {
            throw new ForbiddenException('Invalid CSRF token');
        }

        // Validation successful - generate NEW token for next request
        const { token: newToken } = this.csrfService.generateToken();
        
        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' for better UX with external links
            maxAge: 3600000,
        };
        
        const domain = this.configService.get<string>('COOKIE_DOMAIN');
        if (domain) {
            cookieOptions.domain = domain;
        }
        
        res.cookie('csrf-token', newToken, cookieOptions);
        
        res.setHeader('X-CSRF-Token', newToken);
        
        next();
    }
}

