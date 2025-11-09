import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ADMIN_SETUP_PROTECT_TOKEN } from '../constants';

@Injectable()
export class AdminSetupGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const bodyToken = request.body?.protectToken;
        const headerToken = request.headers['x-setup-token'];
        const token = bodyToken || headerToken;

        if (token !== ADMIN_SETUP_PROTECT_TOKEN) {
            throw new ForbiddenException('Invalid setup token');
        }

        return true;
    }
}

