/**
 * Admin Login API Route
 *
 * POST /api/admin/auth/login
 * Authenticates admin users and creates a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * Login request validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/admin/auth/login
 *
 * Authenticate an admin user and create a session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find admin user by email
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      // Use generic error message to prevent email enumeration
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { last_login: new Date() },
    });

    // Create session
    await createSession(admin.id, admin.email, admin.name);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}
