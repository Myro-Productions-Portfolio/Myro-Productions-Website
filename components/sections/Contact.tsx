'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shake } from '@/lib/animations';
import { SelectOption } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useContactForm } from './contact/useContactForm';
import ContactInfo from './contact/ContactInfo';
import ContactFormFields from './contact/ContactFormFields';

gsap.registerPlugin(ScrollTrigger);

const projectTypes: SelectOption[] = [
  { value: '', label: 'Select a project type...' },
  { value: 'rapid-prototyping', label: 'Rapid Prototyping' },
  { value: 'automation', label: 'Automation' },
  { value: 'ai-development', label: 'AI Development' },
  { value: 'other', label: 'Other' },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Use custom hook for form logic
  const {
    formData,
    errors,
    touched,
    status,
    handleChange,
    handleBlur,
    handleSubmit,
    isFieldValid,
    isFormValid,
  } = useContactForm();

  // GSAP entrance animation for right column (form)
  useGSAP(() => {
    if (prefersReducedMotion || !sectionRef.current || !rightColRef.current) return;

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
  }, [prefersReducedMotion]);

  // Handle form submission with shake animation on validation error
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if form is valid before submitting
    if (!isFormValid() && formRef.current) {
      shake(formRef.current, { intensity: 10, duration: 0.4 });
    }
    
    await handleSubmit(e);
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
          <ContactInfo
            prefersReducedMotion={prefersReducedMotion}
            sectionRef={sectionRef}
          />

          {/* Right Column - Contact Form */}
          <div ref={rightColRef}>
            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6" noValidate>
              <ContactFormFields
                formData={formData}
                errors={errors}
                touched={touched}
                status={status}
                projectTypes={projectTypes}
                onChange={handleChange}
                onBlur={handleBlur}
                isFieldValid={isFieldValid}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === 'loading' || status === 'success'}
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
                      className="h-5 w-5 shrink-0 mt-0.5"
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
                      className="h-5 w-5 shrink-0 mt-0.5"
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
