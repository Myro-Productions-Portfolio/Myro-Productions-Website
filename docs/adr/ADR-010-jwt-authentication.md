# ADR-010: JWT-Based Authentication with httpOnly Cookies

## Status
Accepted

## Context
The admin dashboard requires secure authentication to protect sensitive client data, payment information, and administrative functions. Key requirements included:

- Stateless authentication for horizontal scalability
- Protection against XSS (Cross-Site Scripting) attacks
- Protection against CSRF (Cross-Site Request Forgery) attacks
- Secure session management
- Automatic token refresh
- Role-based access control (RBAC)
- Logout capability
- Token expiration and validation

Security considerations:
- Admin dashboard handles sensitive financial and client data
- Multiple admin roles (super admin, admin, viewer)
- Session hijacking prevention
- Brute force protection
- Secure password storage

## Decision
Implement JWT (JSON Web Token) authentication with httpOnly cookies for token storage, combined with bcrypt for password hashing.

Implementation includes:
- JWT tokens signed with HS256 algorithm
- httpOnly, Secure, SameSite cookies for token storage
- Short-lived access tokens (1 hour expiration)
- Refresh token mechanism (optional for future)
- Bcrypt password hashing with salt rounds
- Role-based claims in JWT payload
- Middleware-based route protection
- Logout by clearing cookies

## Consequences

### Positive
- **Stateless**: No server-side session storage required, enables horizontal scaling
- **XSS Protection**: httpOnly cookies cannot be accessed by JavaScript, preventing XSS token theft
- **CSRF Protection**: SameSite=Lax cookies provide CSRF protection
- **Scalability**: Stateless tokens work across multiple server instances
- **Standard**: JWT is industry standard with wide library support
- **Self-Contained**: Token contains all necessary claims (user ID, role, expiration)
- **Performance**: No database lookup required to validate token (signature verification only)
- **Logout**: Simple cookie deletion for logout
- **Mobile-Friendly**: Same token mechanism works for mobile apps (with different storage)

### Negative
- **Token Size**: JWTs are larger than session IDs (~200 bytes vs ~32 bytes)
- **Revocation Difficulty**: Cannot invalidate tokens before expiration without additional infrastructure
- **Cookie Overhead**: Sent with every request, increases bandwidth slightly
- **Secret Management**: JWT secret must be kept secure and rotated periodically
- **Expiration Handling**: Short expiration requires refresh mechanism for long sessions
- **Payload Visibility**: JWT payload is base64 encoded (not encrypted), should not contain sensitive data

### Neutral
- **Cookie Storage**: Requires cookie support (fine for web apps, may need adjustment for mobile)
- **Same-Domain**: httpOnly cookies only work for same-domain requests
- **Debugging**: JWT debugging requires decoding tokens (jwt.io)

## Alternatives Considered

### 1. Session-Based Authentication (Express Session)
**Why Not Chosen**:
- Requires session store (Redis, database) for scalability
- Additional infrastructure complexity
- More difficult to scale horizontally
- State management on server side
- Higher database/cache load

**Trade-off**: Easier revocation but harder to scale

### 2. OAuth 2.0 / OpenID Connect
**Why Not Chosen**:
- Overkill for single-application admin dashboard
- Requires OAuth provider (Auth0, Okta) or building OAuth server
- More complex implementation
- Not needed for internal admin users
- Higher latency from external auth provider

**Use Case**: Better for multi-application SSO or third-party auth

### 3. JWT in localStorage
**Why Not Chosen**:
- Vulnerable to XSS attacks (JavaScript can access localStorage)
- Requires CSRF token for protection
- Less secure than httpOnly cookies
- More complex client-side token management

### 4. API Keys
**Why Not Chosen**:
- No expiration mechanism
- Difficult to rotate
- No user context or claims
- Not suitable for user authentication
- Better for service-to-service auth

### 5. Passport.js
**Why Not Chosen**:
- While Passport.js is excellent, it's middleware for Express
- Next.js middleware pattern doesn't align perfectly with Passport
- Can still use JWT strategy, but adds dependency
- Prefer lighter implementation with jose library

