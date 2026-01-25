/**
 * Admin Subscriptions API Route
 *
 * GET /api/admin/subscriptions - List all subscriptions with filtering
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
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'TRIALING']).optional(),
  product_type: z.enum(['MAINTENANCE_BASIC', 'MAINTENANCE_PRO', 'SUPPORT_STANDARD', 'SUPPORT_PREMIUM', 'CUSTOM']).optional(),
});

/**
 * GET /api/admin/subscriptions
 *
 * List all subscriptions with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit, client_id, status, product_type } = querySchema.parse(searchParams);

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (client_id) {
      where.client_id = client_id;
    }

    if (status) {
      where.status = status;
    }

    if (product_type) {
      where.product_type = product_type;
    }

    // Get total count
    const total = await prisma.subscription.count({ where });

    // Get subscriptions with client data
    const subscriptions = await prisma.subscription.findMany({
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
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List subscriptions error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
