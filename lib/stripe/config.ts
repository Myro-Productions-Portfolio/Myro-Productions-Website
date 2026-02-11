import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
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
