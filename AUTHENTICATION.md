# Authentication & CSRF Protection Documentation

## Overview

The authentication system has been refactored to use **cookie-based JWT tokens** with **CSRF protection**. This provides better security compared to storing tokens in localStorage.

## 🔐 Security Features

1. **HttpOnly Cookies**: JWT tokens are stored in httpOnly cookies, preventing XSS attacks
2. **CSRF Protection**: Token rotation on each request to prevent CSRF attacks
3. **Strict SameSite**: Cookies use `sameSite: 'strict'` for additional protection
4. **Secure Flag**: Cookies use `secure: true` in production (HTTPS only)

## 📁 New Folder Structure

```
src/
├── common/
│   ├── guards/
│   │   ├── auth.guard.ts          # JWT authentication guard
│   │   ├── scopes.guard.ts        # Role-based access control
│   │   ├── csrf.guard.ts          # CSRF protection guard
│   │   └── index.ts
│   ├── decorators/
│   │   ├── scopes.decorator.ts    # @Scopes() decorator
│   │   ├── user.decorator.ts      # @CurrentUser() decorator
│   │   └── index.ts
│   ├── middleware/
│   │   ├── csrf.middleware.ts     # CSRF token rotation
│   │   ├── request-id.middleware.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── csrf.service.ts        # CSRF token management
│   │   └── index.ts
│   ├── common.module.ts
│   └── index.ts
├── modules/
│   └── auth/
│       ├── auth.controller.ts     # Login, logout, CSRF refresh
│       ├── auth.service.ts
│       ├── auth.strategy.ts       # JWT strategy with cookie support
│       └── auth.module.ts
```

## 🔄 Authentication Flow

### 1. Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
- Sets `access_token` cookie (httpOnly)
- Sets `csrf-token` cookie (httpOnly)
- Returns CSRF token in `X-CSRF-Token` header
- Returns user information in body

```json
{
  "message": "Login successful",
  "user": {
    "userId": "...",
    "username": "John Doe",
    "email": "user@example.com",
    "role": {...}
  }
}
```

### 2. Making Authenticated Requests

For **ALL** non-GET requests (POST, PUT, DELETE, PATCH), you must include:

1. **Cookie**: Automatically sent by browser (contains JWT and CSRF token)
2. **Header**: `X-CSRF-Token: <token-value>`

**Example**:
```javascript
// Frontend example
const csrfToken = response.headers['x-csrf-token']; // Save from login response

// On every request:
fetch('/api/users', {
  method: 'POST',
  credentials: 'include', // Important: sends cookies
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // Include CSRF token
  },
  body: JSON.stringify({...})
});
```

### 3. CSRF Token Rotation

The CSRF token is automatically rotated on **every request** via middleware:
- A new CSRF token is generated
- Set in `csrf-token` cookie
- Returned in `X-CSRF-Token` response header

**Your frontend should**:
1. Read the `X-CSRF-Token` from response headers
2. Store it (in memory or sessionStorage)
3. Send it in the next request's `X-CSRF-Token` header

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Response**:
- Clears `access_token` cookie
- Clears `csrf-token` cookie

```json
{
  "message": "Logout successful"
}
```

### 5. Refresh CSRF Token (Optional)

**Endpoint**: `POST /auth/refresh-csrf`

Use this if you need to manually refresh the CSRF token.

## 🛡️ Frontend Implementation Guide

### Angular Example

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private csrfToken$ = new BehaviorSubject<string>('');
  
  constructor(private http: HttpClient) {}
  
  login(email: string, password: string) {
    return this.http.post('/auth/login', { email, password }, {
      observe: 'response',
      withCredentials: true // Important!
    }).pipe(
      tap((response: HttpResponse<any>) => {
        // Extract CSRF token from response header
        const csrfToken = response.headers.get('X-CSRF-Token');
        if (csrfToken) {
          this.csrfToken$.next(csrfToken);
          // Optionally store in sessionStorage for persistence
          sessionStorage.setItem('csrf-token', csrfToken);
        }
      })
    );
  }
  
  getCsrfToken(): string {
    return this.csrfToken$.value || sessionStorage.getItem('csrf-token') || '';
  }
  
  updateCsrfToken(token: string) {
    this.csrfToken$.next(token);
    sessionStorage.setItem('csrf-token', token);
  }
  
  logout() {
    return this.http.post('/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.csrfToken$.next('');
        sessionStorage.removeItem('csrf-token');
      })
    );
  }
}

