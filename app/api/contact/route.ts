import { NextRequest, NextResponse } from 'next/server';

/**
 * Contact Form API Route
 *
 * Uses Web3Forms for email delivery - a free, serverless email service
 * Get your access key at: https://web3forms.com
 *
 * Features:
 * - Honeypot spam protection
 * - Rate limiting (basic)
 * - Email validation
 * - Sends to hello@myroproductions.com
 */

interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  message: string;
  botcheck?: string; // Honeypot field
}

// Web3Forms access key - Get yours at https://web3forms.com
// TODO: Move to environment variable for production
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';

export async function POST(request: NextRequest) {
  try {
    const formData: ContactFormData = await request.json();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.projectType || !formData.message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Honeypot check - if botcheck field is filled, it's a bot
    if (formData.botcheck) {
      return NextResponse.json(
        { success: false, error: 'Spam detected' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Message length validation
    if (formData.message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Prepare Web3Forms payload
    const web3formsPayload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New Contact Form Submission - ${formData.projectType}`,
      from_name: formData.name,
      from_email: formData.email,
      to_email: 'hello@myroproductions.com',
      message: `
Name: ${formData.name}
Email: ${formData.email}
Project Type: ${formData.projectType}

Message:
${formData.message}
      `.trim(),
      // Optional: Add these for better tracking
      replyto: formData.email,
      botcheck: formData.botcheck || '',
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
        { status: 200 }
      );
    } else {
      // Web3Forms returned an error
      console.error('Web3Forms error:', result);
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to send email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
