# Contact Form Email Setup Guide

## Overview

The contact form is now fully functional with serverless email delivery using **Web3Forms**. This guide will help you set up the email service for production use.

## What's Been Implemented

### Components Created/Modified

1. **API Route**: `app/api/contact/route.ts`
   - Next.js serverless API route
   - Handles form submissions
   - Validates all fields server-side
   - Sends emails via Web3Forms API
   - Includes honeypot spam protection

2. **Contact Component**: `components/sections/Contact.tsx`
   - Updated to use real API instead of mock
   - Added honeypot field (hidden from users)
   - Integrated error handling with specific error messages
   - Form resets after successful submission

3. **Environment Configuration**: `.env.example`
   - Updated with Web3Forms API key placeholder

### Features

- ✅ **Serverless** - No backend server required, perfect for Vercel
- ✅ **Free Tier** - 250 emails/month on free plan
- ✅ **Spam Protection** - Honeypot field catches bots
- ✅ **Validated** - Server-side validation for all fields
- ✅ **User Friendly** - Clear success/error messages
- ✅ **Accessible** - Fully accessible form with ARIA attributes
- ✅ **Production Ready** - Build tested and passing

## Setup Instructions

### Step 1: Get Web3Forms API Key

1. Visit [https://web3forms.com](https://web3forms.com)
2. Click "Get Started Free"
3. Sign up with your email
4. Verify your email address
5. In the dashboard, click "Create New Access Key"
6. Copy your access key (starts with a long alphanumeric string)

### Step 2: Configure Environment Variable

#### For Local Development

1. Create a `.env.local` file in the project root:
   ```bash
   WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```

2. This file is already in `.gitignore` so it won't be committed

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `WEB3FORMS_ACCESS_KEY`
   - **Value**: Your access key from Web3Forms
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**
5. Redeploy your application

### Step 3: Test the Form

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   - Navigate to the Contact section
   - Fill out the form with valid data
   - Submit and check your email at `hello@myroproductions.com`

2. **Production Testing**:
   - After deploying to Vercel with the environment variable
   - Test the live contact form
   - Verify emails are received

## How It Works

### User Flow

1. User fills out the contact form
2. Client-side validation checks all fields
3. Form data is sent to `/api/contact` (Next.js API route)
4. Server validates data again (security)
5. Honeypot field checked (if filled, it's a bot)
6. API route sends data to Web3Forms
7. Web3Forms delivers email to `hello@myroproductions.com`
8. Success/error message shown to user

### Spam Protection

**Honeypot Field**:
- Hidden field named `botcheck`
- Hidden from users with `style={{ display: 'none' }}`
- Bots typically fill all fields automatically
- If this field has content, submission is rejected
- Zero impact on user experience

**Server-Side Validation**:
- All fields validated on server
- Email format checked
- Minimum message length enforced
- Prevents malicious submissions

## Email Template

Emails sent to `hello@myroproductions.com` will have this format:

```
Subject: New Contact Form Submission - [Project Type]

Name: [User's Name]
Email: [User's Email]
Project Type: [Selected Type]

Message:
[User's Message]
```

**Reply-To** header is set to the user's email, so you can reply directly.

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variable**:
   - Ensure `WEB3FORMS_ACCESS_KEY` is set correctly
   - In Vercel, redeploy after adding the variable

2. **Check API Key**:
   - Log into Web3Forms dashboard
   - Verify the access key is active
   - Check usage limits (free plan: 250/month)

3. **Check Spam Folder**:
   - Emails might be filtered as spam initially
   - Mark as "Not Spam" to train filter

### Form Shows Error Message

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for error messages
   - Look for network errors in Network tab

2. **Verify API Route**:
   - Navigate to `/api/contact` in browser
   - Should show OPTIONS allowed methods
   - If 404, API route isn't deployed correctly

### Build Errors

If you encounter build errors:

```bash
# Clean build cache
rm -rf .next

# Rebuild
npm run build
```

## Alternative Email Services (If Needed)

If Web3Forms doesn't meet your needs, here are alternatives:

### 1. Resend (Recommended for High Volume)
- Modern email API
- 100 emails/day free
- Great developer experience
- [resend.com](https://resend.com)

### 2. Formspree
- Simple form backend
- 50 submissions/month free
- No code needed
- [formspree.io](https://formspree.io)

### 3. SendGrid
- Enterprise-grade
- 100 emails/day free
- More complex setup
- [sendgrid.com](https://sendgrid.com)

## Files Modified

- `app/api/contact/route.ts` (created)
- `components/sections/Contact.tsx` (modified)
- `.env.example` (modified)
- `CONTACT-IMPLEMENTATION.md` (updated)
- `CONTACT-FORM-EMAIL-SETUP.md` (created)

## Next Steps

1. Set up Web3Forms account and get API key
2. Add environment variable to Vercel
3. Redeploy application
4. Test contact form on production site
5. Monitor Web3Forms dashboard for submissions

## Support

- **Web3Forms Docs**: https://docs.web3forms.com
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Vercel Environment Variables**: https://vercel.com/docs/environment-variables

---

**Status**: ✅ Implementation Complete - Ready for API Key Setup
