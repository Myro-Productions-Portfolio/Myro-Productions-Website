# Authentication System - Quick Start Guide

## Get Started in 3 Steps

### 1. Set Up Environment

Create `.env.local` in the project root:

```bash
# Generate a secret: openssl rand -base64 32
JWT_SECRET=your-secret-here

# Database connection (already configured)
DATABASE_URL="postgresql://postgres:password@localhost:5432/myro_productions?schema=public"
```

### 2. Create an Admin User

```bash
# Default admin user
npx ts-node scripts/create-admin.ts

# Or with custom values
EMAIL=admin@myroproductions.com PASSWORD=YourSecurePassword NAME="Admin User" npx ts-node scripts/create-admin.ts
```

### 3. Test the Login

```bash
# Start the dev server
npm run dev

# Open in browser
# http://localhost:3000/admin
# (will redirect to login)

# Login with the credentials you created
```

## What You Can Do Now

### Access the Admin Dashboard
- Navigate to `/admin` - Protected dashboard
- Navigate to `/admin/login` - Login page

### Use in Your Code

**Server Components:**
```typescript
import { verifySessionFromCookies } from '@/lib/auth/session';

export default async function MyPage() {
  const user = await verifySessionFromCookies();
  if (!user) redirect('/admin/login');
  return <div>Welcome, {user.name}</div>;
}
```

**API Routes:**
```typescript
import { requireAuthFromCookies } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const user = await requireAuthFromCookies();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

## API Endpoints

- `POST /api/admin/auth/login` - Login
- `POST /api/admin/auth/logout` - Logout
- `GET /api/admin/auth/verify` - Check session

## Security Features

- Bcrypt password hashing (12 rounds)
- JWT session tokens (24 hour expiry)
- HTTP-only, secure, SameSite=strict cookies
- Middleware protection on all `/admin/*` routes
- Generic error messages (no email enumeration)

## Need Help?

See full documentation:
- `lib/auth/README.md` - Complete auth system docs
- `AUTHENTICATION-SYSTEM.md` - Implementation summary

## Troubleshooting

**Can't log in?**
- Check JWT_SECRET is set in `.env.local`
- Verify admin user exists in database
- Check browser console for errors

**Session not persisting?**
- Check cookie in browser DevTools
- Verify JWT_SECRET hasn't changed

**Database errors?**
- Run `npx prisma generate`
- Run `npx prisma db push`
- Check PostgreSQL is running

## Next Steps

The authentication system is ready. You can now:
1. Build the admin dashboard UI
2. Add client management features
3. Implement subscription management
4. Create payment tracking views
5. Add activity logging
