'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  name: string
  error?: string
  helperText?: string
  required?: boolean
  isValid?: boolean
  children: ReactNode
  className?: string
}

/**
 * FormField - Reusable wrapper component for form inputs
 * 
 * Provides consistent label, error display, helper text, and validation icons
 * for all form field types (Input, Textarea, Select).
 * 
 * @param label - Field label text
 * @param name - Field name (used for ID generation)
 * @param error - Error message to display (when field is invalid)
 * @param helperText - Optional helper text (shown when no error)
 * @param required - Whether field is required (shows asterisk)
 * @param isValid - Whether field is valid (shows checkmark icon)
 * @param children - The actual input element (Input, Textarea, Select)
 * @param className - Additional CSS classes for the wrapper
 */
export default function FormField({
  label,
  name,
  error,
  helperText,
  required = false,
  isValid = false,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-text-secondary mb-2"
      >
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>

      {children}

      {/* Validation checkmark */}
      {isValid && (
        <div className="absolute right-3 top-10 text-moss-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <p
          id={`${name}-helper`}
          className="mt-2 text-sm text-text-secondary"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
