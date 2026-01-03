'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is your typical project timeline?",
    answer: "Most projects take 2-6 weeks depending on complexity. MVPs can be delivered in as little as 1-2 weeks. I provide detailed timelines during the planning phase."
  },
  {
    question: "What technologies do you work with?",
    answer: "I specialize in React, Next.js, Node.js, Python, and Electron for desktop apps. I also work with AI/ML tools including Claude, GPT, and custom training pipelines."
  },
  {
    question: "Do you offer ongoing support?",
    answer: "Yes! I offer maintenance packages and can provide ongoing development support. Many clients continue working with me after initial project delivery."
  },
  {
    question: "What is your communication style?",
    answer: "I believe in transparent, frequent communication. You'll receive regular updates, have direct access to me, and can expect responses within 24 hours."
  },
  {
    question: "How do payments work?",
    answer: "I typically work with a 50% upfront deposit and 50% on completion. For larger projects, we can arrange milestone-based payments."
  }
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // GSAP entrance animations
  useGSAP(() => {
    if (prefersReducedMotion || !itemsRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance animation for FAQ items
      gsap.fromTo(
        itemsRef.current!.children,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 px-6 bg-carbon-light"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Get answers to common questions about working with me
          </p>
        </div>

        {/* FAQ Items */}
        <div ref={itemsRef} className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-carbon/50 backdrop-blur-sm rounded-lg border border-carbon-lighter overflow-hidden transition-all duration-300 hover:border-moss-600/50"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 transition-colors duration-300 hover:bg-carbon-light/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-carbon"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-semibold text-text-primary pr-4">
                  {faq.question}
                </span>

                {/* Toggle Icon */}
                <svg
                  className={`flex-shrink-0 h-6 w-6 text-accent transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer Panel */}
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help CTA */}
        <div className="mt-12 text-center">
          <p className="text-text-secondary mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-moss-700 hover:bg-moss-600 text-text-primary font-semibold rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-light"
          >
            Get in Touch
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
