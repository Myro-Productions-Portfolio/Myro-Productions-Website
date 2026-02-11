# Prisma Database Setup

This directory contains the Prisma ORM configuration for the Myro Productions admin dashboard.

## Database Schema

The database includes the following tables:

### Core Tables
- **clients** - Client contact information and Stripe customer IDs
- **subscriptions** - Recurring subscription tracking (linked to Stripe)
- **projects** - One-time project/event management
- **payments** - All payment transactions (one-time and subscription)
- **admin_users** - Admin authentication and authorization
- **activity_log** - Audit trail of all admin actions

## Prerequisites

1. **PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud provider (e.g., Neon, Supabase, Railway)
   - Create a database named `myro_productions`

2. **Database Connection URL**
   - Update `DATABASE_URL` in `.env` file
   - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database URL
Edit `.env` file:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/myro_productions?schema=public"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema to Database
For development (quick setup without migrations):
```bash
npm run db:push
```

Or for production (with migration history):
```bash
npm run db:migrate
```

### 5. Seed Initial Admin User
```bash
npm run db:seed
```

This creates an admin user with:
- **Email:** pmnicolasm@gmail.com
- **Password:** ChangeMe123!
- **Role:** SUPER_ADMIN

**IMPORTANT:** Change this password immediately after first login!

## Available Scripts

```bash
npm run db:generate    # Generate Prisma Client from schema
npm run db:push        # Push schema to database (dev only, no migrations)
npm run db:migrate     # Create and run migrations (production)
npm run db:seed        # Seed database with initial data
npm run db:studio      # Open Prisma Studio (visual database browser)
```

## Prisma Client Usage

Import the Prisma client singleton in your API routes or server components:

```typescript
import prisma from '@/lib/prisma';

// Example: Get all clients
const clients = await prisma.client.findMany();

// Example: Create a new client
const client = await prisma.client.create({
  data: {
    email: 'client@example.com',
    name: 'John Doe',
    company: 'Acme Corp',
    status: 'ACTIVE',
  },
});

// Example: Update client
const updated = await prisma.client.update({
  where: { id: clientId },
  data: { status: 'INACTIVE' },
});
```

## Database Migrations

### Development
Use `db:push` for quick prototyping:
```bash
npm run db:push
```

### Production
Always use migrations:
```bash
# Create a new migration
npm run db:migrate

# Deploy migrations to production
npx prisma migrate deploy
```

## Schema Changes

When modifying `schema.prisma`:

1. Update the schema file
2. Run `npm run db:generate` to regenerate Prisma Client
3. Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
4. Test changes locally
5. Commit both schema.prisma and migration files

## Enums Reference

### ClientStatus
- `ACTIVE` - Active client
- `INACTIVE` - Temporarily inactive
- `ARCHIVED` - Permanently archived

### ProductType
- `MAINTENANCE_BASIC` - Basic maintenance plan
- `MAINTENANCE_PRO` - Pro maintenance plan
- `SUPPORT_STANDARD` - Standard support
- `SUPPORT_PREMIUM` - Premium support
- `CUSTOM` - Custom product

### SubscriptionStatus
- `ACTIVE` - Active subscription
- `PAST_DUE` - Payment failed, retry in progress
- `CANCELED` - Canceled by user
- `UNPAID` - Payment failed, no retry
- `INCOMPLETE` - Initial payment pending
- `TRIALING` - In trial period

### ProjectStatus
- `PLANNING` - Planning phase
- `IN_PROGRESS` - Work in progress
- `ON_HOLD` - Temporarily paused
- `COMPLETED` - Finished
- `CANCELED` - Canceled

### PaymentType
- `ONE_TIME` - One-time payment
- `SUBSCRIPTION` - Subscription payment
- `DEPOSIT` - Project deposit
- `FINAL_PAYMENT` - Final project payment
- `REFUND` - Refunded payment

### PaymentStatus
- `PENDING` - Pending payment
- `PROCESSING` - Payment processing
- `SUCCEEDED` - Payment successful
- `FAILED` - Payment failed
- `CANCELED` - Payment canceled
- `REFUNDED` - Payment refunded

### AdminRole
- `SUPER_ADMIN` - Full access
- `ADMIN` - Standard admin access
- `VIEWER` - Read-only access

## Security Notes

- **Password Hashing:** All passwords are hashed with bcrypt (10 salt rounds)
- **Environment Variables:** Never commit `.env` file to git
- **API Keys:** Store all sensitive keys in environment variables
- **SQL Injection:** Prisma protects against SQL injection by default
- **Activity Logging:** All admin actions are logged with IP addresses

## Troubleshooting

### Connection Errors
```bash
# Test database connection
npx prisma db pull
```

### Reset Database (Development Only)
```bash
# WARNING: This deletes all data!
npx prisma migrate reset
```

### Prisma Studio
Open visual database browser:
```bash
npm run db:studio
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
