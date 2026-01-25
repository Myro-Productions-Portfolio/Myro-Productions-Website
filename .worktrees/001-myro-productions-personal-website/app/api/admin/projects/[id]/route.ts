/**
 * Admin Project Detail API Route
 *
 * GET /api/admin/projects/[id] - Get project details
 * PUT /api/admin/projects/[id] - Update project
 * DELETE /api/admin/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schema
const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELED']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget_cents: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/projects/[id]
 *
 * Get project details with client and payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    await requireAuthFromCookies();

    const { id } = await params;

    // Get project with related data
    const project = await prisma.project.findUnique({
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

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error('Get project error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/projects/[id]
 *
 * Update project information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate date range if both dates are provided
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

    // Prepare update data
    const updateData: any = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.start_date !== undefined) updateData.start_date = new Date(validated.start_date);
    if (validated.end_date !== undefined) updateData.end_date = new Date(validated.end_date);
    if (validated.budget_cents !== undefined) updateData.budget_cents = validated.budget_cents;
    if (validated.notes !== undefined) updateData.notes = validated.notes;

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
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
      action: 'update_project',
      entityType: 'project',
      entityId: project.id,
      clientId: project.client_id,
      details: {
        changes: validated,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error('Update project error:', error);

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
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 *
 * Delete project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    const { id } = await params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project has payments
    if (existingProject._count.payments > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete project with associated payments. Set status to CANCELED instead.'
        },
        { status: 400 }
      );
    }

    // Delete project
    await prisma.project.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      admin,
      action: 'delete_project',
      entityType: 'project',
      entityId: id,
      clientId: existingProject.client_id,
      details: {
        name: existingProject.name,
        status: existingProject.status,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Project deleted successfully' },
    });
  } catch (error) {
    console.error('Delete project error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
