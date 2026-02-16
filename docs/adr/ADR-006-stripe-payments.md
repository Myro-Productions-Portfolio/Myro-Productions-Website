# ADR-006: Stripe for Payment Processing

## Status
Accepted

## Context
The portfolio website requires payment processing capabilities for:
- One-time project payments
- Recurring subscription billing (maintenance packages, support plans)
- Secure payment method storage
- Invoice generation and management
- Refund processing
- Payment analytics and reporting
- PCI compliance without handling sensitive card data

Requirements included:
- Industry-standard security and PCI compliance
- Support for multiple payment methods
- Webhook notifications for payment events
- International payment support
- Strong API and TypeScript support
- Comprehensive documentation

## Decision
Implement Stripe as the payment processing platform with full webhook integration.

Implementation includes:
- Stripe API v12+ for server-side operations
- Stripe.js and React Stripe.js for client-side payment UI
- Webhook handlers for asynchronous payment events
- Stripe Customer Portal for subscription management
- Payment intents for one-time payments
- Subscriptions API for recurring billing
- Idempotent operations to prevent duplicate charges

## Consequences

### Positive
- **Security**: PCI DSS Level 1 certified, handles card data without exposing application to risk
- **Developer Experience**: Excellent API design, comprehensive TypeScript support, extensive documentation
- **Payment Methods**: Support for cards, ACH, Apple Pay, Google Pay, and 100+ payment methods
- **International**: Multi-currency support with automatic currency conversion
- **Webhooks**: Reliable event system for asynchronous payment notifications
- **Subscription Management**: Built-in support for recurring billing, proration, upgrades/downgrades
- **Customer Portal**: Self-service portal for customers to manage subscriptions
- **Testing**: Robust test mode with test cards and webhook testing tools
- **Compliance**: Handles regulatory compliance (PCI DSS, SCA, etc.)
- **Analytics**: Built-in reporting and analytics dashboard

### Negative
- **Transaction Fees**: 2.9% + $0.30 per successful card charge (standard pricing)
- **Vendor Lock-in**: Significant effort to migrate to another payment processor
- **Complexity**: Webhook handling adds architectural complexity
- **Testing Challenges**: Requires careful testing of webhook flows and edge cases
- **Account Risks**: Stripe can freeze accounts if they suspect fraud
- **Currency Conversion**: International payments include additional conversion fees

### Neutral
- **API-First**: Stripe is API-first, requires backend implementation (no embedded checkout)
- **Webhook Dependency**: Critical payment flows depend on webhook delivery
- **Test Mode**: Separate test and production environments require careful management

## Alternatives Considered

### 1. PayPal
**Why Not Chosen**:
- Less developer-friendly API
- Weaker TypeScript support
- Legacy UI/UX patterns
- More complex integration
- Less flexible subscription management
- Higher support ticket volume

### 2. Square
**Why Not Chosen**:
- Primarily focused on in-person payments
- Less sophisticated online payment features
- Weaker webhook system
- Smaller ecosystem of integrations
- Less international support

### 3. Braintree (PayPal)
**Why Not Chosen**:
- More complex API than Stripe
- Legacy codebase with technical debt
- Less active development and innovation
- Weaker documentation
- Owned by PayPal (trust concerns)

### 4. Authorize.net
**Why Not Chosen**:
- Dated API design
- Poor developer experience
- Weak subscription management
- Legacy UI patterns
- Less modern payment method support

### 5. Paddle
**Why Not Chosen**:
- Merchant of record model changes tax handling (not needed)
- Less flexible API
- Primarily focused on SaaS products
- Higher fees in some scenarios

## References
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)

## Implementation Notes

### Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│  Next.js    │◀───────│   Stripe    │
│  (Browser)  │         │  API Routes │         │   Servers   │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │ 1. Create Intent       │ 2. Create Intent       │
      │ ────────────────────▶  │ ────────────────────▶ │
      │                        │                        │
      │ 3. Client Secret       │ 4. Client Secret       │
      │ ◀────────────────────  │ ◀──────────────────── │
      │                        │                        │
      │ 5. Confirm Payment     │                        │
      │ ──────────────────────────────────────────────▶│
      │                        │                        │
      │                        │ 6. Webhook Event       │
      │                        │ ◀──────────────────── │
      │                        │                        │
      │                        │ 7. Update DB           │
      │                        │ ────────────────────▶  │
```

### Payment Flow Implementation

#### 1. One-Time Payments (Payment Intents)
```typescript
// app/api/payments/create-intent/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { amount, currency = 'usd', metadata } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return Response.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

#### 2. Subscription Setup
```typescript
// Create customer and subscription
const customer = await stripe.customers.create({
  email: clientEmail,
  metadata: { clientId: client.id },
});

const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: priceId }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

#### 3. Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    // ... other event handlers
  }

  return Response.json({ received: true });
}
```

### Security Measures

1. **Webhook Signature Verification**: Always verify webhook signatures
2. **Idempotency Keys**: Use idempotency keys for create operations
3. **Environment Variables**: Store API keys in environment variables, never in code
4. **HTTPS Only**: All Stripe API calls require HTTPS
5. **Test Mode**: Use test keys in development, production keys only in production
6. **Amount Validation**: Validate amounts on server-side before creating intents
7. **Metadata Sanitization**: Sanitize any user input before adding to metadata

### Error Handling

```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card declined
    return Response.json({ error: error.message }, { status: 400 });
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    // Invalid parameters
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } else {
    // Other errors
    console.error('Stripe error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Testing Strategy

1. **Test Cards**: Use Stripe test card numbers (4242 4242 4242 4242)
2. **Webhook Testing**: Use Stripe CLI to forward webhooks to localhost
3. **Test Mode**: Separate test and production environments
4. **Amount Testing**: Test various amounts including edge cases (0, negative, very large)
5. **Error Scenarios**: Test declined cards, network failures, webhook retries

### Database Integration

```typescript
// Sync Stripe data with Prisma database
await prisma.payment.create({
  data: {
    client_id: clientId,
    stripe_payment_intent_id: paymentIntent.id,
    amount_cents: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'SUCCEEDED',
    paid_at: new Date(),
  },
});
```

### Stripe CLI for Development

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Monitoring and Observability

- Log all Stripe API calls and responses
- Monitor webhook delivery success rates
- Set up alerts for failed payments
- Track payment conversion rates
- Monitor for unusual activity or fraud patterns