## References
- [JWT Introduction](https://jwt.io/introduction)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Jose Library Documentation](https://github.com/panva/jose)
- [httpOnly Cookies](https://owasp.org/www-community/HttpOnly)
- [SameSite Cookie Attribute](https://web.dev/samesite-cookies-explained/)

## Implementation Notes

### JWT Structure

```
Header (Algorithm & Token Type)
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims)
{
  "sub": "admin_user_id",          // Subject (user ID)
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1700000000,               // Issued at
  "exp": 1700003600                // Expiration (1 hour)
}

Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Authentication Flow

```
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│   Client    │                │  API Route  │                │  Database   │
│  (Browser)  │                │   /login    │                │ (Prisma)    │
└─────────────┘                └─────────────┘                └─────────────┘
       │                              │                              │
       │ 1. POST /api/admin/auth/login│                              │
       │    { email, password }       │                              │
       ├─────────────────────────────▶│                              │
       │                              │                              │
       │                              │ 2. Query admin user          │
       │                              ├─────────────────────────────▶│
       │                              │                              │
       │                              │ 3. Return user + hash        │
       │                              │◀─────────────────────────────┤
       │                              │                              │
       │                              │ 4. Verify password (bcrypt)  │
       │                              │─────┐                        │
       │                              │     │                        │
       │                              │◀────┘                        │
       │                              │                              │
       │                              │ 5. Generate JWT              │
       │                              │─────┐                        │
       │                              │     │                        │
       │                              │◀────┘                        │
       │                              │                              │
       │ 6. Set-Cookie: token=JWT     │                              │
       │    (httpOnly, Secure)        │                              │
       │◀─────────────────────────────┤                              │
       │                              │                              │
       │ 7. Subsequent requests       │                              │
       │    Cookie: token=JWT         │                              │
       ├─────────────────────────────▶│                              │
       │                              │                              │
       │                              │ 8. Verify JWT signature      │
       │                              │─────┐                        │
       │                              │     │                        │
       │                              │◀────┘                        │
       │                              │                              │
       │ 9. Return protected data     │                              │
       │◀─────────────────────────────┤                              │
```

### Login Implementation

```typescript
// app/api/admin/auth/login/route.ts
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 1. Find admin user
  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // 2. Verify password
  const isValid = await bcrypt.compare(password, admin.password_hash);

  if (!isValid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // 3. Generate JWT
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  // 4. Set httpOnly cookie
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  // 5. Update last login
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { last_login: new Date() },
  });

  return Response.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
```

### Middleware Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify JWT
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-role', payload.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Invalid or expired token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

### Password Hashing

```typescript
// lib/auth.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Logout Implementation

```typescript
// app/api/admin/auth/logout/route.ts
import { cookies } from 'next/headers';

export async function POST() {
  // Clear auth cookie
  cookies().set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return Response.json({ success: true });
}
```

### Token Verification Utility

```typescript
// lib/auth.ts
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function verifyAuth() {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}
```

### Role-Based Access Control

```typescript
// lib/rbac.ts
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export const permissions = {
  [AdminRole.SUPER_ADMIN]: ['*'], // All permissions
  [AdminRole.ADMIN]: [
    'clients:read',
    'clients:write',
    'payments:read',
    'payments:refund',
    'projects:read',
    'projects:write',
  ],
  [AdminRole.VIEWER]: [
    'clients:read',
    'payments:read',
    'projects:read',
  ],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const rolePermissions = permissions[role];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}
```

### Security Best Practices

#### 1. Strong JWT Secret
```bash
# Generate strong secret (at least 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Environment Variables
```bash
# .env.local
JWT_SECRET=your-super-secret-key-at-least-32-bytes-long
```

#### 3. Cookie Configuration
```typescript
{
  httpOnly: true,           // Prevents JavaScript access
  secure: true,             // HTTPS only in production
  sameSite: 'lax',          // CSRF protection
  maxAge: 3600,             // 1 hour
  path: '/',                // Available on all routes
}
```

#### 4. Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- Not common password (check against common password list)
- Rate limiting on login attempts

#### 5. Brute Force Protection
```typescript
// Simple rate limiting (consider using a library for production)
const loginAttempts = new Map<string, number>();

function checkRateLimit(email: string): boolean {
  const attempts = loginAttempts.get(email) || 0;
  if (attempts >= 5) {
    return false; // Too many attempts
  }
  loginAttempts.set(email, attempts + 1);
  return true;
}
```

### Testing Considerations

```typescript
// Test login
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
  credentials: 'include', // Important for cookies
});

// Test protected route
const protectedResponse = await fetch('/api/admin/clients', {
  credentials: 'include', // Sends cookies
});
```

### Token Refresh Strategy (Future Enhancement)

```typescript
// Dual token approach
{
  access_token: 'short-lived-token',  // 15 minutes
  refresh_token: 'long-lived-token',  // 7 days
}

// Refresh endpoint
POST /api/admin/auth/refresh
// Returns new access token if refresh token is valid
```

### Monitoring and Logging

```typescript
// Log authentication events
await prisma.activityLog.create({
  data: {
    admin_id: admin.id,
    action: 'LOGIN',
    entity_type: 'AUTH',
    ip_address: request.headers.get('x-forwarded-for'),
    details: { success: true },
  },
});
```
