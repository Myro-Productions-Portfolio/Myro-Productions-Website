/**
 * Admin Projects API Route
 *
 * GET /api/admin/projects - List all projects with filtering
 * POST /api/admin/projects - Create new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schemas
const createProjectSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELED']).default('PLANNING'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget_cents: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  client_id: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELED']).optional(),
  search: z.string().optional(),
});

/**
 * GET /api/admin/projects
 *
 * List all projects with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit, client_id, status, search } = querySchema.parse(searchParams);

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (client_id) {
      where.client_id = client_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.project.count({ where });

    // Get projects with client data
    const projects = await prisma.project.findMany({
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
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List projects error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects
 *
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();
    if (admin instanceof NextResponse) return admin;

    // Parse and validate request body
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: validated.client_id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Validate date range
    if (validated.start_date && validated.end_date) {
      const startDate = new Date(validated.start_date);
      const endDate = new Date(validated.end_date);

      if (endDate < startDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        client_id: validated.client_id,
        name: validated.name,
        description: validated.description,
        status: validated.status,
        start_date: validated.start_date ? new Date(validated.start_date) : null,
        end_date: validated.end_date ? new Date(validated.end_date) : null,
        budget_cents: validated.budget_cents,
        notes: validated.notes,
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
      action: 'create_project',
      entityType: 'project',
      entityId: project.id,
      clientId: project.client_id,
      details: {
        name: project.name,
        status: project.status,
        budget_cents: project.budget_cents,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json(
      {
        success: true,
        data: { project },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
