# Admin Authentication System

Secure session-based authentication for the Myro Productions admin dashboard.

## Overview

This authentication system provides:
- Secure password hashing with bcrypt (12 rounds)
- JWT-based session management with jose
- HTTP-only, secure cookies
- Middleware protection for admin routes
- Role-based access control (via Prisma schema)

## Architecture

```
lib/auth/
├── password.ts      - Password hashing and verification
├── session.ts       - JWT session management
├── middleware.ts    - Route protection helpers
└── README.md        - This file

app/api/admin/auth/
├── login/route.ts   - POST /api/admin/auth/login
├── logout/route.ts  - POST /api/admin/auth/logout
└── verify/route.ts  - GET /api/admin/auth/verify

app/admin/
├── login/page.tsx   - Login page
└── page.tsx         - Dashboard (protected)

middleware.ts        - Global middleware with admin route protection
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Generate with: openssl rand -base64 32
JWT_SECRET=your-32-byte-base64-secret-here

# PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/myro_productions?schema=public"
```

### 2. Database Setup

The `AdminUser` model is already in the Prisma schema. Generate the client:

```bash
npx prisma generate
npx prisma db push
```

### 3. Create an Admin User

You'll need to create an admin user manually in the database. Use the password hashing utility:

```typescript
// scripts/create-admin.ts
import { hashPassword } from '@/lib/auth/password';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  const password = 'your-secure-password';
  const hash = await hashPassword(password);

  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@myroproductions.com',
      password_hash: hash,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Admin created:', admin);
}

createAdmin();
```

Run with:
```bash
npx ts-node scripts/create-admin.ts
```

## Usage

### Protecting Routes in Middleware

The middleware automatically protects all `/admin/*` routes except `/admin/login` and `/api/admin/auth/*`.

If a user is not authenticated, they're redirected to `/admin/login?redirect=/admin/original-path`.

### Using in Server Components

```typescript
import { verifySessionFromCookies } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await verifySessionFromCookies();

  if (!user) {
    redirect('/admin/login');
  }

  return <div>Welcome, {user.name}</div>;
}
```

### Using in API Routes

```typescript
import { requireAuthFromCookies } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const user = await requireAuthFromCookies();
    // User is authenticated
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

### Using in Middleware

```typescript
import { requireAuth } from '@/lib/auth/middleware';

export async function middleware(request: NextRequest) {
  const result = await requireAuth(request);

  if (result instanceof NextResponse) {
    // User is not authenticated, redirect response returned
    return result;
  }

  // User is authenticated, result is AdminUser
  const user = result;
  // Continue processing...
}
```

## API Endpoints

### POST /api/admin/auth/login

Authenticate an admin user and create a session.

**Request:**
```json
{
  "email": "admin@myroproductions.com",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "admin@myroproductions.com",
      "name": "Admin User"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### POST /api/admin/auth/logout

Destroy the current session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/admin/auth/verify

Verify the current session and return user information.

**Response (Authenticated):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "admin@myroproductions.com",
      "name": "Admin User"
    }
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

## Security Features

### Password Hashing
- **Algorithm:** bcrypt
- **Rounds:** 12 (configurable in `lib/auth/password.ts`)
- **Salt:** Automatically generated per password

### Session Management
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Token:** JWT signed with `JWT_SECRET`
- **Expiration:** 24 hours
- **Storage:** HTTP-only cookie named `admin_session`

### Cookie Security
- **HttpOnly:** `true` - Cannot be accessed via JavaScript
- **Secure:** `true` in production (HTTPS only)
- **SameSite:** `strict` - Prevents CSRF attacks
- **Path:** `/` - Available to all routes

### Route Protection
- Middleware checks all `/admin/*` routes
- Redirects unauthenticated users to login
- Preserves intended destination in redirect URL
- Already-authenticated users are redirected from login page

### Error Messages
- Generic error messages to prevent email enumeration
- "Invalid email or password" for both incorrect email and password
- No indication whether email exists in the system

## Role-Based Access Control

The `AdminUser` model includes a `role` field with three levels:

```typescript
enum AdminRole {
  SUPER_ADMIN  // Full access
  ADMIN        // Standard admin access
  VIEWER       // Read-only access
}
```

To implement role-based access control:

```typescript
import { verifySessionFromCookies } from '@/lib/auth/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireRole(minimumRole: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER') {
  const user = await verifySessionFromCookies();
  if (!user) throw new Error('Unauthorized');

  const admin = await prisma.adminUser.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const roleHierarchy = { VIEWER: 1, ADMIN: 2, SUPER_ADMIN: 3 };
  if (!admin || roleHierarchy[admin.role] < roleHierarchy[minimumRole]) {
    throw new Error('Forbidden');
  }

  return user;
}
```

## Testing

### Manual Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin`
   - Should redirect to `/admin/login`

3. Try logging in with invalid credentials
   - Should show "Invalid email or password"

4. Log in with valid credentials
   - Should redirect to `/admin` dashboard
   - Should see user information

5. Try accessing `/admin/login` while logged in
   - Should redirect to `/admin`

6. Log out
   - Should clear session and redirect to login

7. Try accessing `/admin` after logging out
   - Should redirect to `/admin/login`

### Automated Testing

TODO: Add integration tests for authentication flow

## Troubleshooting

### "JWT_SECRET environment variable is not set"
- Make sure `.env.local` exists with `JWT_SECRET`
- Generate a secret: `openssl rand -base64 32`
- Restart the dev server after adding

### "Failed to hash password" / "Failed to verify password"
- Check that bcryptjs is installed: `npm list bcryptjs`
- Reinstall if needed: `npm install bcryptjs @types/bcryptjs`

### "Unauthorized" when accessing protected routes
- Check that you're logged in
- Verify session cookie exists in browser dev tools
- Check that `JWT_SECRET` matches between sessions

### Database connection errors
- Verify `DATABASE_URL` in `.env.local`
- Check PostgreSQL is running
- Run `npx prisma db push` to sync schema

## Next Steps

1. Create admin user creation script
2. Implement role-based access control
3. Add password reset functionality
4. Add two-factor authentication (optional)
5. Add session management (view/revoke active sessions)
6. Add activity logging for admin actions
7. Implement rate limiting for login attempts

## Dependencies

```json
{
  "dependencies": {
    "jose": "^5.x",
    "bcryptjs": "^2.x",
    "@prisma/client": "^5.x",
    "zod": "^4.x"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.x"
  }
}
```
