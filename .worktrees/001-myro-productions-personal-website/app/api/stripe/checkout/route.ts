import { NextRequest, NextResponse } from 'next/server';
import { stripe, PaymentMetadata } from '@/lib/stripe/config';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  paymentType: z.enum(['one-time', 'subscription', 'quote']),
  description: z.string().optional(),
  quoteId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const {
      priceId,
      customerEmail,
      customerName,
      paymentType,
      description,
      quoteId,
      successUrl,
      cancelUrl,
    } = validated;

    // Build metadata
    const metadata: PaymentMetadata = {
      type: paymentType,
      customerEmail,
      customerName,
      ...(description && { description }),
      ...(quoteId && { quoteId }),
    };

    // Determine mode based on payment type
    const mode = paymentType === 'subscription' ? 'subscription' : 'payment';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancelled`,
      billing_address_collection: 'required',
      ...(paymentType === 'subscription' && {
        subscription_data: {
          metadata,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
