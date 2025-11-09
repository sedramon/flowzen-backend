import { Controller, Post, Body, UnauthorizedException, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto.dto';
import { CsrfService } from '../../common/services/csrf.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private csrfService: CsrfService,
        private configService: ConfigService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { email, password } = loginDto;

        const user = await this.authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const loginResult = await this.authService.login(user);
        const { access_token, user: loginUser } = loginResult;

        // Generate CSRF token
        const { token: csrfToken } = this.csrfService.generateToken();

        // Cookie options with improved security settings
        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' for better UX with external links
            maxAge: 3600000, // 1 hour
        };

        const domain = this.configService.get<string>('COOKIE_DOMAIN');
        if (domain) {
            cookieOptions.domain = domain;
        }

        // Set JWT in httpOnly cookie
        res.cookie('access_token', access_token, cookieOptions);

        // Set CSRF token in httpOnly cookie
        res.cookie('csrf-token', csrfToken, cookieOptions);

        // Send CSRF token in response header for frontend to use
        res.setHeader('X-CSRF-Token', csrfToken);

        return {
            message: 'Login successful',
            user: loginUser,
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        // Clear cookies
        res.clearCookie('access_token');
        res.clearCookie('csrf-token');

        return { message: 'Logout successful' };
    }

    @Post('refresh-csrf')
    @HttpCode(HttpStatus.OK)
    async refreshCsrf(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Generate new CSRF token
        const { token: csrfToken } = this.csrfService.generateToken();

        // Cookie options with improved security settings
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

        // Set new CSRF token in cookie
        res.cookie('csrf-token', csrfToken, cookieOptions);

        // Send in header for frontend
        res.setHeader('X-CSRF-Token', csrfToken);

        return { message: 'CSRF token refreshed' };
    }
}
