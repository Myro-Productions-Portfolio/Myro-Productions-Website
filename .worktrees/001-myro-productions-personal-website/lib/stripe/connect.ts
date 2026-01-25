import { stripe } from './config';
import Stripe from 'stripe';

/**
 * Stripe Connect Configuration
 * Platform marketplace settings for processing payments on behalf of connected accounts
 */

// Application fee percentage (your commission)
export const APPLICATION_FEE_PERCENT = 0.15; // 15% platform fee

/**
 * Create a connected account (for bakeries/sellers)
 */
export async function createConnectedAccount(params: {
  email: string;
  businessName: string;
  type?: 'express' | 'standard' | 'custom';
}) {
  const { email, businessName, type = 'express' } = params;

  try {
    const account = await stripe.accounts.create({
      type,
      email,
      business_type: 'company',
      company: {
        name: businessName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        platform: 'Myro Productions Platform',
        onboarded_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      accountId: account.id,
      account,
    };
  } catch (error) {
    console.error('Error creating connected account:', error);
    throw error;
  }
}

/**
 * Create an account link for onboarding
 * Returns a URL where the connected account can complete onboarding
 */
export async function createAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const { accountId, refreshUrl, returnUrl } = params;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}

/**
 * Get connected account details
 */
export async function getConnectedAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      success: true,
      account,
    };
  } catch (error) {
    console.error('Error retrieving connected account:', error);
    throw error;
  }
}

/**
 * Check if connected account has completed onboarding
 */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account.details_submitted === true && account.charges_enabled === true;
  } catch (error) {
    console.error('Error checking account onboarding status:', error);
    return false;
  }
}

/**
 * Calculate application fee for a payment amount
 */
export function calculateApplicationFee(amountInCents: number): number {
  return Math.round(amountInCents * APPLICATION_FEE_PERCENT);
}

/**
 * Create a payment intent with destination (direct charge)
 * Use this when you want the platform to be liable for disputes
 */
export async function createDestinationCharge(params: {
  amount: number; // in cents
  currency: string;
  connectedAccountId: string;
  customerEmail: string;
  description?: string;
  metadata?: Stripe.MetadataParam;
}) {
  const { amount, currency, connectedAccountId, customerEmail, description, metadata } = params;

  const applicationFee = calculateApplicationFee(amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: connectedAccountId,
      },
      receipt_email: customerEmail,
      description: description || 'Platform purchase',
      metadata: {
        ...metadata,
        platform_fee: applicationFee.toString(),
        connected_account: connectedAccountId,
      },
    });

    return {
      success: true,
      paymentIntent,
      applicationFee,
    };
  } catch (error) {
    console.error('Error creating destination charge:', error);
    throw error;
  }
}

/**
 * List all connected accounts
 */
export async function listConnectedAccounts(limit: number = 100) {
  try {
    const accounts = await stripe.accounts.list({ limit });
    return {
      success: true,
      accounts: accounts.data,
    };
  } catch (error) {
    console.error('Error listing connected accounts:', error);
    throw error;
  }
}

/**
 * Delete a connected account
 */
export async function deleteConnectedAccount(accountId: string) {
  try {
    const deleted = await stripe.accounts.del(accountId);
    return {
      success: true,
      deleted,
    };
  } catch (error) {
    console.error('Error deleting connected account:', error);
    throw error;
  }
}

/**
 * Create a login link for connected account to access Express Dashboard
 */
export async function createLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return {
      success: true,
      url: loginLink.url,
    };
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
}
