/**
 * Admin Cancel Subscription API Route
 *
 * POST /api/admin/subscriptions/[id]/cancel - Cancel subscription via Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/config';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schema
const cancelSubscriptionSchema = z.object({
  cancel_at_period_end: z.boolean().default(true),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/subscriptions/[id]/cancel
 *
 * Cancel a subscription via Stripe API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validated = cancelSubscriptionSchema.parse(body);

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
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

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Check if already canceled
    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { success: false, error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    let stripeSubscription;
    if (validated.cancel_at_period_end) {
      // Cancel at period end
      stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
          metadata: {
            canceled_by_admin: admin.id,
            cancel_reason: validated.reason || 'Admin canceled',
          },
        }
      );
    } else {
      // Cancel immediately
      stripeSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id,
        {
          metadata: {
            canceled_by_admin: admin.id,
            cancel_reason: validated.reason || 'Admin canceled',
          },
        }
      );
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: validated.cancel_at_period_end ? subscription.status : 'CANCELED',
        cancel_at_period_end: validated.cancel_at_period_end,
        canceled_at: validated.cancel_at_period_end ? null : new Date(),
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
      action: 'cancel_subscription',
      entityType: 'subscription',
      entityId: subscription.id,
      clientId: subscription.client_id,
      details: {
        cancel_at_period_end: validated.cancel_at_period_end,
        reason: validated.reason,
        product_type: subscription.product_type,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: { subscription: updatedSubscription },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);

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
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
