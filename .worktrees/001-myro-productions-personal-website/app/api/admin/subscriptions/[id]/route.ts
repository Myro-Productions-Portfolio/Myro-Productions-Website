/**
 * Admin Subscription Detail API Route
 *
 * GET /api/admin/subscriptions/[id] - Get subscription details
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/subscriptions/[id]
 *
 * Get subscription details with client and payment history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    await requireAuthFromCookies();

    const { id } = await params;

    // Get subscription with related data
    const subscription = await prisma.subscription.findUnique({
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
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    console.error('Get subscription error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
