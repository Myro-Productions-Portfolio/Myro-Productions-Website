import { NextRequest, NextResponse } from 'next/server';
import validator from 'validator';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, isValidTokenFormat } from '@/lib/csrf';

/**
 * Contact Form API Route
 *
 * Uses Web3Forms for email delivery - a free, serverless email service
 * Get your access key at: https://web3forms.com
 *
 * Features:
 * - CSRF protection (double-submit cookie pattern)
 * - Honeypot spam protection
 * - Rate limiting (5 requests per IP per minute)
 * - Email validation
 * - Input sanitization (XSS/injection protection)
 * - Sends to nmyers@myroproductions.com
 * - CORS protection with allowed origins whitelist
 */

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize user input by escaping HTML entities to prevent XSS attacks
 * Also removes null bytes and trims whitespace
 */
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes (injection prevention)
    .replace(/\0/g, '')
    // Escape HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize email specifically - more restrictive than general input
 * Only allows valid email characters
 */
function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  // Remove any characters that shouldn't be in an email
  // Keep only alphanumeric, @, ., _, -, +
  return email
    .replace(/\0/g, '')
    .replace(/[^\w.@+-]/g, '')
    .trim()
    .toLowerCase();
}

// ============================================================================
// Rate Limiting Implementation
// ============================================================================

interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per window
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

// Track last cleanup time to prevent memory leaks
let lastCleanup = Date.now();

/**
 * Periodically clean up expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only run cleanup periodically
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Extract the client IP address from the request
 */
function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Check if a request is within rate limits
 * Returns whether the request is allowed and how long to wait if not
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  // Run cleanup opportunistically
  cleanupExpiredEntries();

  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, firstRequestTime: now });
    return { allowed: true, retryAfter: 0 };
  }

  const timeSinceFirstRequest = now - entry.firstRequestTime;

  if (timeSinceFirstRequest > RATE_LIMIT_WINDOW_MS) {
    // Window has expired, reset the counter
    rateLimitStore.set(ip, { count: 1, firstRequestTime: now });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - timeSinceFirstRequest) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

// ============================================================================
// CORS Configuration
// ============================================================================

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'https://myroproductions.com',
  'https://www.myroproductions.com',
  'http://localhost:3000',
].filter(Boolean) as string[];

/**
 * Get CORS headers if the origin is allowed
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': `Content-Type, ${CSRF_HEADER_NAME}`,
    'Access-Control-Allow-Credentials': 'true',
  };

  // Only set Access-Control-Allow-Origin if the origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// ============================================================================
// CSRF Validation
// ============================================================================

/**
 * Extract CSRF token from cookie header
 */
function getCsrfTokenFromCookies(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Validate CSRF token using double-submit cookie pattern
 * Compares the token in the cookie with the token in the header
 */
function validateCsrfToken(request: NextRequest): { valid: boolean; error?: string } {
  const cookieToken = getCsrfTokenFromCookies(request);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Both tokens must be present
  if (!cookieToken) {
    return { valid: false, error: 'CSRF cookie missing' };
  }

  if (!headerToken) {
    return { valid: false, error: 'CSRF header missing' };
  }

  // Validate token format
  if (!isValidTokenFormat(cookieToken)) {
    return { valid: false, error: 'Invalid CSRF cookie format' };
  }

  if (!isValidTokenFormat(headerToken)) {
    return { valid: false, error: 'Invalid CSRF header format' };
  }

  // Use timing-safe comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return { valid: false, error: 'CSRF token mismatch' };
  }

  // Constant-time string comparison
  let mismatch = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { valid: false, error: 'CSRF token mismatch' };
  }

  return { valid: true };
}

interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  message: string;
  botcheck?: string; // Honeypot field
}

// Web3Forms access key - Get yours at https://web3forms.com
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'nmyers@myroproductions.com';

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  // Rate limiting check - must be done before processing the request
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait before submitting again.',
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(rateLimitResult.retryAfter),
        },
      }
    );
  }

  // CSRF validation - verify double-submit cookie pattern
  const csrfResult = validateCsrfToken(request);
  if (!csrfResult.valid) {
    console.error('CSRF validation failed', {
      timestamp: new Date().toISOString(),
      error: csrfResult.error,
      ip: clientIP,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Security validation failed. Please refresh the page and try again.',
      },
      { status: 403, headers: corsHeaders }
    );
  }

  try {
    const formData: ContactFormData = await request.json();

    // Validate required fields (before sanitization to check for presence)
    if (!formData.name || !formData.email || !formData.projectType || !formData.message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Honeypot check - if botcheck field is filled, it's a bot
    if (formData.botcheck) {
      return NextResponse.json(
        { success: false, error: 'Spam detected' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize all user inputs to prevent XSS and injection attacks
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeEmail(formData.email),
      projectType: sanitizeInput(formData.projectType),
      message: sanitizeInput(formData.message),
    };

    // Validate sanitized data is not empty (in case sanitization removed everything)
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.projectType || !sanitizedData.message) {
      return NextResponse.json(
        { success: false, error: 'Invalid input detected' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Email validation using validator library (more robust than regex)
    if (!validator.isEmail(sanitizedData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Message length validation (on sanitized message)
    if (sanitizedData.message.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare Web3Forms payload with sanitized data
    const web3formsPayload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New Contact Form Submission - ${sanitizedData.projectType}`,
      from_name: sanitizedData.name,
      from_email: sanitizedData.email,
      to_email: CONTACT_EMAIL,
      message: `
Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Project Type: ${sanitizedData.projectType}

Message:
${sanitizedData.message}
      `.trim(),
      // Optional: Add these for better tracking
      replyto: sanitizedData.email,
      botcheck: '', // Always empty since we already rejected bots
    };

    // Send email via Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(web3formsPayload),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Your message has been sent successfully!',
        },
        { status: 200, headers: corsHeaders }
      );
    } else {
      // Web3Forms returned an error - log without PII
      console.error('Web3Forms error', {
        timestamp: new Date().toISOString(),
        errorMessage: result.message || 'Unknown error',
        // Don't log: email, name, message content
      });
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to send email',
        },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Contact form submission error', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      // Don't log: email, name, message content
    });
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
