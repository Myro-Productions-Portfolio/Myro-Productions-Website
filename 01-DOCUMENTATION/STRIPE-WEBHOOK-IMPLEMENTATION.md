# Stripe Webhook Implementation

This document explains the Stripe webhook implementation for storing payment data in the database.

## Overview

The webhook handler processes Stripe events and stores payment, subscription, and client data in the PostgreSQL database using Prisma ORM.

## Architecture

### Files

- **`app/api/stripe/webhooks/route.ts`** - Main webhook endpoint that verifies signatures and routes events
- **`lib/stripe/webhook-handlers.ts`** - Database operations for each webhook event type
- **`lib/prisma.ts`** - Prisma client singleton
- **`prisma/schema.prisma`** - Database schema definition

## Webhook Events Handled

### 1. checkout.session.completed

**Handler:** `handleCheckoutCompleted()`

**Operations:**
- Creates or updates client record from customer email
- Links client to Stripe customer ID
- Creates payment record with status SUCCEEDED
- Links payment to subscription if applicable
- Links payment to project if metadata includes project_id

**Database Tables:**
- `clients` - Upserted
- `payments` - Created
- `subscriptions` - Linked if applicable

### 2. payment_intent.succeeded

**Handler:** `handlePaymentSucceeded()`

**Operations:**
- Updates existing payment record to SUCCEEDED status
- Sets paid_at timestamp
- Stores charge ID and payment method

**Database Tables:**
- `payments` - Updated

**Note:** May fire before checkout.session.completed, so payment record might not exist yet.

### 3. payment_intent.payment_failed

**Handler:** `handlePaymentFailed()`

**Operations:**
- Updates payment record to FAILED status
- Stores error details in metadata
- Logs failure for admin notification

**Database Tables:**
- `payments` - Updated

### 4. customer.subscription.created / customer.subscription.updated

**Handler:** `handleSubscriptionUpdate()`

**Operations:**
- Finds client by Stripe customer ID
- Creates or updates subscription record
- Maps Stripe status to database enum
- Stores period dates and cancellation info

**Database Tables:**
- `subscriptions` - Upserted

**Status Mapping:**
```typescript
Stripe Status → Database Status
active        → ACTIVE
past_due      → PAST_DUE
canceled      → CANCELED
unpaid        → UNPAID
incomplete    → INCOMPLETE
trialing      → TRIALING
```

### 5. customer.subscription.deleted

**Handler:** `handleSubscriptionCancelled()`

**Operations:**
- Updates subscription status to CANCELED
- Sets canceled_at timestamp

**Database Tables:**
- `subscriptions` - Updated

### 6. invoice.payment_succeeded

**Handler:** `handleInvoicePaymentSucceeded()`

**Operations:**
- Creates payment record for recurring subscription charge
- Links to client and subscription
- Stores invoice metadata (number, period dates)

**Database Tables:**
- `payments` - Created

### 7. invoice.payment_failed

**Handler:** `handleInvoicePaymentFailed()`

**Operations:**
- Updates subscription status to PAST_DUE
- Logs failure for admin notification

**Database Tables:**
- `subscriptions` - Updated

## Client Management

### Auto-Creation
Clients are automatically created when a checkout session completes:

```typescript
const client = await prisma.client.upsert({
  where: { email: customerEmail },
  update: {
    stripe_customer_id: customerId,
    // Update from metadata
  },
  create: {
    email: customerEmail,
    name: metadata.customer_name || email.split('@')[0],
    stripe_customer_id: customerId,
    status: 'ACTIVE',
  },
});
```

### Linking to Stripe
- Client email is unique identifier
- Stripe customer ID is stored for lookups
- Metadata from checkout can include: customer_name, company, phone

## Payment Tracking

### Payment Types
Determined from checkout metadata:

- `ONE_TIME` - Default for single payments
- `SUBSCRIPTION` - Recurring subscription charges
- `DEPOSIT` - Initial deposit payments
- `FINAL_PAYMENT` - Final project payments
- `REFUND` - Refund transactions

### Payment Statuses
- `PENDING` - Payment initiated
- `PROCESSING` - Payment processing
- `SUCCEEDED` - Payment successful
- `FAILED` - Payment failed
- `CANCELED` - Payment canceled
- `REFUNDED` - Payment refunded

