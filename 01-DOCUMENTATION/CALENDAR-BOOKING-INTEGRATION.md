# Calendar Booking Integration

This document describes the Calendly integration added to the Myro Productions website.

## Overview

The website now includes a "Book a Discovery Call" feature using Calendly's popup widget integration. This allows visitors to easily schedule consultations without leaving the site.

## Implementation

### Component Created

**`components/ui/BookingButton.tsx`**
- Reusable button component for triggering the Calendly popup
- Automatically loads the Calendly widget script
- Props:
  - `variant`: 'primary' | 'secondary' (default: 'primary')
  - `size`: 'sm' | 'md' | 'lg' (default: 'lg')
  - `className`: Additional CSS classes
  - `calendlyUrl`: Custom Calendly URL (default: placeholder URL)
- Includes calendar icon for visual clarity
- Falls back to opening in new tab if script hasn't loaded

### Integration Points

The booking button has been added to three strategic locations:

#### 1. Hero Section (`components/sections/Hero.tsx`)
- **Location**: Primary CTA button (leftmost position)
- **Purpose**: Capture visitors' attention immediately with the option to book a call
- **Implementation**: Replaced "View My Work" as the primary CTA

#### 2. Contact Section (`components/sections/Contact.tsx`)
- **Location**: Left column, above the email contact card
- **Purpose**: Provide an alternative to the contact form for those who prefer live conversation
- **Card Title**: "Prefer to Talk?"
- **Description**: "Schedule a free 30-minute discovery call to discuss your project in detail."

#### 3. Services Section (`components/sections/Services.tsx`)
- **Location**: Below the service cards grid
- **Purpose**: Convert interested visitors after they've learned about the services
- **CTA Text**: "Ready to accelerate your project? Let's discuss how these services can help you achieve your goals faster."

## Configuration

### Updating the Calendly URL

To connect your actual Calendly account:

1. Open `components/ui/BookingButton.tsx`
2. Find the `calendlyUrl` prop default value:
   ```typescript
   calendlyUrl = 'https://calendly.com/myroproductions/discovery'
   ```
3. Replace with your actual Calendly event URL:
   - Log into Calendly
   - Go to your event type (e.g., "Discovery Call")
   - Copy the event link
   - Paste it as the default value

Alternatively, you can pass a custom URL when using the component:
```tsx
<BookingButton calendlyUrl="https://calendly.com/yourusername/your-event" />
```

## How It Works

1. **Script Loading**: When the BookingButton component mounts, it dynamically loads the Calendly widget script
2. **User Click**: When clicked, the button calls `window.Calendly.initPopupWidget()`
3. **Popup Display**: Calendly's modal overlay appears with your booking calendar
4. **Booking Flow**: User selects time, fills in details, and confirms
5. **Fallback**: If the script hasn't loaded, it opens Calendly in a new tab

## Features

- **Seamless Integration**: No page navigation required
- **Mobile Responsive**: Works on all device sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Styled Consistently**: Matches the site's design system
- **Non-blocking**: Script loads asynchronously

## Testing

To test the integration:

1. Run the development server: `npm run dev`
2. Navigate to the homepage
3. Click any "Book a Discovery Call" button
4. Verify the Calendly popup appears
5. Test on mobile devices for responsiveness

## Files Modified

- ✅ `components/ui/BookingButton.tsx` (new file)
- ✅ `components/sections/Hero.tsx` (added booking button)
- ✅ `components/sections/Contact.tsx` (added booking card)
- ✅ `components/sections/Services.tsx` (added CTA section)
- ✅ `components/sections/About.tsx` (fixed TypeScript error)

## Notes

- The Calendly script is loaded only when the BookingButton component is used
- Each button instance loads the script once (React handles cleanup)
- The placeholder URL should be replaced with your actual Calendly event link
- No additional dependencies were added (uses vanilla Calendly widget API)

## Next Steps

1. **Set Up Calendly Account**: Create event types for discovery calls
2. **Update URL**: Replace the placeholder URL in `BookingButton.tsx`
3. **Configure Event Settings**: Set duration, buffer times, availability
4. **Add Reminders**: Configure email/SMS reminders in Calendly
5. **Track Conversions**: Set up analytics to track booking clicks
