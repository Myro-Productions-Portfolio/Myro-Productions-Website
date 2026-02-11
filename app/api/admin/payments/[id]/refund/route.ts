/**
 * Admin Refund Payment API Route
 *
 * POST /api/admin/payments/[id]/refund - Refund payment via Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/config';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schema
const refundPaymentSchema = z.object({
  amount_cents: z.number().int().min(1).optional(), // Partial refund amount (optional)
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
  notes: z.string().optional(),
});

/**
 * POST /api/admin/payments/[id]/refund
 *
 * Refund a payment via Stripe API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validated = refundPaymentSchema.parse(body);

    // Get payment
    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment can be refunded
    if (payment.status !== 'SUCCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Only successful payments can be refunded' },
        { status: 400 }
      );
    }

    if (!payment.stripe_payment_intent_id) {
      return NextResponse.json(
        { success: false, error: 'Payment does not have a Stripe payment intent ID' },
        { status: 400 }
      );
    }

    // Validate refund amount
    const refundAmount = validated.amount_cents || payment.amount_cents;

    if (refundAmount > payment.amount_cents) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: refundAmount,
      reason: validated.reason,
      metadata: {
        payment_id: payment.id,
        client_id: payment.client_id,
        refunded_by_admin: admin.id,
        admin_notes: validated.notes || '',
      },
    });

    // Update payment status
    const isFullRefund = refundAmount === payment.amount_cents;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: isFullRefund ? 'REFUNDED' : payment.status,
        metadata: {
          ...(payment.metadata as object || {}),
          refund: {
            refund_id: refund.id,
            amount_cents: refundAmount,
            reason: validated.reason,
            notes: validated.notes,
            refunded_at: new Date().toISOString(),
            refunded_by: admin.id,
          },
        },
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

    // Create refund payment record if partial refund
    if (!isFullRefund) {
      await prisma.payment.create({
        data: {
          client_id: payment.client_id,
          project_id: payment.project_id,
          subscription_id: payment.subscription_id,
          stripe_payment_intent_id: refund.id,
          amount_cents: -refundAmount, // Negative amount for refund
          currency: payment.currency,
          payment_type: 'REFUND',
          status: 'SUCCEEDED',
          payment_method: payment.payment_method,
          metadata: {
            original_payment_id: payment.id,
            refund_id: refund.id,
            reason: validated.reason,
            notes: validated.notes,
          },
          paid_at: new Date(),
        },
      });
    }

    // Log activity
    await logActivity({
      admin,
      action: 'refund_payment',
      entityType: 'payment',
      entityId: payment.id,
      clientId: payment.client_id,
      details: {
        amount_cents: refundAmount,
        original_amount_cents: payment.amount_cents,
        is_full_refund: isFullRefund,
        reason: validated.reason,
        notes: validated.notes,
        stripe_refund_id: refund.id,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: {
        payment: updatedPayment,
        refund: {
          id: refund.id,
          amount_cents: refundAmount,
          is_full_refund: isFullRefund,
          status: refund.status,
        },
      },
    });
  } catch (error) {
    console.error('Refund payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