### Metadata Storage
Checkout session metadata is stored in JSON format:

```typescript
metadata: {
  customer_name: "John Doe",
  company: "Acme Corp",
  phone: "+1234567890",
  project_id: "cuid123",
  payment_type: "deposit",
  // ... custom fields
}
```

## Subscription Tracking

### Product Types
Available subscription types (from Prisma schema):

- `MAINTENANCE_BASIC` - Basic maintenance plan
- `MAINTENANCE_PRO` - Professional maintenance plan
- `SUPPORT_STANDARD` - Standard support plan
- `SUPPORT_PREMIUM` - Premium support plan
- `CUSTOM` - Custom subscription

Set via metadata: `product_type: "MAINTENANCE_PRO"`

### Period Tracking
Subscriptions track billing periods:

```typescript
{
  current_period_start: Date,
  current_period_end: Date,
  cancel_at_period_end: boolean,
  canceled_at: Date | null
}
```

## Error Handling

### Graceful Degradation
All handlers use try-catch blocks:

```typescript
try {
  // Database operations
} catch (error) {
  console.error('Error handling event:', error);
  // Don't throw - webhook should still return 200
}
```

### Always Acknowledge Webhooks
Even if database operations fail, the webhook returns 200 OK:

```typescript
return NextResponse.json({
  received: true,
  error: 'Handler failed but webhook acknowledged',
});
```

**Why?** Prevents Stripe from retrying the webhook unnecessarily.

### Error Logging
Errors are logged with context:

```typescript
console.error('Webhook handler error:', error);
console.error('Event type:', event.type);
console.error('Event ID:', event.id);
```

## Security

### Signature Verification
All webhooks verify Stripe signatures before processing:

```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Environment Variables Required
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from Stripe
- `DATABASE_URL` - PostgreSQL connection string

## Testing

### Stripe CLI
Test webhooks locally using Stripe CLI:

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Trigger specific events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### Test Events
Use Stripe Dashboard to send test webhook events to your endpoint.

### Database Verification
Check database after receiving webhooks:

```sql
-- Check clients
SELECT * FROM clients ORDER BY created_at DESC LIMIT 10;

-- Check payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

-- Check subscriptions
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;
```

## Monitoring

### Logs to Watch
- **Webhook receipts:** All events logged with type and ID
- **Database operations:** Success/failure of upserts and updates
- **Payment failures:** Detailed error information
- **Subscription changes:** Status updates and cancellations

### Webhook Dashboard
Monitor webhooks in Stripe Dashboard:
- Developers → Webhooks → Event history
- See delivery attempts, responses, and retry status

## Future Enhancements

### TODO: Email Notifications
- Send confirmation emails after successful payments
- Send receipts for subscription renewals
- Notify customers of payment failures
- Alert admins of important events

### TODO: Quote Integration
- Link payments to quotes
- Update quote status when payment received
- Track deposit vs. final payment

### TODO: Activity Logging
- Create activity log entries for all webhook events
- Track admin visibility into payment flow

## Database Schema Reference

### Client
```prisma
model Client {
  id                 String    @id @default(cuid())
  email              String    @unique
  name               String
  company            String?
  phone              String?
  stripe_customer_id String?   @unique
  status             ClientStatus @default(ACTIVE)
}
```

### Payment
```prisma
model Payment {
  id                       String      @id @default(cuid())
  client_id                String
  stripe_payment_intent_id String?     @unique
  amount_cents             Int
  currency                 String      @default("usd")
  payment_type             PaymentType
  status                   PaymentStatus
  metadata                 Json?
  paid_at                  DateTime?
}
```

### Subscription
```prisma
model Subscription {
  id                     String             @id @default(cuid())
  client_id              String
  stripe_subscription_id String             @unique
  product_type           ProductType
  status                 SubscriptionStatus
  amount_cents           Int
  current_period_start   DateTime
  current_period_end     DateTime
  cancel_at_period_end   Boolean
  canceled_at            DateTime?
}
```

## References

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Event Types](https://stripe.com/docs/api/events/types)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Last Updated:** 2026-01-24
