# Stripe Connect Platform Marketplace Guide

This document explains the Stripe Connect integration that enables the Myro Productions platform to process payments on behalf of connected accounts (bakeries and other businesses).

## Overview

**Platform Model:** Marketplace with application fees
**Connected Account Type:** Express (Stripe-hosted onboarding)
**Payment Flow:** Destination charges with platform fees
**Platform Fee:** 15% of transaction amount

## How It Works

### 1. Seller Onboarding
1. Bakery visits `/connect/onboard`
2. Enters business name and email
3. System creates Stripe Express account
4. Bakery redirected to Stripe to complete onboarding
5. Links bank account and provides business details
6. Returns to `/connect/onboard/complete` when done

### 2. Payment Processing
1. Customer buys from bakery through your platform
2. Payment goes to YOUR Stripe account
3. Platform automatically deducts 15% fee
4. Remaining 85% transferred to bakery's connected account
5. Both parties get receipts and transaction records

### 3. Payouts
- Bakeries receive automatic payouts to their bank account
- Default schedule: Daily (can be configured)
- Platform controls payout timing if needed
- Stripe handles all tax reporting (1099-K forms)

## API Endpoints

### Create Connected Account
```bash
POST /api/connect/accounts

Body:
{
  "email": "bakery@example.com",
  "businessName": "Sweet Treats Bakery",
  "type": "express" // optional, defaults to express
}

Response:
{
  "success": true,
  "accountId": "acct_xxxxx",
  "account": { ... }
}
```

### Create Onboarding Link
```bash
POST /api/connect/onboard

Body:
{
  "accountId": "acct_xxxxx",
  "refreshUrl": "https://yoursite.com/connect/onboard/refresh",
  "returnUrl": "https://yoursite.com/connect/onboard/complete"
}

Response:
{
  "success": true,
  "url": "https://connect.stripe.com/setup/..."
}
```

### List Connected Accounts
```bash
GET /api/connect/accounts?limit=100

Response:
{
  "success": true,
  "accounts": [...]
}
```

### Create Checkout Session (Platform Payment)
```bash
POST /api/stripe/checkout

Body:
{
  "priceId": "price_xxxxx",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "paymentType": "one-time",
  "connectedAccountId": "acct_xxxxx", // This makes it a platform payment
  "applicationFeePercent": 0.15 // Optional override (15% = 0.15)
}

Response:
{
  "success": true,
  "sessionId": "cs_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

## Platform Fee Calculation

**Default Fee:** 15% of transaction amount

```typescript
// Example: $100 purchase
const saleAmount = 10000; // $100.00 in cents
const platformFee = 1500;  // $15.00 (15%)
const sellerReceives = 8500; // $85.00

// Stripe fees (2.9% + 30¢) are paid by the platform
const stripeFee = 290 + 30; // $3.20
// Platform net: $15.00 - $3.20 = $11.80
// Seller net: $85.00
```

**Custom Fee:**
You can override the default 15% fee on a per-transaction basis:

```javascript
{
  "connectedAccountId": "acct_xxxxx",
  "applicationFeePercent": 0.20 // 20% fee for this transaction
}
```

## Onboarding Flow

```
Seller → /connect/onboard
  ↓
POST /api/connect/accounts
  ↓
POST /api/connect/onboard
  ↓
Stripe Onboarding (external)
  ↓
/connect/onboard/complete ✓
```

If onboarding link expires:
```
Seller → /connect/onboard/refresh
  ↓
Contact Support
  ↓
Admin generates new onboarding link
```

## Configuration

### Environment Variables

```bash
# Test Mode (Development)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Live Mode (Production)
# STRIPE_SECRET_KEY=sk_live_xxxxx
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Site URL
NEXT_PUBLIC_SITE_URL=https://myroproductions.com
```

### Webhook Events (Connect)

Add these events to your webhook endpoint:

**Account Events:**
- `account.updated` - Connected account info changed
- `account.application.deauthorized` - Seller disconnected

**Payout Events:**
- `payout.created` - Payout to seller created
- `payout.paid` - Payout to seller completed
- `payout.failed` - Payout to seller failed

**Transfer Events:**
- `transfer.created` - Funds transferred to seller
- `transfer.reversed` - Transfer reversed (dispute/refund)

## Seller Management

### View All Sellers
```bash
curl http://localhost:3000/api/connect/accounts
```

### Check Seller Onboarding Status
```typescript
import { isAccountOnboarded } from '@/lib/stripe/connect';

const isReady = await isAccountOnboarded('acct_xxxxx');
// Returns: true if fully onboarded and can accept payments
```

### Generate Login Link (Seller Dashboard Access)
```typescript
import { createLoginLink } from '@/lib/stripe/connect';

