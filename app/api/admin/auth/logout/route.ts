/**
 * Admin Logout API Route
 *
 * POST /api/admin/auth/logout
 * Destroys the admin session
 */

import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

/**
 * POST /api/admin/auth/logout
 *
 * Destroy the admin session and clear the session cookie
 */
export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
