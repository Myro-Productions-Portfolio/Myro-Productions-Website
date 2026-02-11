import Stripe from 'stripe';

// Initialize Stripe with the secret key (lazy to avoid build-time errors)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _stripe: any = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as Record<string | symbol, unknown>)[prop];
  },
});

// Stripe publishable key for client-side
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Product price IDs from environment
export const STRIPE_PRODUCTS = {
  // One-time payments
  consultation: process.env.STRIPE_PRODUCT_CONSULTATION || '',
  eventDeposit: process.env.STRIPE_PRODUCT_EVENT_DEPOSIT || '',

  // Subscriptions
  monthlyHosting: process.env.STRIPE_PRODUCT_MONTHLY_HOSTING || '',
  premiumSupport: process.env.STRIPE_PRODUCT_PREMIUM_SUPPORT || '',
};

// Payment types
export type PaymentType = 'one-time' | 'subscription' | 'quote';

export interface PaymentMetadata {
  type: PaymentType;
  customerEmail: string;
  customerName: string;
  description?: string;
  quoteId?: string;
}
