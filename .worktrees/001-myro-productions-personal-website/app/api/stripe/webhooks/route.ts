import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', {
    sessionId: session.id,
    customerEmail: session.customer_email,
    metadata: session.metadata,
  });

  // TODO: Store payment record in database
  // TODO: Send confirmation email to customer
  // TODO: Notify admin of new payment
  // TODO: If quote payment, update quote status
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });

  // TODO: Update payment status in database
  // TODO: Send receipt to customer
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error,
  });

  // TODO: Notify customer of payment failure
  // TODO: Notify admin
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer,
  });

  // TODO: Update subscription status in database
  // TODO: Send confirmation email if new subscription
  // TODO: Handle subscription upgrades/downgrades
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('Subscription cancelled:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });

  // TODO: Update subscription status in database
  // TODO: Send cancellation confirmation to customer
  // TODO: Notify admin
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid,
  });

  // TODO: Send receipt to customer
  // TODO: Update payment records
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error('Invoice payment failed:', {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
  });

  // TODO: Notify customer to update payment method
  // TODO: Notify admin
}
