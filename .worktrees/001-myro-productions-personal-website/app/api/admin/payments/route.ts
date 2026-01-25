/**
 * Admin Payments API Route
 *
 * GET /api/admin/payments - List all payments with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  client_id: z.string().optional(),
  project_id: z.string().optional(),
  subscription_id: z.string().optional(),
  payment_type: z.enum(['ONE_TIME', 'SUBSCRIPTION', 'DEPOSIT', 'FINAL_PAYMENT', 'REFUND']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

/**
 * GET /api/admin/payments
 *
 * List all payments with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const {
      page,
      limit,
      client_id,
      project_id,
      subscription_id,
      payment_type,
      status,
      start_date,
      end_date,
    } = querySchema.parse(searchParams);

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (client_id) {
      where.client_id = client_id;
    }

    if (project_id) {
      where.project_id = project_id;
    }

    if (subscription_id) {
      where.subscription_id = subscription_id;
    }

    if (payment_type) {
      where.payment_type = payment_type;
    }

    if (status) {
      where.status = status;
    }

    // Date range filter
    if (start_date || end_date) {
      where.paid_at = {};

      if (start_date) {
        where.paid_at.gte = new Date(start_date);
      }

      if (end_date) {
        where.paid_at.lte = new Date(end_date);
      }
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Get payments with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        subscription: {
          select: {
            id: true,
            product_type: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Calculate totals
    const totals = await prisma.payment.aggregate({
      where,
      _sum: {
        amount_cents: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        totals: {
          total_amount_cents: totals._sum.amount_cents || 0,
        },
      },
    });
  } catch (error) {
    console.error('List payments error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
