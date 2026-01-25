import { NextRequest, NextResponse } from 'next/server';
import { createConnectedAccount, listConnectedAccounts } from '@/lib/stripe/connect';
import { z } from 'zod';

const createAccountSchema = z.object({
  email: z.string().email('Valid email is required'),
  businessName: z.string().min(1, 'Business name is required'),
  type: z.enum(['express', 'standard', 'custom']).optional(),
});

// Create a new connected account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAccountSchema.parse(body);

    const result = await createConnectedAccount({
      email: validated.email,
      businessName: validated.businessName,
      type: validated.type || 'express',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Create connected account error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create connected account' },
      { status: 500 }
    );
  }
}

// List all connected accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await listConnectedAccounts(limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('List connected accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list connected accounts' },
      { status: 500 }
    );
  }
}
