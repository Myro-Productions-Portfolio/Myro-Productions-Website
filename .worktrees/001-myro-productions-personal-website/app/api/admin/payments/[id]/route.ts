/**
 * Admin Payment Detail API Route
 *
 * GET /api/admin/payments/[id] - Get payment details
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/payments/[id]
 *
 * Get payment details with client, project, and subscription info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    // Get payment with related data
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            budget_cents: true,
          },
        },
        subscription: {
          select: {
            id: true,
            product_type: true,
            status: true,
            amount_cents: true,
            current_period_start: true,
            current_period_end: true,
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

    return NextResponse.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}
