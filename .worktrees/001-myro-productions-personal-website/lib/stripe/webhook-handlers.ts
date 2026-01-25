import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { PaymentType, PaymentStatus, SubscriptionStatus } from '@prisma/client';

/**
 * Handle checkout session completed event
 * Creates/updates client record, creates payment record, and subscription if applicable
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_email;
    const customerId = session.customer as string | null;
    const metadata = session.metadata || {};

    if (!customerEmail) {
      console.error('No customer email in checkout session:', session.id);
      return;
    }

    // Create or update client
    const client = await prisma.client.upsert({
      where: { email: customerEmail },
      update: {
        stripe_customer_id: customerId || undefined,
        name: metadata.customer_name || customerEmail.split('@')[0],
        company: metadata.company || undefined,
        phone: metadata.phone || undefined,
      },
      create: {
        email: customerEmail,
        name: metadata.customer_name || customerEmail.split('@')[0],
        company: metadata.company || undefined,
        phone: metadata.phone || undefined,
        stripe_customer_id: customerId || undefined,
        status: 'ACTIVE',
      },
    });

    console.log('Client created/updated:', client.id);

    // Determine payment type from metadata
    const paymentType = determinePaymentType(metadata);
    const amountTotal = session.amount_total || 0;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        client_id: client.id,
        stripe_payment_intent_id: session.payment_intent as string | null,
        amount_cents: amountTotal,
        currency: session.currency || 'usd',
        payment_type: paymentType,
        status: 'SUCCEEDED',
        payment_method: session.payment_method_types?.[0] || null,
        metadata: metadata as any,
        paid_at: new Date(),
      },
    });

    console.log('Payment record created:', payment.id);

    // If this is a subscription checkout, handle subscription creation
    if (session.subscription) {
      await handleSubscriptionFromSession(session, client.id);
    }

    // If this is linked to a project (from metadata), link the payment
    if (metadata.project_id) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { project_id: metadata.project_id },
      });
    }

    console.log('Checkout session completed successfully:', {
      sessionId: session.id,
      clientId: client.id,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    // Don't throw - webhook should still return 200
  }
}

/**
 * Handle payment intent succeeded event
 * Updates existing payment record or creates new one
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Try to find existing payment record
    const existingPayment = await prisma.payment.findUnique({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (existingPayment) {
      // Update existing payment
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'SUCCEEDED',
          paid_at: new Date(),
          stripe_charge_id: paymentIntent.latest_charge as string | null,
          payment_method: paymentIntent.payment_method_types?.[0] || undefined,
        },
      });
      console.log('Payment status updated to SUCCEEDED:', existingPayment.id);
    } else {
      // Payment record doesn't exist yet - this can happen if payment_intent.succeeded
      // fires before checkout.session.completed
      console.log('Payment intent succeeded but no payment record found:', paymentIntent.id);
      // We'll create it when checkout.session.completed fires
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle payment intent failed event
 * Updates payment status and logs failure details
 */
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const existingPayment = await prisma.payment.findUnique({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...(existingPayment.metadata as any),
            last_payment_error: paymentIntent.last_payment_error,
            failed_at: new Date().toISOString(),
          },
        },
      });
      console.log('Payment marked as FAILED:', existingPayment.id);
    } else {
      console.log('Payment intent failed but no payment record found:', paymentIntent.id);
    }

    // Log the failure for admin notification
    console.error('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      error: paymentIntent.last_payment_error?.message,
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle subscription created/updated event
 * Creates or updates subscription record
 */
export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;

    // Find client by Stripe customer ID
    const client = await prisma.client.findUnique({
      where: { stripe_customer_id: customerId },
    });

    if (!client) {
      console.error('No client found for Stripe customer:', customerId);
      return;
    }

    // Map Stripe subscription status to our enum
    const status = mapSubscriptionStatus(subscription.status);

    // Get product type from metadata or default to CUSTOM
    const productType = (subscription.metadata?.product_type || 'CUSTOM') as any;

    // Get price amount
    const priceAmount = subscription.items.data[0]?.price.unit_amount || 0;

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { stripe_subscription_id: subscription.id },
      update: {
        status,
        amount_cents: priceAmount,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
      create: {
        client_id: client.id,
        stripe_subscription_id: subscription.id,
        product_type: productType,
        status,
        amount_cents: priceAmount,
        currency: subscription.currency,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    });

    console.log('Subscription created/updated:', {
      subscriptionId: subscription.id,
      clientId: client.id,
      status,
    });
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

/**
 * Handle subscription cancelled event
 * Marks subscription as cancelled
 */
export async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    await prisma.subscription.update({
      where: { stripe_subscription_id: subscription.id },
      data: {
        status: 'CANCELED',
        canceled_at: new Date(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    });

    console.log('Subscription marked as CANCELED:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

/**
 * Handle invoice payment succeeded event
 * Creates payment record for recurring subscription charge
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string | null;

    // Find client by Stripe customer ID
    const client = await prisma.client.findUnique({
      where: { stripe_customer_id: customerId },
    });

    if (!client) {
      console.error('No client found for Stripe customer:', customerId);
      return;
    }

    // Find subscription if this is a subscription invoice
    let dbSubscription = null;
    if (subscriptionId) {
      dbSubscription = await prisma.subscription.findUnique({
        where: { stripe_subscription_id: subscriptionId },
      });
    }

    // Create payment record for the invoice
    await prisma.payment.create({
      data: {
        client_id: client.id,
        subscription_id: dbSubscription?.id || null,
        stripe_charge_id: invoice.charge as string | null,
        amount_cents: invoice.amount_paid,
        currency: invoice.currency,
        payment_type: 'SUBSCRIPTION',
        status: 'SUCCEEDED',
        payment_method: invoice.payment_intent ? 'card' : null,
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.number,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
        },
        paid_at: new Date(),
      },
    });

    console.log('Invoice payment recorded:', {
      invoiceId: invoice.id,
      clientId: client.id,
      amount: invoice.amount_paid,
    });
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

/**
 * Handle invoice payment failed event
 * Logs failure for admin notification
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string | null;

    console.error('Invoice payment failed:', {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amount: invoice.amount_due,
      attemptCount: invoice.attempt_count,
      nextPaymentAttempt: invoice.next_payment_attempt,
    });

    // Update subscription status if applicable
    if (subscriptionId) {
      await prisma.subscription.update({
        where: { stripe_subscription_id: subscriptionId },
        data: { status: 'PAST_DUE' },
      });
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle subscription creation from checkout session
 */
async function handleSubscriptionFromSession(
  session: Stripe.Checkout.Session,
  clientId: string
) {
  try {
    const subscriptionId = session.subscription as string;
    const metadata = session.metadata || {};

    // The subscription will be fully handled by the subscription.created event
    // But we can link it to the payment here
    const payment = await prisma.payment.findFirst({
      where: {
        client_id: clientId,
        stripe_payment_intent_id: session.payment_intent as string,
      },
    });

    if (payment) {
      // Subscription will be created by subscription.created event
      // We'll link the payment to it later when we have the subscription ID
      console.log('Subscription checkout detected:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling subscription from session:', error);
  }
}

/**
 * Determine payment type from metadata
 */
function determinePaymentType(metadata: Record<string, string>): PaymentType {
  if (metadata.payment_type) {
    const type = metadata.payment_type.toUpperCase();
    if (['ONE_TIME', 'SUBSCRIPTION', 'DEPOSIT', 'FINAL_PAYMENT', 'REFUND'].includes(type)) {
      return type as PaymentType;
    }
  }

  // Default based on context
  if (metadata.subscription_id) return 'SUBSCRIPTION';
  if (metadata.deposit) return 'DEPOSIT';
  if (metadata.final_payment) return 'FINAL_PAYMENT';

  return 'ONE_TIME';
}

/**
 * Map Stripe subscription status to Prisma enum
 */
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    'active': 'ACTIVE',
    'past_due': 'PAST_DUE',
    'canceled': 'CANCELED',
    'unpaid': 'UNPAID',
    'incomplete': 'INCOMPLETE',
    'trialing': 'TRIALING',
  };

  return statusMap[stripeStatus] || 'ACTIVE';
}
