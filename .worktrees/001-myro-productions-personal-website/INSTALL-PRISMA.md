# Prisma Installation Instructions

The Prisma setup is complete, but the dependencies need to be installed manually.

## Current Status

- [x] Prisma schema created (`prisma/schema.prisma`)
- [x] Prisma client singleton created (`lib/prisma.ts`)
- [x] Seed script created (`prisma/seed.ts`)
- [x] Environment files configured (`.env`, `.env.example`)
- [x] Package.json scripts added
- [x] Documentation created
- [ ] **Dependencies need to be installed** (see below)

## Manual Installation Required

Run the following command in PowerShell or Command Prompt:

```powershell
cd "D:\Projects\02-In-Progress\Myro-Productions-Website\.worktrees\001-myro-productions-personal-website"

npm install @prisma/client@latest prisma@latest bcrypt@latest
npm install -D @types/bcrypt@latest
```

## Verify Installation

After installation, verify the packages were installed:

```powershell
npm list @prisma/client prisma bcrypt @types/bcrypt
```

You should see:
```
myro-productions-website@0.1.0
├── @prisma/client@6.x.x
├── bcrypt@5.x.x
├── prisma@6.x.x
└── @types/bcrypt@5.x.x
```

## Next Steps After Installation

### 1. Set Up PostgreSQL Database

Choose one option:

#### Option A: Local PostgreSQL
```powershell
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# After installation, create database:
createdb myro_productions

# Update .env file:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/myro_productions?schema=public"
```

#### Option B: Cloud PostgreSQL (Recommended for Development)

**Neon (Serverless PostgreSQL - Free Tier)**
1. Go to https://neon.tech and sign up
2. Create a new project named "myro-productions"
3. Copy the connection string
4. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/myro_productions?sslmode=require"
   ```

**Supabase (Free Tier)**
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Project Settings > Database
4. Copy "Connection string" (Direct Connection)
5. Update `.env` with the connection string

### 2. Generate Prisma Client

```powershell
npm run db:generate
```

This reads `prisma/schema.prisma` and generates the TypeScript types for Prisma Client.

### 3. Push Schema to Database

For development (quick setup):
```powershell
npm run db:push
```

This creates all tables in your database without creating migration files.

For production (with migration history):
```powershell
npm run db:migrate
```

This creates a migration file and applies it to the database.

### 4. Seed Initial Admin User

```powershell
npm run db:seed
```

This creates the initial admin user:
- Email: pmnicolasm@gmail.com
- Password: ChangeMe123!
- Role: SUPER_ADMIN

**IMPORTANT:** Change this password after first login!

### 5. Verify Database Setup

Open Prisma Studio to browse your database:
```powershell
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run:
```powershell
npm run db:generate
```

### "Error: Environment variable not found: DATABASE_URL"

1. Verify `.env` file exists in project root
2. Ensure `DATABASE_URL` is set in `.env`
3. Restart your development server

### "Can't reach database server"

1. Verify PostgreSQL is running (local) or connection string is correct (cloud)
2. Check firewall settings
3. For cloud: Verify IP allowlist settings

### bcrypt Installation Issues (Windows)

If bcrypt fails to install, you may need:
1. Install Visual Studio Build Tools
2. Or use `bcryptjs` instead (pure JavaScript, no compilation)

To use bcryptjs:
```powershell
npm uninstall bcrypt
npm install bcryptjs
npm install -D @types/bcryptjs
```

Then update `prisma/seed.ts`:
```typescript
import bcrypt from 'bcryptjs';  // Change this line
```

## Files Created

```
D:\Projects\02-In-Progress\Myro-Productions-Website\.worktrees\001-myro-productions-personal-website\
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── README.md              # Prisma documentation
├── lib/
│   └── prisma.ts              # Prisma client singleton
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── package.json               # Updated with Prisma scripts
├── 01-DOCUMENTATION/
│   └── PRISMA-SETUP.md        # Setup documentation
└── INSTALL-PRISMA.md          # This file
```

## Environment Variables

Your `.env` file should have:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/myro_productions?schema=public"

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://myroproductions.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ... other environment variables
```

## Database Schema Overview

### Tables
- **clients** - Client contact information and Stripe customer IDs
- **subscriptions** - Recurring subscription tracking
- **projects** - One-time project/event management
- **payments** - All payment transactions
- **admin_users** - Admin authentication
- **activity_log** - Audit trail of admin actions

### Relationships
- Client → Subscriptions (one-to-many)
- Client → Projects (one-to-many)
- Client → Payments (one-to-many)
- Project → Payments (one-to-many)
- Subscription → Payments (one-to-many)
- Admin User → Activity Logs (one-to-many)

## Usage Example

After setup is complete, you can use Prisma in your API routes:

```typescript
import prisma from '@/lib/prisma';

// API Route: app/api/clients/route.ts
export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      subscriptions: true,
      projects: true,
    },
  });

  return Response.json(clients);
}

export async function POST(request: Request) {
  const data = await request.json();

  const client = await prisma.client.create({
    data: {
      email: data.email,
      name: data.name,
      company: data.company,
      status: 'ACTIVE',
    },
  });

  return Response.json(client);
}
```

## Support

For questions or issues:
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Neon Docs: https://neon.tech/docs
- Supabase Docs: https://supabase.com/docs

---

**Last Updated:** 2026-01-24