// http.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Clone request and add CSRF token for non-GET requests
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const csrfToken = this.authService.getCsrfToken();
      req = req.clone({
        withCredentials: true,
        setHeaders: {
          'X-CSRF-Token': csrfToken
        }
      });
    } else {
      req = req.clone({ withCredentials: true });
    }
    
    return next.handle(req).pipe(
      tap(event => {
        // Update CSRF token from response
        if (event instanceof HttpResponse) {
          const newCsrfToken = event.headers.get('X-CSRF-Token');
          if (newCsrfToken) {
            this.authService.updateCsrfToken(newCsrfToken);
          }
        }
      })
    );
  }
}
```

### React/Axios Example

```javascript
// api.js
import axios from 'axios';

let csrfToken = sessionStorage.getItem('csrf-token') || '';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Important: sends cookies
});

// Request interceptor - add CSRF token
api.interceptors.request.use(
  (config) => {
    if (!['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - update CSRF token
api.interceptors.response.use(
  (response) => {
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
      sessionStorage.setItem('csrf-token', newCsrfToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    csrfToken = '';
    sessionStorage.removeItem('csrf-token');
  }
};

export default api;
```

## 🔧 Backend Usage

### Protecting Routes

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, ScopesGuard, CsrfGuard } from 'src/common/guards';
import { Scopes, CurrentUser } from 'src/common/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard, ScopesGuard) // Apply guards
export class UsersController {
  
  @Get()
  @Scopes('users:read') // Require specific scope
  findAll(@CurrentUser() user) {
    // user object is automatically injected
    return `User ${user.username} is viewing all users`;
  }
  
  @Post()
  @Scopes('users:create')
  create(@CurrentUser() user) {
    // CSRF is automatically validated by middleware for POST requests
    return 'User created';
  }
}
```

### Available Guards

1. **JwtAuthGuard**: Validates JWT from cookie
2. **ScopesGuard**: Checks user permissions
3. **CsrfGuard**: Validates CSRF token (use only if needed per-route)

### Available Decorators

1. **@Scopes(...scopes)**: Define required scopes for route
2. **@CurrentUser()**: Inject authenticated user into route handler

## 🚀 Environment Variables

No changes needed! Still uses:
```env
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:4200
NODE_ENV=production
```

## 🧪 Testing

### With Postman/Insomnia

1. **Login**:
   - POST `/auth/login` with email/password
   - Cookies are automatically saved
   - Copy `X-CSRF-Token` from response headers

2. **Subsequent Requests**:
   - Cookies are automatically sent
   - Add header: `X-CSRF-Token: <token-from-step-1>`

### With curl

```bash
# Login and save cookies
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt \
  -D headers.txt

# Extract CSRF token from headers.txt
# Make authenticated request
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -b cookies.txt \
  -d '{"name":"John"}'
```

## ⚠️ Important Notes

1. **CORS Configuration**: Ensure your frontend URL is in the CORS whitelist (already configured in `main.ts`)

2. **HTTPS in Production**: Set `NODE_ENV=production` to enable secure cookies

3. **SameSite Attribute**: Currently set to `strict`. If your frontend and backend are on different domains, change to `lax` or `none` (with `secure: true`)

4. **Token Expiration**: JWT expires in 1 hour. Implement refresh token logic if needed.

5. **Mobile Apps**: For mobile apps, you may need to implement a different auth strategy since cookie handling differs.

## 🐛 Troubleshooting

### "Invalid CSRF token" error
- Ensure you're sending the `X-CSRF-Token` header on POST/PUT/DELETE requests
- Check that cookies are being sent (`withCredentials: true`)
- Verify the CSRF token is being updated from response headers

### "No authentication token found"
- Check that cookies are enabled in your browser
- Verify `withCredentials: true` is set in your HTTP client
- Check CORS configuration

### Cookies not being set
- Verify CORS allows credentials
- Check that `withCredentials: true` is set
- Ensure frontend and backend are on allowed origins

## 📚 Additional Resources

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [HttpOnly Cookies](https://owasp.org/www-community/HttpOnly)
- [NestJS Guards](https://docs.nestjs.com/guards)

