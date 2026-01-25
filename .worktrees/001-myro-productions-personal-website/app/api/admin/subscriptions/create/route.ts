/**
 * Admin Create Subscription API Route
 *
 * POST /api/admin/subscriptions/create - Manually create subscription via Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/config';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schema
const createSubscriptionSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  price_id: z.string().min(1, 'Stripe Price ID is required'),
  product_type: z.enum(['MAINTENANCE_BASIC', 'MAINTENANCE_PRO', 'SUPPORT_STANDARD', 'SUPPORT_PREMIUM', 'CUSTOM']),
  trial_days: z.number().int().min(0).max(365).optional(),
});

/**
 * POST /api/admin/subscriptions/create
 *
 * Create a new subscription via Stripe API and store in database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    // Parse and validate request body
    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    // Get client
    const client = await prisma.client.findUnique({
      where: { id: validated.client_id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Ensure client has a Stripe customer ID
    let stripeCustomerId = client.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: client.email,
        name: client.name,
        metadata: {
          client_id: client.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update client with Stripe customer ID
      await prisma.client.update({
        where: { id: client.id },
        data: { stripe_customer_id: stripeCustomerId },
      });
    }

    // Create subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: validated.price_id,
        },
      ],
      ...(validated.trial_days && {
        trial_period_days: validated.trial_days,
      }),
      metadata: {
        client_id: client.id,
        product_type: validated.product_type,
        created_by_admin: admin.id,
      },
    });

    // Get the price to determine amount
    const price = stripeSubscription.items.data[0].price;
    const amountCents = price.unit_amount || 0;

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        client_id: client.id,
        stripe_subscription_id: stripeSubscription.id,
        product_type: validated.product_type,
        status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
        amount_cents: amountCents,
        currency: price.currency,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      admin,
      action: 'create_subscription',
      entityType: 'subscription',
      entityId: subscription.id,
      clientId: client.id,
      details: {
        product_type: validated.product_type,
        stripe_subscription_id: stripeSubscription.id,
        amount_cents: amountCents,
        trial_days: validated.trial_days,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json(
      {
        success: true,
        data: { subscription },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create subscription error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if ((error as any).type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
