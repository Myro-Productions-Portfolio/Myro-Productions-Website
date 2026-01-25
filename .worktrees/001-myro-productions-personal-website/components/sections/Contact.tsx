'use client';

import { useRef, useState, useEffect, FormEvent } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shake } from '@/lib/animations';
import { getOrCreateCsrfToken, regenerateCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select, { SelectOption } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import BookingButton from '@/components/ui/BookingButton';

gsap.registerPlugin(ScrollTrigger);

const projectTypes: SelectOption[] = [
  { value: '', label: 'Select a project type...' },
  { value: 'rapid-prototyping', label: 'Rapid Prototyping' },
  { value: 'automation', label: 'Automation' },
  { value: 'ai-development', label: 'AI Development' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  botcheck?: string; // Honeypot field for spam protection
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  message?: string;
}

interface FieldTouched {
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  projectType?: boolean;
  message?: boolean;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
    botcheck: '', // Honeypot field
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FieldTouched>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [csrfToken, setCsrfToken] = useState<string>('');

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Initialize CSRF token on component mount
  useEffect(() => {
    // Generate and store CSRF token in cookie, then save to state for header
    const token = getOrCreateCsrfToken();
    setCsrfToken(token);
  }, []);

  // GSAP entrance animations
  useGSAP(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate left column (contact info) from left
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          {
            opacity: 0,
            x: -60,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Animate right column (form) from right
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          {
            opacity: 0,
            x: 60,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (optional field)
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    // Flexible phone format: allows digits, spaces, dashes, parentheses, plus
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    return phoneRegex.test(phone) && cleanedPhone.length >= 10;
  };

  // Validate individual field
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required';
        } else if (value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        } else if (!validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value.trim() && !validatePhone(value)) {
          return 'Please enter a valid phone number (10+ digits)';
        }
        break;
      case 'projectType':
        if (!value) {
          return 'Please select a project type';
        }
        break;
      case 'message':
        if (!value.trim()) {
          return 'Message is required';
        } else if (value.trim().length < 10) {
          return 'Message must be at least 10 characters';
        }
        break;
    }
    return undefined;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      if (key !== 'botcheck') {
        const error = validateField(key, formData[key] || '');
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      projectType: true,
      message: true,
    });

    // Shake form on validation error
    if (Object.keys(newErrors).length > 0 && formRef.current) {
      shake(formRef.current, { intensity: 10, duration: 0.4 });
    }
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    if (!touched[name as keyof FieldTouched]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    // Real-time validation: validate as user types
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle field blur (when user leaves a field)
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Check if field is valid (for green border)
  const isFieldValid = (fieldName: keyof FieldTouched): boolean => {
    const value = formData[fieldName as keyof FormData];
    return touched[fieldName] === true && !errors[fieldName] && typeof value === 'string' && value.trim() !== '';
  };

  // Check if form is valid (for submit button)
  const isFormValid = (): boolean => {
    // Check all required fields
    const hasName: boolean = formData.name.trim().length >= 2;
    const hasEmail: boolean = formData.email.trim().length > 0 && validateEmail(formData.email) === true;
    const hasValidPhone: boolean = !formData.phone.trim() || validatePhone(formData.phone) === true;
    const hasProjectType: boolean = formData.projectType !== '';
    const hasMessage: boolean = formData.message.trim().length >= 10;
    const noErrors: boolean = Object.values(errors).every((error) => !error);

    return hasName && hasEmail && hasValidPhone && hasProjectType && hasMessage && noErrors;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure CSRF token is available
    if (!csrfToken) {
      console.error('CSRF token not available');
      setStatus('error');
      return;
    }

    setStatus('loading');

    // Send to API route using Web3Forms with CSRF protection
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [CSRF_HEADER_NAME]: csrfToken,
        },
        credentials: 'same-origin', // Include cookies in the request
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
      } else {
        throw new Error(result.error || 'Failed to send message');
      }

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          message: '',
          botcheck: '',
        });
        setErrors({});
        setTouched({});
        setStatus('idle');
        // Regenerate CSRF token for next submission
        const newToken = regenerateCsrfToken();
        setCsrfToken(newToken);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 px-6 bg-carbon"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Contact Info */}
          <div ref={leftColRef} className="space-y-8">
            {/* Section Title */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                Let&apos;s Build Something Amazing
              </h2>
              <p className="text-lg text-text-secondary">
                Have a project in mind? I&apos;d love to hear about it. Drop me a message and let&apos;s discuss how we can bring your ideas to life.
              </p>
            </div>

            {/* Schedule a Call */}
            <div className="bg-carbon-light/50 backdrop-blur-sm rounded-lg p-6 border border-carbon-lighter hover:border-moss-600/50 transition-colors duration-300">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Prefer to Talk?
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Schedule a free 30-minute discovery call to discuss your project in detail.
              </p>
              <BookingButton
                variant="primary"
                size="md"
                className="w-full"
              />
            </div>

            {/* Email */}
            <div className="bg-carbon-light/50 backdrop-blur-sm rounded-lg p-6 border border-carbon-lighter hover:border-moss-600/50 transition-colors duration-300">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
                Email
              </h3>
              <a
                href="mailto:pmnicolasm@gmail.com"
                className="text-xl text-accent hover:text-accent-light focus-visible:text-accent-light transition-colors duration-300 inline-flex items-center gap-2 group rounded px-1 -mx-1"
                aria-label="Email pmnicolasm@gmail.com"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                pmnicolasm@gmail.com
              </a>
              <p className="text-sm text-text-secondary mt-3">
                Usually responds within 24 hours
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Connect With Me
              </h3>
              <div className="flex gap-4">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/nicolas-myers-8b1599123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-carbon-light/50 backdrop-blur-sm rounded-lg border border-carbon-lighter hover:border-moss-600/50 transition-all duration-300 hover:scale-105 group"
                  aria-label="Visit Nicolas Myers on LinkedIn (opens in new tab)"
                >
                  <svg
                    className="h-6 w-6 text-accent group-hover:text-accent-light transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-text-primary group-hover:text-accent transition-colors duration-300">
                    LinkedIn
                  </span>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/husky2466-codo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-carbon-light/50 backdrop-blur-sm rounded-lg border border-carbon-lighter hover:border-moss-600/50 focus-visible:border-accent transition-all duration-300 hover:scale-105 focus-visible:scale-105 group"
                  aria-label="Visit Myro Productions on GitHub (opens in new tab)"
                >
                  <svg
                    className="h-6 w-6 text-accent group-hover:text-accent-light transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="text-text-primary group-hover:text-accent transition-colors duration-300">
                    GitHub
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div ref={rightColRef}>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Honeypot field - hidden from users, catches bots */}
              <input
                type="text"
                name="botcheck"
                value={formData.botcheck}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Name Field */}
              <div className="relative">
                <Input
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name ? errors.name : undefined}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  className={
                    isFieldValid('name')
                      ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
                      : ''
                  }
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {isFieldValid('name') && (
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
              </div>

              {/* Email Field */}
              <div className="relative">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : undefined}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  className={
                    isFieldValid('email')
                      ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
                      : ''
                  }
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {isFieldValid('email') && (
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
              </div>

              {/* Phone Field (Optional) */}
              <div className="relative">
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone ? errors.phone : undefined}
                  disabled={status === 'loading' || status === 'success'}
                  className={
                    isFieldValid('phone')
                      ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
                      : ''
                  }
                  helperText="Optional - if you prefer a call back"
                  aria-describedby={errors.phone ? 'phone-error' : 'phone-helper'}
                />
                {isFieldValid('phone') && (
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
              </div>

              {/* Project Type Dropdown */}
              <div className="relative">
                <Select
                  label="Project Type"
                  name="projectType"
                  options={projectTypes}
                  value={formData.projectType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.projectType ? errors.projectType : undefined}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  className={
                    isFieldValid('projectType')
                      ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
                      : ''
                  }
                  aria-describedby={errors.projectType ? 'project-type-error' : undefined}
                />
                {isFieldValid('projectType') && (
                  <div className="absolute right-10 top-10 text-moss-600">
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
              </div>

              {/* Message Textarea */}
              <div className="relative">
                <Textarea
                  label="Message"
                  name="message"
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.message ? errors.message : undefined}
                  required
                  rows={6}
                  disabled={status === 'loading' || status === 'success'}
                  className={
                    isFieldValid('message')
                      ? 'border-moss-600 focus:border-moss-600 focus:ring-moss-600/30'
                      : ''
                  }
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {isFieldValid('message') && (
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === 'loading' || status === 'success' || !isFormValid()}
              >
                {status === 'loading' && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-carbon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
              </Button>

              {/* Success Message */}
              {status === 'success' && (
                <div className="p-4 bg-moss-800/30 border border-moss-600 rounded-lg text-moss-200 text-sm">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>
                      Thank you for your message! I&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200 text-sm">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>
                      Something went wrong. Please try again or email me directly at{' '}
                      <a
                        href="mailto:pmnicolasm@gmail.com"
                        className="underline hover:text-red-100"
                      >
                        pmnicolasm@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
