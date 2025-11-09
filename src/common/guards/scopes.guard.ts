import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/scopes.decorator';

@Injectable()
export class TenantScopesGuard implements CanActivate {
    constructor(protected readonly reflector: Reflector) { }

    protected getRequiredScopes(context: ExecutionContext): string[] {
        return (
            this.reflector.get<string[]>(SCOPES_KEY, context.getHandler()) || []
        );
    }

    protected getUserScopes(context: ExecutionContext): string[] {
        const req = context.switchToHttp().getRequest();
        return req?.user?.scopes || [];
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredScopes = this.getRequiredScopes(context);
        const userScopes = this.getUserScopes(context);

        const missing = requiredScopes.filter(
            (scope) => !userScopes.includes(scope),
        );

        if (missing.length) {
            throw new ForbiddenException(
                `Missing required scopes: ${missing.join(', ')}`,
            );
        }

        return true;
    }
}

export { TenantScopesGuard as ScopesGuard };
