import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantScopesGuard } from './scopes.guard';

@Injectable()
export class GlobalScopesGuard extends TenantScopesGuard {
    constructor(reflector: Reflector) {
        super(reflector);
    }

    canActivate(context: ExecutionContext): boolean {
        const required = this.getRequiredScopes(context);

        if (required.some((scope) => !scope.startsWith('global.'))) {
            throw new ForbiddenException(
                'Global routes must require global.* scopes only',
            );
        }

        return super.canActivate(context);
    }
}

