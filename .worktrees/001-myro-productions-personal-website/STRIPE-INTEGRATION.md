# Stripe Integration Guide

This document explains how to set up and use the Stripe payment integration for the Myro Productions website.

## Overview

The website now supports three types of payments:

1. **One-Time Payments** - For consultations, event deposits, and one-off services
2. **Subscriptions** - For recurring services like website hosting and support
3. **Quote-to-Payment** - Generate custom quotes that clients can pay directly

## Features

- Secure Stripe Checkout integration
- Webhook handling for payment events
- Payment success/cancellation pages
- Reusable payment button component
- Full pricing page with plan selection
- Support for both test and production modes

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create an account or sign in
3. Complete your business profile

### 2. Get API Keys

**Test Mode Keys (for development):**
1. In Stripe Dashboard, click "Developers" > "API Keys"
2. Toggle to "Test mode" in the sidebar
3. Copy your:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

**Live Mode Keys (for production):**
1. Complete Stripe account verification
2. Toggle to "Live mode"
3. Copy your:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

### 3. Create Products and Prices

**One-Time Payment Products:**

1. Go to "Products" in Stripe Dashboard
2. Click "Add product"
3. For "Event Consultation":
   - Name: Event Consultation
   - Description: One-on-one consultation for event needs
   - Pricing model: Standard pricing
   - Price: $150 USD
   - One time
   - Save and copy the Price ID (starts with `price_`)

4. For "Event Deposit":
   - Name: Event Deposit
   - Description: Secure your event date
   - Price: $500 USD
   - One time
   - Save and copy the Price ID

**Subscription Products:**

1. For "Website Hosting":
   - Name: Website Hosting
   - Description: Professional website hosting and maintenance
   - Pricing model: Standard pricing
   - Price: $29 USD
   - Recurring: Monthly
   - Save and copy the Price ID

2. For "Premium Support":
   - Name: Premium Support
   - Description: Comprehensive website support and updates
   - Price: $99 USD
   - Recurring: Monthly
   - Save and copy the Price ID

### 4. Set Up Webhooks

1. In Stripe Dashboard, go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhooks`
   - For local testing: `https://your-ngrok-url/api/stripe/webhooks`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### 5. Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Product Price IDs
STRIPE_PRODUCT_CONSULTATION=price_consultation_id_here
STRIPE_PRODUCT_EVENT_DEPOSIT=price_event_deposit_id_here
STRIPE_PRODUCT_MONTHLY_HOSTING=price_monthly_hosting_id_here
STRIPE_PRODUCT_PREMIUM_SUPPORT=price_premium_support_id_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://myroproductions.com
```

### 6. Test Webhook Locally

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Copy the webhook signing secret that appears
# Add it to .env.local as STRIPE_WEBHOOK_SECRET
```

## Testing Payments

### Test Card Numbers

Use these test cards in Stripe Checkout:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Requires Authentication:**
- Card: `4000 0027 6000 3184`

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**Full list:** [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Usage

### Pricing Page

Visit `/pricing` to see all available plans. Users can:
1. Toggle between one-time and subscription plans
2. Select a plan
3. Enter their name and email
4. Complete payment via Stripe Checkout

### Payment Button Component

Use the `PaymentButton` component anywhere in your app:

```tsx
import { PaymentButton } from '@/components/stripe/PaymentButton';

<PaymentButton
  priceId="price_xxxxxxxxxxxxx"
  customerEmail="client@example.com"
  customerName="John Doe"
  paymentType="one-time"
  description="Event consultation for wedding"
  buttonText="Pay Now"
  onSuccess={() => console.log('Payment initiated')}
  onError={(error) => console.error(error)}
/>
```

### Quote-to-Payment Integration

To integrate with the contact form:

1. Generate a custom price in Stripe
2. Store the quote ID in metadata
3. Send payment link to customer
4. Track payment status via webhooks

## Webhook Events

The webhook handler processes these events:

- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Payment confirmed
- `payment_intent.payment_failed` - Payment failed
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Recurring payment successful
- `invoice.payment_failed` - Recurring payment failed

## Security Best Practices

1. Never expose secret keys in client-side code
2. Always verify webhook signatures
3. Use HTTPS in production
4. Store sensitive data server-side only
5. Validate all input before creating checkout sessions
6. Use Stripe's built-in security features

## Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test all payment flows
- [ ] Set up proper error logging
- [ ] Configure email notifications
- [ ] Add database to store payment records
- [ ] Set up customer portal for subscription management
- [ ] Review Stripe Dashboard settings
- [ ] Enable billing/invoicing features
- [ ] Configure tax collection if applicable

## Next Steps

### Database Integration

The current implementation logs events to console. For production, add:

1. Database schema for payments/subscriptions
2. Customer records
3. Invoice storage
4. Payment history tracking

### Email Notifications

Set up automated emails for:

- Payment confirmations
- Subscription renewals
- Failed payments
- Cancellation confirmations

### Customer Portal

Enable customers to:

- View payment history
- Manage subscriptions
- Update payment methods
- Download invoices

### Quote System

Build a quote management system:

1. Admin creates quotes
2. Generate unique quote URLs
3. Customer reviews and pays
4. Track quote status
5. Integrate with accounting

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify HTTPS is configured
3. Check webhook signing secret
4. Review Stripe Dashboard webhook logs

### Payment Button Not Working

1. Verify price IDs are correct
2. Check environment variables are set
3. Ensure API keys match (test/live)
4. Check browser console for errors

### Checkout Session Errors

1. Verify price ID exists in Stripe
2. Check email format is valid
3. Ensure success/cancel URLs are valid
4. Review error logs in webhook handler

## Support

- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Stripe Discord: [https://stripe.com/discord](https://stripe.com/discord)

## File Structure

```
app/
├── api/
│   └── stripe/
│       ├── checkout/
│       │   └── route.ts          # Create checkout sessions
│       └── webhooks/
│           └── route.ts          # Handle Stripe events
├── payment/
│   ├── success/
│   │   └── page.tsx             # Payment success page
│   └── cancelled/
│       └── page.tsx             # Payment cancelled page
└── pricing/
    └── page.tsx                 # Pricing page with plans

components/
└── stripe/
    └── PaymentButton.tsx        # Reusable payment button

lib/
└── stripe/
    └── config.ts                # Stripe configuration
```

---

**Created:** 2026-01-24
**Last Updated:** 2026-01-24
