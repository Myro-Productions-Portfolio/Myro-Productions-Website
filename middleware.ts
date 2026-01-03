import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security headers for all responses
 * These headers help protect against common web vulnerabilities
 */
const securityHeaders = {
  // Prevent clickjacking attacks by controlling iframe embedding
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filtering in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information sent with requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restrict browser features and APIs
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Content Security Policy - adjust as needed for your specific requirements
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Rate limiting placeholder for future edge implementation
 * This can be extended with edge-compatible rate limiting solutions
 * such as Vercel Edge Config, Upstash Redis, or similar services
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkRateLimit(_request: NextRequest): Promise<boolean> {
  // Future implementation:
  // - Use Vercel Edge Config for IP-based rate limiting
  // - Use Upstash Redis for distributed rate limiting
  // - Implement sliding window or token bucket algorithms
  return true; // Allow all requests for now
}

export async function middleware(request: NextRequest) {
  // Future: Check rate limit before processing
  // const isAllowed = await checkRateLimit(request);
  // if (!isAllowed) {
  //   return new NextResponse('Too Many Requests', { status: 429 });
  // }

  // Get the response
  const response = NextResponse.next();

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HSTS header for HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Middleware configuration
 * Apply to all routes except static files, images, and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes that handle their own headers (optional - remove if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
