/**
 * Admin Session Verification API Route
 *
 * GET /api/admin/auth/verify
 * Verifies the current admin session
 */

import { NextResponse } from 'next/server';
import { verifySessionFromCookies } from '@/lib/auth/session';

/**
 * GET /api/admin/auth/verify
 *
 * Verify the current admin session and return user information
 */
export async function GET() {
  try {
    const user = await verifySessionFromCookies();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during verification',
      },
      { status: 500 }
    );
  }
}
