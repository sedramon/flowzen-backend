# Authentication Migration Guide

## Summary of Changes

The authentication system has been completely refactored to use cookie-based authentication with CSRF protection.

## 🎯 What Changed

### 1. **New Folder Structure**

Created `src/common/` directory with organized subdirectories:

```
src/common/
├── guards/          # Auth, Scopes, CSRF guards
├── decorators/      # Scopes, CurrentUser decorators
├── middleware/      # CSRF rotation, Request ID
├── services/        # CSRF service
└── common.module.ts
```

### 2. **Files Created**

- ✅ `src/common/services/csrf.service.ts` - CSRF token generation and validation
- ✅ `src/common/middleware/csrf.middleware.ts` - CSRF token rotation
- ✅ `src/common/middleware/request-id.middleware.ts` - Request ID generation
- ✅ `src/common/guards/csrf.guard.ts` - CSRF validation guard
- ✅ `src/common/decorators/user.decorator.ts` - @CurrentUser() decorator
- ✅ `src/common/decorators/scopes.decorator.ts` - Moved from auth module
- ✅ `src/common/common.module.ts` - Global module for common services
- ✅ `src/common/index.ts` - Barrel export

### 3. **Files Modified**

#### Authentication Core
- ✅ `src/modules/auth/auth.controller.ts`
  - Added cookie-based response handling
  - Added CSRF token generation on login
  - Added logout endpoint
  - Added CSRF refresh endpoint

- ✅ `src/modules/auth/auth.strategy.ts`
  - Updated to extract JWT from cookies
  - Supports both cookie and header-based JWT

- ✅ `src/modules/auth/auth.module.ts`
  - Added CsrfService provider
  - Exports CsrfService

#### Guards
- ✅ `src/common/guards/auth.guard.ts`
  - Updated to read JWT from cookies
  - Automatically adds token to Authorization header for Passport

- ✅ `src/common/guards/scopes.guard.ts`
  - Updated import path for decorator

#### Application Setup
- ✅ `src/main.ts`
  - Added cookie-parser middleware
  - Removed inline request-id middleware (moved to middleware class)

- ✅ `src/app.module.ts`
  - Added CommonModule import
  - Added middleware configuration (RequestIdMiddleware, CsrfMiddleware)

#### All Controllers (11 files updated)
Updated import statements from:
```typescript
import { Scopes } from 'src/modules/auth/scopes.decorator';
```
to:
```typescript
import { Scopes } from 'src/common/decorators';
```

**Updated controllers**:
- `src/modules/employees/controller/employees.controller.ts`
- `src/modules/users/controller/users.controller.ts`
- `src/modules/working-shifts/controller/working-shifts.controller.ts`
- `src/modules/settings/controller/settings.controller.ts`
- `src/modules/facility/controller/facility.controller.ts`
- `src/modules/roles/controller/role.controller.ts`
- `src/modules/suppliers/controller/supplier.controller.ts`
- `src/modules/services/controller/services.controller.ts`
- `src/modules/clients/controller/clients.controller.ts`
- `src/modules/articles/controller/article.controller.ts`
- `src/modules/appointments/controller/appointments.controller.ts`

### 4. **Files Deleted**

- ❌ `src/modules/auth/scopes.decorator.ts` - Moved to `src/common/decorators/`

### 5. **Packages Added**

```bash
yarn add cookie-parser @types/cookie-parser
```

(Note: `csurf` was installed but we use a custom implementation instead)

## 🔄 Breaking Changes

### Frontend Must Be Updated

**Old Way (Bearer Token)**:
```typescript
// ❌ Old - Don't use this anymore
const token = localStorage.getItem('token');
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**New Way (Cookies + CSRF)**:
```typescript
// ✅ New - Use this
fetch('/api/users', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: {
    'X-CSRF-Token': csrfToken // Get from login response
  }
});
```

### Backend Routes (No Breaking Changes)

All existing routes work the same way. The changes are transparent to existing controllers.

## ✅ Backward Compatibility

The JWT strategy still supports Authorization header, so existing clients using Bearer tokens will continue to work until you migrate them to cookie-based auth.

## 📋 Migration Checklist

### Backend (Already Done) ✅
- [x] Install cookie-parser
- [x] Create common module structure
- [x] Implement CSRF service and middleware
- [x] Update auth guards and strategy
- [x] Update auth controller for cookies
- [x] Update all imports
- [x] Configure middleware in app.module

### Frontend (TODO)
- [ ] Update login flow to handle cookies
- [ ] Implement CSRF token storage and rotation
- [ ] Add HTTP interceptor for CSRF tokens
- [ ] Update all API calls to use `withCredentials: true`
- [ ] Remove localStorage token storage
- [ ] Test all authenticated endpoints

### Testing (TODO)
- [ ] Test login flow
- [ ] Test CSRF token rotation
- [ ] Test authenticated requests
- [ ] Test logout
- [ ] Test invalid CSRF tokens
- [ ] Test expired JWT
- [ ] Test CORS with credentials

## 🚀 Deployment Notes

1. **Environment Variables**: No changes needed
2. **Database**: No migrations needed
3. **Dependencies**: Run `yarn install` on server
4. **Build**: Run `yarn build`
5. **CORS**: Ensure frontend URL is whitelisted (already configured)

## 🧪 Testing the Changes

### 1. Start the server
```bash
yarn start:dev
```

### 2. Test login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt \
  -v
```

Look for:
- `Set-Cookie: access_token=...`
- `Set-Cookie: csrf-token=...`
- `X-CSRF-Token:` header in response

### 3. Test authenticated request
```bash
# Extract CSRF token from previous response
CSRF_TOKEN="<token-from-step-2>"

curl -X GET http://localhost:3000/api/users \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -v
```

### 4. Test CSRF protection
```bash
# Try without CSRF token (should fail)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"test"}' \
  -v

# Should return: 403 Forbidden - Invalid CSRF token
```

## 📞 Support

If you encounter any issues:

1. Check `AUTHENTICATION.md` for detailed documentation
2. Verify all environment variables are set
3. Ensure cookies are enabled in browser/client
4. Check CORS configuration for your frontend URL
5. Verify `withCredentials: true` is set in HTTP client

## 🔒 Security Improvements

This migration provides:

1. ✅ **XSS Protection**: JWT stored in httpOnly cookies (not accessible to JavaScript)
2. ✅ **CSRF Protection**: Token rotation on every request
3. ✅ **Secure Transport**: Secure flag in production (HTTPS only)
4. ✅ **SameSite Protection**: Strict SameSite policy prevents cross-origin attacks
5. ✅ **Token Rotation**: CSRF tokens change on every request

## 📚 Additional Documentation

- See `AUTHENTICATION.md` for complete API documentation
- See `README.md` for general project information

