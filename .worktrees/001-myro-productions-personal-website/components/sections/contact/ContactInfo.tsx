'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import BookingButton from '@/components/ui/BookingButton';

interface ContactInfoProps {
  prefersReducedMotion: boolean;
  sectionRef: React.RefObject<HTMLElement | null>;
}

export default function ContactInfo({ prefersReducedMotion, sectionRef }: ContactInfoProps) {
  const leftColRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animations for left column
  useGSAP(() => {
    if (prefersReducedMotion || !sectionRef.current || !leftColRef.current) return;

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
  }, [prefersReducedMotion]);

  return (
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

      {/* Phone */}
      <div className="bg-carbon-light/50 backdrop-blur-sm rounded-lg p-6 border border-carbon-lighter hover:border-moss-600/50 transition-colors duration-300">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Phone
        </h3>
        <a
          href="tel:+13175631247"
          className="text-xl text-accent hover:text-accent-light focus-visible:text-accent-light transition-colors duration-300 inline-flex items-center gap-2 group rounded px-1 -mx-1"
          aria-label="Call (317) 563-1247"
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          (317) 563-1247
        </a>
        <p className="text-sm text-text-secondary mt-3">
          Available Mon - Fri, 9AM - 6PM EST
        </p>
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
            href="https://github.com/Myro-Productions-Portfolio"
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
  );
}
