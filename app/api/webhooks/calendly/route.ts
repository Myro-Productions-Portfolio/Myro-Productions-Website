import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';

/**
 * Calendly Webhook API Route
 *
 * Handles Calendly webhook events for booking notifications.
 * - Verifies webhook signature using HMAC-SHA256
 * - Deduplicates events to prevent double-processing on retries
 * - Validates payload using Zod schemas
 * - Stores contact in AI Command Center
 * - Sends email notification via Web3Forms
 *
 * Event Deduplication:
 * - Uses invitee email + event start time as a composite key
 * - Stores processed event IDs in memory for 24 hours
 * - Returns 200 OK for duplicates (so Calendly doesn't retry)
 * - Auto-cleans old entries every hour to prevent memory growth
 *
 * Required environment variables:
 * - CALENDLY_WEBHOOK_SIGNING_KEY: Webhook signing key from Calendly
 * - WEB3FORMS_ACCESS_KEY: Web3Forms access key for email delivery
 */

// Environment variables
const CALENDLY_WEBHOOK_SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '';
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || '';
const AI_COMMAND_CENTER_URL = process.env.AI_COMMAND_CENTER_URL || 'http://localhost:3939/api/contacts';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@myroproductions.com';

// Event deduplication store
// Tracks processed webhook event IDs to prevent duplicate processing
// Format: Map<eventId, timestamp>
const processedEvents = new Map<string, number>();
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEDUP_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Clean up old entries from the deduplication store
 */
function cleanupProcessedEvents(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (now - timestamp > DEDUP_TTL_MS) {
      processedEvents.delete(eventId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log('Cleaned up processed events from deduplication store', {
      timestamp: new Date().toISOString(),
      cleanedCount,
      remainingCount: processedEvents.size,
    });
  }
}

// Schedule periodic cleanup (runs every hour)
// Note: In serverless environments, this may not persist between cold starts,
// but that's acceptable since we're just preventing duplicate processing within a reasonable window
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanupScheduled(): void {
  if (cleanupInterval === null) {
    cleanupInterval = setInterval(cleanupProcessedEvents, DEDUP_CLEANUP_INTERVAL_MS);
    // Don't keep the process alive just for cleanup
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
}

/**
 * Generate a unique event ID from the webhook payload
 * Uses invitee email + event start time as a composite key
 * This ensures the same booking event is deduplicated even if Calendly retries
 */
function generateEventId(inviteeEmail: string, eventStartTime: string): string {
  // Create a deterministic ID from email and start time
  // Using createHmac for consistent hashing without exposing PII
  return createHmac('sha256', 'calendly-event-dedup')
    .update(`${inviteeEmail.toLowerCase()}:${eventStartTime}`)
    .digest('hex')
    .substring(0, 32); // Use first 32 chars for reasonable key length
}

/**
 * Check if an event has already been processed
 * Returns true if duplicate (should skip processing), false if new event
 */
function isDuplicateEvent(eventId: string): boolean {
  ensureCleanupScheduled();
  return processedEvents.has(eventId);
}

/**
 * Mark an event as processed
 */
function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

// Zod schemas for Calendly webhook payload validation
const CalendlyEventTypeSchema = z.object({
  name: z.string().min(1, 'Event type name is required'),
  duration: z.number().positive().optional(),
});

const CalendlyLocationSchema = z.object({
  type: z.string(),
  location: z.string().optional(),
});

const CalendlyEventSchema = z.object({
  start_time: z.string().datetime({ message: 'Invalid start_time format' }),
  end_time: z.string().datetime({ message: 'Invalid end_time format' }),
  location: CalendlyLocationSchema.optional(),
});

const CalendlyQuestionAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const CalendlyInviteeSchema = z.object({
  name: z.string().min(1, 'Invitee name is required'),
  email: z.string().email('Invalid invitee email format'),
  text_reminder_number: z.string().optional(),
  questions_and_answers: z.array(CalendlyQuestionAnswerSchema).optional(),
});

const CalendlyPayloadSchema = z.object({
  event_type: CalendlyEventTypeSchema,
  event: CalendlyEventSchema,
  invitee: CalendlyInviteeSchema,
});

const CalendlyWebhookBodySchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  payload: CalendlyPayloadSchema,
});

// TypeScript types inferred from Zod schemas
type CalendlyEventType = z.infer<typeof CalendlyEventTypeSchema>;
type CalendlyEvent = z.infer<typeof CalendlyEventSchema>;
type CalendlyQuestionAnswer = z.infer<typeof CalendlyQuestionAnswerSchema>;
type CalendlyInvitee = z.infer<typeof CalendlyInviteeSchema>;
type CalendlyWebhookBody = z.infer<typeof CalendlyWebhookBodySchema>;