const { url } = await createLoginLink('acct_xxxxx');
// Seller can access Express Dashboard at this URL
```

## Revenue & Fees

### Your Revenue Streams
1. **Application Fees** (15% of sales)
   - Automatically collected on each transaction
   - Visible in Dashboard > Payments
   - Reported separately for tax purposes

2. **Subscription Fees** (optional)
   - Can charge sellers monthly platform fee
   - Use Stripe Billing for this
   - Not yet implemented

### Your Costs
- **Stripe Payment Processing:** 2.9% + 30¢ per transaction
- **Stripe Connect:** $2/month per active connected account
- **Payout Costs:** Included in Connect fee
- **Dispute Fees:** $15 per disputed charge

### Example Economics
```
Sale: $100
Platform fee (15%): $15.00
Seller receives: $85.00

Your costs:
- Stripe processing (2.9% + 30¢): $3.20
- Connect fee (amortized): ~$0.10

Your net profit: $15.00 - $3.20 - $0.10 = $11.70 per $100 sale
Margin: 11.7%
```

## Testing

### Test Connected Accounts

In test mode, you can create test connected accounts:
1. Visit `/connect/onboard` on localhost
2. Use any email (e.g., test@example.com)
3. Use test business details in Stripe onboarding
4. Use test bank account: `000123456789`
5. Use test SSN: `000-00-0000`

### Test Platform Payments

1. Create test connected account
2. Complete onboarding
3. Make payment with test card: `4242 4242 4242 4242`
4. Verify in Stripe Dashboard:
   - Payment shows application fee
   - Transfer to connected account created
   - Both accounts show transaction

## Security & Compliance

### Platform Responsibilities
- **Merchant of Record:** You're legally responsible for sales
- **Tax Reporting:** Stripe handles 1099-K for sellers
- **PCI Compliance:** Stripe handles card data
- **Dispute Handling:** Platform manages all disputes
- **Fraud Prevention:** Use Radar for Platforms

### Seller Verification
Stripe verifies:
- Business name and address
- Bank account ownership
- Identity (SSN/EIN)
- Business type and structure

**Onboarding Requirements:**
- Business information
- Bank account
- Identity verification
- Tax information (W-9 or W-8)

## Production Checklist

Before going live:

**Stripe Configuration:**
- [ ] Switch to live API keys
- [ ] Set up live webhook endpoint
- [ ] Configure Connect settings in Dashboard
- [ ] Set platform statement descriptor
- [ ] Configure payout schedules
- [ ] Enable Radar for Platforms

**Legal & Compliance:**
- [ ] Review Stripe Connected Account Agreement
- [ ] Create seller terms of service
- [ ] Create privacy policy for sellers
- [ ] Set up tax reporting
- [ ] Review state money transmitter licenses (if required)

**Platform Setup:**
- [ ] Configure application fee percentage
- [ ] Set minimum payout threshold
- [ ] Create seller onboarding documentation
- [ ] Build seller support system
- [ ] Set up seller notification emails

**Testing:**
- [ ] Test full seller onboarding flow
- [ ] Test platform payments with fees
- [ ] Test payouts to seller accounts
- [ ] Test refunds and disputes
- [ ] Test seller dashboard access

## Troubleshooting

### Seller Can't Complete Onboarding
**Issue:** Onboarding link expired
**Solution:** Generate new link via API or Dashboard

**Issue:** Bank account verification fails
**Solution:** Seller needs to verify micro-deposits

### Platform Fee Not Applied
**Issue:** Payment shows no application fee
**Solution:** Ensure `connectedAccountId` is passed to checkout

### Payout Failed
**Issue:** Bank account info incorrect
**Solution:** Seller updates bank info in Express Dashboard

## Next Steps

### Phase 1: Basic Platform (Complete)
- [x] Connected account creation
- [x] Seller onboarding flow
- [x] Platform payments with fees
- [x] Onboarding pages

### Phase 2: Seller Management
- [ ] Admin dashboard to view all sellers
- [ ] Seller status monitoring
- [ ] Manual payout controls
- [ ] Seller analytics

### Phase 3: Product Management
- [ ] Product listings for each seller
- [ ] Inventory management
- [ ] Order management system
- [ ] Seller-specific pricing

### Phase 4: Advanced Features
- [ ] Seller subscription fees
- [ ] Instant payouts (premium feature)
- [ ] Multi-currency support
- [ ] Advanced fraud detection

## Resources

- **Stripe Connect Docs:** https://stripe.com/docs/connect
- **Express Accounts:** https://stripe.com/docs/connect/express-accounts
- **Application Fees:** https://stripe.com/docs/connect/charges#collecting-fees
- **Destination Charges:** https://stripe.com/docs/connect/destination-charges
- **Platform Pricing Tool:** https://dashboard.stripe.com/settings/connect/pricing

## Support

- **Platform Technical Issues:** pmnicolasm@gmail.com
- **Stripe Connect Support:** https://support.stripe.com
- **Seller Support:** Create dedicated support channel

---

**Created:** 2026-01-24
**Last Updated:** 2026-01-24
**Platform Fee:** 15%
**Account Type:** Express
