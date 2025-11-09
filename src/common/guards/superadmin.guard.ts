import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserRole } from '../constants/user-role.enum';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Unauthorized');
        }

        const isSuperAdmin =
            user.isGlobalAdmin === true || user.role === UserRole.SUPERADMIN;

        if (!isSuperAdmin) {
            throw new ForbiddenException(
                'Only super administrators can access this resource',
            );
        }

        return true;
    }
}

