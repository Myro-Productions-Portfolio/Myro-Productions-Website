/**
 * Admin Clients API Route
 *
 * GET /api/admin/clients - List all clients with pagination and search
 * POST /api/admin/clients - Create new client
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schemas
const createClientSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

/**
 * GET /api/admin/clients
 *
 * List all clients with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit, search, status } = querySchema.parse(searchParams);

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.client.count({ where });

    // Get clients with related data
    const clients = await prisma.client.findMany({
      where,
      include: {
        subscriptions: {
          select: {
            id: true,
            product_type: true,
            status: true,
            amount_cents: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
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
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List clients error:', error);

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

    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/clients
 *
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    // Parse and validate request body
    const body = await request.json();
    const validated = createClientSchema.parse(body);

    // Check if client with email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validated.email },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        email: validated.email,
        name: validated.name,
        company: validated.company,
        phone: validated.phone,
        notes: validated.notes,
        status: validated.status,
      },
      include: {
        subscriptions: true,
        projects: true,
      },
    });

    // Log activity
    await logActivity({
      admin,
      action: 'create_client',
      entityType: 'client',
      entityId: client.id,
      clientId: client.id,
      details: {
        email: client.email,
        name: client.name,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json(
      {
        success: true,
        data: { client },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create client error:', error);

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

    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
