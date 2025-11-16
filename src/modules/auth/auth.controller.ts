import { Controller, Post, Body, UnauthorizedException, Res, Req, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto.dto';
import { CsrfService } from '../../common/services/csrf.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private csrfService: CsrfService,
        private configService: ConfigService,
    ) { }


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

    @Get('validate')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async validateSession(@Req() req: any) {
        // The JWT is already validated by JwtAuthGuard
        // CSRF token is automatically sent in X-CSRF-Token header by CSRF middleware (GET request)
        const user = req.user;

        return {
            valid: true,
            user: {
                userId: user.sub,
                name: user.username,
                email: user.email,
                role: user.role,
                tenant: user.tenant,
                scopes: user.scopes || []
            }
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        // Clear cookies
        res.clearCookie('access_token');
        res.clearCookie('csrf-token');

        return { message: 'Logout successful' };
    }

    // Note: CSRF token refresh is handled automatically by CSRF middleware
    // - GET requests generate tokens if none exists
    // - POST/PUT/DELETE auto-rotate tokens after validation
    // - No manual refresh endpoint needed
}