/**
 * Verify Calendly webhook signature
 *
 * Calendly sends the signature in the `Calendly-Webhook-Signature` header
 * Format: t=timestamp,v1=signature
 *
 * Verification: HMAC-SHA256 of "timestamp.payload" using signing key
 */
function verifyWebhookSignature(
  signature: string | null,
  payload: string,
  signingKey: string
): boolean {
  if (!signature || !signingKey) {
    return false;
  }

  try {
    // Parse the signature header: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const signaturePart = parts.find((p) => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      console.error('Invalid signature format');
      return false;
    }

    const timestamp = timestampPart.slice(2); // Remove "t="
    const receivedSignature = signaturePart.slice(3); // Remove "v1="

    // Check timestamp to prevent replay attacks (5 minute tolerance)
    const timestampMs = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    const tolerance = 5 * 60 * 1000; // 5 minutes

    if (Math.abs(now - timestampMs) > tolerance) {
      console.error('Webhook timestamp too old');
      return false;
    }

    // Compute expected signature: HMAC-SHA256 of "timestamp.payload"
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac('sha256', signingKey)
      .update(signedPayload)
      .digest('hex');

    // Use timing-safe comparison
    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    console.error('Signature verification error', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.name : 'Unknown',
      // Don't log: payload content, signature values
    });
    return false;
  }
}

/**
 * Extract phone number and company from questions and answers
 */
function extractContactInfo(questionsAndAnswers?: CalendlyQuestionAnswer[]): {
  phone?: string;
  company?: string;
  formattedAnswers: string;
} {
  let phone: string | undefined;
  let company: string | undefined;
  const answers: string[] = [];

  if (questionsAndAnswers && questionsAndAnswers.length > 0) {
    for (const qa of questionsAndAnswers) {
      const questionLower = qa.question.toLowerCase();
      const answer = qa.answer?.trim();

      if (!answer) continue;

      // Try to identify phone number
      if (
        questionLower.includes('phone') ||
        questionLower.includes('number') ||
        questionLower.includes('mobile') ||
        questionLower.includes('cell')
      ) {
        phone = answer;
      }

      // Try to identify company
      if (
        questionLower.includes('company') ||
        questionLower.includes('organization') ||
        questionLower.includes('business')
      ) {
        company = answer;
      }

      // Add to formatted answers
      answers.push(`${qa.question}: ${answer}`);
    }
  }

  return {
    phone,
    company,
    formattedAnswers: answers.join('\n'),
  };
}

/**
 * Format date/time for display
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return isoString;
  }
}

/**
 * Store contact in AI Command Center
 */
async function storeContactInACC(
  name: string,
  email: string,
  phone: string | undefined,
  company: string | undefined,
  eventType: string,
  startTime: string,
  formattedAnswers: string
): Promise<boolean> {
  try {
    const notes = [
      `Calendly booking: ${eventType} - ${formatDateTime(startTime)}`,
      formattedAnswers ? `\nAnswers:\n${formattedAnswers}` : '',
    ]
      .filter(Boolean)
      .join('');

    const contactData: Record<string, string | undefined> = {
      name,
      email,
      notes,
    };

    if (phone) contactData.phone = phone;
    if (company) contactData.company = company;

    const response = await fetch(AI_COMMAND_CENTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      console.error('Failed to store contact in ACC', {
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        // Don't log: response body may contain PII
      });
      return false;
    }

    console.log('Contact stored in AI Command Center', {
      timestamp: new Date().toISOString(),
      // Don't log: name, email, phone, company
    });
    return true;
  } catch (error) {
    // Don't fail the webhook if ACC is unavailable
    console.error('Error storing contact in ACC', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      // Don't log: name, email, phone, company
    });
    return false;
  }
}

/**
 * Send email notification via Web3Forms
 */
