/**
 * Session Management Utilities
 *
 * Uses jose for JWT token creation and verification
 * Implements secure session cookies with HTTP-only, Secure, and SameSite flags
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * Admin user interface for session data
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

/**
 * JWT payload interface
 */
interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Session cookie name
 */
const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Session duration (24 hours in seconds)
 */
const SESSION_DURATION = 24 * 60 * 60; // 24 hours

/**
 * Get JWT secret from environment variable
 * Generate with: openssl rand -base64 32
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // Convert the secret string to Uint8Array for jose
  return new TextEncoder().encode(secret);
}

/**
 * Create a session token for an admin user
 *
 * @param userId - The admin user's ID
 * @param email - The admin user's email
 * @param name - The admin user's name
 * @returns Promise that resolves to the signed JWT token
 */
export async function createSession(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({
    userId,
    email,
    name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return token;
}

/**
 * Verify a session token from the request
 *
 * @param request - The Next.js request object
 * @returns Promise that resolves to the admin user if valid, null otherwise
 */
export async function verifySession(request: NextRequest): Promise<AdminUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify<SessionPayload>(token, secret);

    const { userId, email, name } = verified.payload;

    return {
      id: userId,
      email,
      name,
    };
  } catch (error) {
    // Token is invalid or expired
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Verify session from cookies() (for Server Components and Route Handlers)
 *
 * @returns Promise that resolves to the admin user if valid, null otherwise
 */
export async function verifySessionFromCookies(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify<SessionPayload>(token, secret);

    const { userId, email, name } = verified.payload;

    return {
      id: userId,
      email,
      name,
    };
  } catch (error) {
    // Token is invalid or expired
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Destroy the session by clearing the session cookie
 *
 * @returns Response object with the cleared cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the session cookie name (for middleware)
 */
export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}
