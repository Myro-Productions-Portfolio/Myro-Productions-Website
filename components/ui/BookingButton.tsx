'use client'

import { useEffect } from 'react'
import Button from './Button'

interface BookingButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  calendlyUrl?: string
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void
    }
  }
}

export default function BookingButton({
  variant = 'primary',
  size = 'lg',
  className = '',
  calendlyUrl = 'https://calendly.com/pmnicolasm/30min',
}: BookingButtonProps) {
  useEffect(() => {
    // Load Calendly widget CSS
    const link = document.createElement('link')
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleBookingClick = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: calendlyUrl })
    } else {
      // Fallback: open in new tab if script hasn't loaded
      window.open(calendlyUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleBookingClick}
      aria-label="Book a discovery call"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Book a Discovery Call
    </Button>
  )
}