async function sendEmailNotification(
  invitee: CalendlyInvitee,
  eventType: CalendlyEventType,
  event: CalendlyEvent,
  formattedAnswers: string
): Promise<boolean> {
  if (!WEB3FORMS_ACCESS_KEY) {
    console.error('WEB3FORMS_ACCESS_KEY not configured');
    return false;
  }

  try {
    const startTime = formatDateTime(event.start_time);
    const endTime = formatDateTime(event.end_time);
    const location = event.location?.location || event.location?.type || 'Not specified';

    const emailContent = `
New Calendly Booking Received!

Event: ${eventType.name}
Duration: ${eventType.duration ? `${eventType.duration} minutes` : 'Not specified'}

Scheduled Time:
  Start: ${startTime}
  End: ${endTime}

Location: ${location}

Contact Information:
  Name: ${invitee.name}
  Email: ${invitee.email}
  Phone: ${invitee.text_reminder_number || 'Not provided'}

${formattedAnswers ? `Questions & Answers:\n${formattedAnswers}` : ''}
    `.trim();

    const web3formsPayload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New Calendly Booking - ${eventType.name}`,
      from_name: 'Calendly Notifications',
      to_email: CONTACT_EMAIL,
      message: emailContent,
      replyto: invitee.email,
    };

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
      console.log('Email notification sent successfully', {
        timestamp: new Date().toISOString(),
        // Don't log: invitee email, name, phone
      });
      return true;
    } else {
      console.error('Web3Forms error', {
        timestamp: new Date().toISOString(),
        errorMessage: result.message || 'Unknown error',
        // Don't log: invitee email, name, phone
      });
      return false;
    }
  } catch (error) {
    console.error('Error sending email notification', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      // Don't log: invitee email, name, phone
    });
    return false;
  }
}

/**
 * Handle POST requests from Calendly webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('Calendly-Webhook-Signature');

    // Verify webhook signature
    if (CALENDLY_WEBHOOK_SIGNING_KEY) {
      const isValid = verifyWebhookSignature(signature, rawBody, CALENDLY_WEBHOOK_SIGNING_KEY);

      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      // SECURITY: Signature verification is REQUIRED in production
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        console.error('CRITICAL: CALENDLY_WEBHOOK_SIGNING_KEY not configured in production');
        return NextResponse.json(
          {
            success: false,
            error: 'Webhook not configured',
            message: 'Server misconfiguration: webhook signing key is required but not set. Please contact the administrator.',
          },
          { status: 503 }
        );
      } else {
        console.warn(
          'WARNING: CALENDLY_WEBHOOK_SIGNING_KEY not set - skipping signature verification. ' +
          'This is only allowed in development. Set the environment variable before deploying to production.'
        );
      }
    }

    // Parse and validate webhook body
    let webhookBody: CalendlyWebhookBody;
    try {
      const parsedBody = JSON.parse(rawBody);
      const validationResult = CalendlyWebhookBodySchema.safeParse(parsedBody);

      if (!validationResult.success) {
        // Extract only field paths and message types, not actual values
        const errorPaths = validationResult.error.issues
          .map((issue: z.ZodIssue) => issue.path.join('.'))
          .join(', ');
        console.error('Webhook payload validation failed', {
          timestamp: new Date().toISOString(),
          invalidFields: errorPaths,
          errorCount: validationResult.error.issues.length,
          // Don't log: actual field values or detailed error messages that may contain PII
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid payload structure',
          },
          { status: 400 }
        );
      }

      webhookBody = validationResult.data;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Only process invitee.created events
    if (webhookBody.event !== 'invitee.created') {
      console.log(`Ignoring event type: ${webhookBody.event}`);
      return NextResponse.json({ success: true, message: 'Event ignored' }, { status: 200 });
    }

    const { payload } = webhookBody;
    const { invitee, event_type, event } = payload;

    // Check for duplicate events
    const eventId = generateEventId(invitee.email, event.start_time);

    if (isDuplicateEvent(eventId)) {
      console.log('Duplicate webhook event detected, skipping processing', {
        timestamp: new Date().toISOString(),
        eventId,
        // Don't log: invitee email, event details
      });
      // Return 200 OK so Calendly doesn't retry
      return NextResponse.json(
        {
          success: true,
          message: 'Duplicate event, already processed',
        },
        { status: 200 }
      );
    }

    // Mark event as processed before doing any work
    // This ensures that even if processing fails partway through,
    // we won't reprocess on retry (preventing duplicate emails/contacts)
    markEventProcessed(eventId);

    // Extract contact info from questions
    const { phone, company, formattedAnswers } = extractContactInfo(
      invitee.questions_and_answers
    );

    // Use phone from text_reminder_number if not in questions
    const phoneNumber = phone || invitee.text_reminder_number;

    // Store contact in AI Command Center (don't fail if this fails)
    await storeContactInACC(
      invitee.name,
      invitee.email,
      phoneNumber,
      company,
      event_type.name,
      event.start_time,
      formattedAnswers
    );

    // Send email notification
    const emailSent = await sendEmailNotification(invitee, event_type, event, formattedAnswers);

    if (!emailSent) {
      console.warn('Email notification failed, but webhook processed successfully');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Calendly webhook error', {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      // Don't log: invitee data, payload content
    });
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests (for testing/health check)
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Calendly webhook endpoint is active',
      configured: {
        signingKey: !!CALENDLY_WEBHOOK_SIGNING_KEY,
        web3forms: !!WEB3FORMS_ACCESS_KEY,
      },
    },
    { status: 200 }
  );
}
