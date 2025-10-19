import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/scopes.decorator';



@Injectable()
export class ScopesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredScopes =
            this.reflector.get<string[]>(SCOPES_KEY, context.getHandler()) || [];

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        const userScopeNames: string[] = user?.scopes || [];

        const missing = requiredScopes.filter(
            (scope) => !userScopeNames.includes(scope),
        );

        if (missing.length) {
            throw new ForbiddenException(
                `Missing required scopes: ${missing.join(', ')}`,
            );
        }

        return true;
    }

}
