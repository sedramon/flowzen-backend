import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

/**
 * CSRF Service using Double Submit Cookie pattern
 * 
 * How it works:
 * 1. Generate random token
 * 2. Store in httpOnly cookie (can't be accessed by JavaScript)
 * 3. Send same token to client via header (client stores in memory/sessionStorage)
 * 4. Client sends token back in header on requests
 * 5. Server validates: header token === cookie token
 * 6. Since attackers can't read the httpOnly cookie, they can't forge the header
 */
@Injectable()
export class CsrfService {
    private readonly TOKEN_LENGTH = 32;

    /**
     * Generate a new CSRF token
     * Uses cryptographically secure random bytes
     */
    generateToken(): { token: string } {
        const token = randomBytes(this.TOKEN_LENGTH).toString('base64url');
        return { token };
    }

    /**
     * Validate CSRF token using timing-safe comparison
     * @param headerToken - Token from X-CSRF-Token header
     * @param cookieToken - Token from csrf-token cookie
     * @returns true if tokens match
     */
    validateToken(headerToken: string | undefined, cookieToken: string | undefined): boolean {
        if (!headerToken || !cookieToken) {
            return false;
        }

        // Timing-safe comparison to prevent timing attacks
        return this.timingSafeEqual(headerToken, cookieToken);
    }

    /**
     * Timing-safe string comparison
     * Prevents attackers from using timing information to guess tokens
     */
    private timingSafeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        
        let result = 0;
        for (let i = 0; i < bufA.length; i++) {
            result |= bufA[i] ^ bufB[i];
        }
        
        return result === 0;
    }
}

