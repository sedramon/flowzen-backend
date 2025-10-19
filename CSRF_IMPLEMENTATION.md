# CSRF Implementation Details

## 🔐 Double Submit Cookie Pattern

This implementation uses the **Double Submit Cookie** pattern for CSRF protection.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOGIN / FIRST REQUEST                                    │
├─────────────────────────────────────────────────────────────┤
│  Client                    Server                            │
│    │                         │                               │
│    │───── POST /login ──────>│                               │
│    │                         │ Generate random token "ABC"   │
│    │                         │ Set cookie: csrf-token=ABC    │
│    │<─── Response ───────────│ Header: X-CSRF-Token: ABC     │
│    │                         │                               │
│    │ Store "ABC" in memory   │                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. SUBSEQUENT REQUEST (POST/PUT/DELETE)                     │
├─────────────────────────────────────────────────────────────┤
│  Client                    Server                            │
│    │                         │                               │
│    │─── POST /users ────────>│ Middleware receives:          │
│    │ Cookie: csrf-token=ABC  │   - Cookie: ABC               │
│    │ Header: X-CSRF-Token:ABC│   - Header: ABC               │
│    │                         │                               │
│    │                         │ ✓ Validate: ABC === ABC       │
│    │                         │ ✓ Generate new token "XYZ"    │
│    │                         │   Set cookie: csrf-token=XYZ  │
│    │<─── Response ───────────│   Header: X-CSRF-Token: XYZ   │
│    │                         │                               │
│    │ Update stored token     │                               │
│    │ to "XYZ"                │                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. ATTACK SCENARIO                                          │
├─────────────────────────────────────────────────────────────┤
│  Attacker Site             Victim Browser      Your Server   │
│    │                            │                  │         │
│    │── Send malicious form ────>│                  │         │
│    │                            │                  │         │
│    │                   Browser submits:            │         │
│    │                   Cookie: csrf-token=ABC      │         │
│    │                   (automatic)                 │         │
│    │                   Header: X-CSRF-Token: ???   │         │
│    │                   (attacker can't know!)      │         │
│    │                            │─── POST /users ─>│         │
│    │                            │                  │         │
│    │                            │         ❌ Validation fails│
│    │                            │         Cookie: ABC        │
│    │                            │         Header: undefined  │
│    │                            │<── 403 Forbidden ──        │
└─────────────────────────────────────────────────────────────┘
```

### Why It's Secure

1. **HttpOnly Cookie**: The CSRF token in the cookie cannot be read by JavaScript (prevents XSS from stealing it)
2. **Header Requirement**: Attacker's site cannot set custom headers for cross-origin requests
3. **Same-Origin Policy**: Attacker cannot read the response headers to get the token
4. **Token Rotation**: Token changes after each request, limiting replay attack window

## 📝 Implementation Details

### CsrfService

Located: `src/common/services/csrf.service.ts`

**Purpose**: Generate and validate CSRF tokens

**Key Methods**:
- `generateToken()`: Creates a cryptographically secure random token
- `validateToken()`: Timing-safe comparison of header and cookie tokens

### CsrfMiddleware

Located: `src/common/middleware/csrf.middleware.ts`

**Purpose**: Automatically handle CSRF for all requests

**Logic Flow**:

```typescript
For GET/HEAD/OPTIONS or first request:
  ├─ Generate new token
  ├─ Set in cookie
  ├─ Send in header
  └─ Continue

For POST/PUT/DELETE/PATCH:
  ├─ Get token from cookie
  ├─ Get token from header
  ├─ Validate they match
  │   ├─ If invalid: Throw 403 error
  │   └─ If valid:
  │       ├─ Generate NEW token
  │       ├─ Set new token in cookie
  │       ├─ Send new token in header
  │       └─ Continue
  └─
```

**Key Feature**: Validates BEFORE rotating, ensuring current request uses the old token.

### CsrfGuard (Optional)

Located: `src/common/guards/csrf.guard.ts`

**Purpose**: Optional per-route CSRF validation

**When to Use**:
- If you disable the global middleware for certain routes
- If you want explicit CSRF protection on specific endpoints

**Note**: In most cases, the middleware handles everything automatically.

## 🧪 Testing the Implementation

### Test 1: Login and Get Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt \
  -D headers.txt \
  -v

# Check cookies.txt - should contain csrf-token
# Check headers.txt - should contain X-CSRF-Token
```

### Test 2: Valid CSRF Request

```bash
# Extract token from headers
TOKEN=$(grep -i "x-csrf-token" headers.txt | cut -d' ' -f2 | tr -d '\r')

# Make request with token
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -b cookies.txt \
  -d '{"name":"Test"}' \
  -v

# Should succeed (200/201)
# Response should include NEW X-CSRF-Token
```

### Test 3: Invalid CSRF Request

```bash
# Try without CSRF header
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test"}' \
  -v

# Should fail with 403 Forbidden
```

### Test 4: Token Rotation

```bash
# Make first request, save new token
TOKEN1=$(curl -X POST http://localhost:3000/api/test \
  -H "X-CSRF-Token: $TOKEN" \
  -b cookies.txt \
  -D - | grep -i "x-csrf-token" | cut -d' ' -f2 | tr -d '\r')

# Try to reuse old token (should fail)
curl -X POST http://localhost:3000/api/test \
  -H "X-CSRF-Token: $TOKEN" \
  -b cookies.txt \
  -v

# Should fail (token was rotated)

# Use new token (should succeed)
curl -X POST http://localhost:3000/api/test \
  -H "X-CSRF-Token: $TOKEN1" \
  -b cookies.txt \
  -v

# Should succeed
```

## 🔧 Configuration

### Cookie Settings

```typescript
res.cookie('csrf-token', token, {
    httpOnly: true,           // Cannot be accessed by JavaScript
    secure: NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',       // Strict cross-site policy
    maxAge: 3600000,          // 1 hour expiry
});
```

### Adjusting for Your Setup

**Different Domains (Frontend ≠ Backend)**:
```typescript
sameSite: 'lax', // or 'none' with secure: true
```

**Change Token Expiry**:
```typescript
maxAge: 7200000, // 2 hours
```

**Disable CSRF for Specific Routes**:

Option 1: Exclude from middleware
```typescript
// app.module.ts
consumer
    .apply(CsrfMiddleware)
    .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'webhooks/*', method: RequestMethod.ALL },
    )
    .forRoutes('*');
```

Option 2: Check path in middleware
```typescript
// csrf.middleware.ts
if (req.path.startsWith('/webhooks')) {
    return next();
}
```

## 🚨 Common Issues

### Issue: "Invalid CSRF token" on every request

**Cause**: Frontend not updating token after each request

**Solution**: Update token from response header:
```typescript
// After each request
const newToken = response.headers['x-csrf-token'];
if (newToken) {
    sessionStorage.setItem('csrf-token', newToken);
}
```

### Issue: Token works once, then fails

**Cause**: Token rotation working correctly! You need to use the NEW token from response

**Solution**: Implement interceptor to auto-update token

### Issue: CORS error with cookies

**Cause**: Missing `withCredentials: true`

**Solution**:
```typescript
fetch(url, { 
    credentials: 'include',  // Important!
    headers: { 'X-CSRF-Token': token }
})
```

### Issue: Cookie not being set

**Cause**: CORS or SameSite restrictions

**Solutions**:
1. Check CORS allows your frontend origin
2. Use `sameSite: 'lax'` if frontend on different subdomain
3. Use `sameSite: 'none'` with `secure: true` if completely different domains

## 📚 Security Considerations

### ✅ What This Protects Against

1. **CSRF Attacks**: Attacker sites can't forge requests
2. **XSS Token Theft**: Token in httpOnly cookie can't be stolen via XSS
3. **Timing Attacks**: Timing-safe comparison prevents timing-based token guessing
4. **Replay Attacks**: Token rotation limits replay window

### ⚠️ What This Doesn't Protect Against

1. **XSS in General**: If attacker can execute JavaScript, they can still make authenticated requests (but can't steal the JWT)
2. **Man-in-the-Middle**: Use HTTPS in production
3. **Subdomain Attacks**: Use `__Host-` prefix for cookie names in production
4. **Physical Access**: If attacker has device access, they can use the session

### 🔒 Additional Hardening (Optional)

**Use Cookie Prefixes**:
```typescript
res.cookie('__Host-csrf-token', token, {
    // ...
});
```

**Add Origin Validation**:
```typescript
const origin = req.headers.origin;
const allowedOrigins = [process.env.FRONTEND_URL];
if (origin && !allowedOrigins.includes(origin)) {
    throw new ForbiddenException('Invalid origin');
}
```

**Rate Limiting**:
```typescript
// Install: yarn add @nestjs/throttler
// Add to app.module to prevent brute force
```

## 📖 References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

