/**
 * CSRF Protection Utilities
 *
 * Implements the double-submit cookie pattern for CSRF protection:
 * 1. Generate a cryptographically random token on the client
 * 2. Store it in a cookie with SameSite=Strict
 * 3. Send the same token in the request header
 * 4. Server validates that cookie token matches header token
 *
 * This works because:
 * - Attackers cannot read cookies from another domain (same-origin policy)
 * - Attackers cannot set custom headers in cross-origin requests
 * - SameSite=Strict prevents the cookie from being sent with cross-origin requests
 */

// Cookie name for CSRF token
export const CSRF_COOKIE_NAME = 'csrf_token';

// Header name for CSRF token
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Token validity duration (1 hour in milliseconds)
export const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Generate a cryptographically secure random token
 * Uses the Web Crypto API for secure random generation
 */
export function generateCsrfToken(): string {
  // Generate 32 random bytes and convert to hex string
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the CSRF token from cookies (client-side)
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Set the CSRF token cookie (client-side)
 * Uses SameSite=Strict for additional security
 */
export function setCsrfTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;

  // Calculate expiry time
  const expires = new Date(Date.now() + CSRF_TOKEN_EXPIRY).toUTCString();

  // Set cookie with security attributes
  // Note: HttpOnly is NOT set because we need to read the cookie value in JavaScript
  // SameSite=Strict prevents the cookie from being sent with cross-site requests
  // Secure flag is set in production (HTTPS only)
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';

  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Strict; Expires=${expires}${secureFlag}`;
}

/**
 * Get or create a CSRF token (client-side)
 * Returns existing token from cookie or generates a new one
 */
export function getOrCreateCsrfToken(): string {
  let token = getCsrfTokenFromCookie();

  if (!token) {
    token = generateCsrfToken();
    setCsrfTokenCookie(token);
  }

  return token;
}

/**
 * Regenerate the CSRF token (client-side)
 * Creates a new token and updates the cookie
 * Use after form submission to prevent token reuse
 */
export function regenerateCsrfToken(): string {
  const token = generateCsrfToken();
  setCsrfTokenCookie(token);
  return token;
}

/**
 * Validate CSRF token length and format
 * Returns true if the token appears to be valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Token should be exactly 64 hex characters (32 bytes)
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token);
}
