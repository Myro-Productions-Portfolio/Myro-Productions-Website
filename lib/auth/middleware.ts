/**
 * Authentication Middleware Utilities
 *
 * Helper functions for protecting routes and verifying admin access
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, verifySessionFromCookies, type AdminUser } from './session';

/**
 * Require authentication for a route (for middleware)
 *
 * @param request - The Next.js request object
 * @returns Promise that resolves to the admin user or a redirect response
 */
export async function requireAuth(request: NextRequest): Promise<AdminUser | NextResponse> {
  const user = await verifySession(request);

  if (!user) {
    // Redirect to login page with return URL
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return user;
}

/**
 * Require authentication for a route handler (for API routes and Server Components)
 *
 * @returns Promise that resolves to the admin user or a NextResponse error
 */
export async function requireAuthFromCookies(): Promise<AdminUser | NextResponse> {
  const user = await verifySessionFromCookies();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Check if user is authenticated (for middleware)
 *
 * @param request - The Next.js request object
 * @returns Promise that resolves to true if authenticated, false otherwise
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await verifySession(request);
  return user !== null;
}

/**
 * Check if user is authenticated (for Server Components)
 *
 * @returns Promise that resolves to true if authenticated, false otherwise
 */
export async function isAuthenticatedFromCookies(): Promise<boolean> {
  const user = await verifySessionFromCookies();
  return user !== null;
}
