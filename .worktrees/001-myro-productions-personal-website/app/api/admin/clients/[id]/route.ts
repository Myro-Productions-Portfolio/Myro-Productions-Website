/**
 * Admin Client Detail API Route
 *
 * GET /api/admin/clients/[id] - Get single client with all related data
 * PUT /api/admin/clients/[id] - Update client
 * DELETE /api/admin/clients/[id] - Deactivate client (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromCookies } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { logActivity, getIpAddress } from '@/lib/admin/activity-logger';
import { z } from 'zod';

// Validation schema
const updateClientSchema = z.object({
  email: z.string().email('Valid email is required').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

/**
 * GET /api/admin/clients/[id]
 *
 * Get single client with subscriptions, projects, and payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    await requireAuthFromCookies();

    const { id } = await params;

    // Get client with all related data
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { created_at: 'desc' },
        },
        projects: {
          orderBy: { created_at: 'desc' },
        },
        payments: {
          orderBy: { created_at: 'desc' },
          take: 50, // Limit to most recent payments
        },
        activity_logs: {
          orderBy: { created_at: 'desc' },
          take: 20, // Limit to most recent activity
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { client },
    });
  } catch (error) {
    console.error('Get client error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/clients/[id]
 *
 * Update client information
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
    const validated = updateClientSchema.parse(body);

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // If updating email, check for duplicates
    if (validated.email && validated.email !== existingClient.email) {
      const emailTaken = await prisma.client.findUnique({
        where: { email: validated.email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another client' },
          { status: 400 }
        );
      }
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: validated,
      include: {
        subscriptions: true,
        projects: true,
      },
    });

    // Log activity
    await logActivity({
      admin,
      action: 'update_client',
      entityType: 'client',
      entityId: client.id,
      clientId: client.id,
      details: {
        changes: validated,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: { client },
    });
  } catch (error) {
    console.error('Update client error:', error);

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
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/clients/[id]
 *
 * Deactivate client (soft delete by setting status to ARCHIVED)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const admin = await requireAuthFromCookies();

    const { id } = await params;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to ARCHIVED
    const client = await prisma.client.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // Log activity
    await logActivity({
      admin,
      action: 'deactivate_client',
      entityType: 'client',
      entityId: client.id,
      clientId: client.id,
      details: {
        previous_status: existingClient.status,
      },
      ipAddress: getIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      data: { client },
    });
  } catch (error) {
    console.error('Delete client error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to deactivate client' },
      { status: 500 }
    );
  }
}
