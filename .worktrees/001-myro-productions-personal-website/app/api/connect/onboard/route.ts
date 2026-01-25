import { NextRequest, NextResponse } from 'next/server';
import { createAccountLink } from '@/lib/stripe/connect';
import { z } from 'zod';

const onboardSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  refreshUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
});

/**
 * Create an onboarding link for a connected account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = onboardSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const result = await createAccountLink({
      accountId: validated.accountId,
      refreshUrl: validated.refreshUrl || `${baseUrl}/connect/onboard/refresh`,
      returnUrl: validated.returnUrl || `${baseUrl}/connect/onboard/complete`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Create account link error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create account link' },
      { status: 500 }
    );
  }
}
