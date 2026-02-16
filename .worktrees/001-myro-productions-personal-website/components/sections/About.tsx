'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pulse } from '@/lib/animations';
import SkillTag from '@/components/ui/SkillTag';
import CertificationBadge from '@/components/ui/CertificationBadge';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'AI/ML',
  'AWS Cloud',
  'Home Lab',
  'GSAP',
  'Tailwind CSS',
  'PostgreSQL',
  'Docker',
];

const certifications = [
  {
    id: 'cloud-practitioner',
    name: 'AWS Certified Cloud Practitioner',
    imagePath: '/images/certifications/aws-certified-cloud-practitioner.png',
    earnedDate: 'January 2026',
  },
  {
    id: 'ai-practitioner',
    name: 'AWS Certified AI Practitioner',
    imagePath: '/images/certifications/aws-certified-ai-practitioner.png',
    earnedDate: 'February 2026',
  }
];

const highlights = [
  { label: 'Years in Tech', value: '13+' },
  { label: 'AWS Certified', value: '2' },
  { label: 'Projects In Progress', value: '5+' },
  { label: 'Coffee Consumed', value: '∞' },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // GSAP entrance animations
  useGSAP(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate photo area from left
      if (photoRef.current) {
        gsap.fromTo(
          photoRef.current,
          {
            opacity: 0,
            x: -60,
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

      // Add subtle pulse to avatar
      if (avatarRef.current) {
        pulse(avatarRef.current, {
          scale: 1.02,
          duration: 3,
          repeat: -1,
        });
      }

      // Animate content from right with stagger
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          {
            opacity: 0,
            x: 60,
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

      // Count-up animations for stats
      statRefs.current.forEach((statElement, index) => {
        if (!statElement) return;

        const highlight = highlights[index];
        const value = highlight.value;

        // Skip infinity symbol
        if (value === '∞') return;

        // Extract number and suffix
        const match = value.match(/^(\d+)(.*)$/);
        if (!match) return;

        const targetNumber = parseInt(match[1], 10);
        const suffix = match[2]; // '+' or '%'

        // Animate count-up
        gsap.fromTo(
          statElement,
          {
            textContent: '0',
          },
          {
            textContent: targetNumber,
            duration: 2,
            ease: 'power1.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true,
            },
            onUpdate: function () {
              const currentValue = Math.round(parseFloat(this.targets()[0].textContent || '0'));
              statElement.textContent = currentValue + suffix;
            },
            onComplete: function () {
              statElement.textContent = targetNumber + suffix;
            },
          }
        );
      });

      // Animate certifications with stagger
      if (certificationsRef.current) {
        gsap.fromTo(
          certificationsRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: certificationsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 px-6 bg-carbon-subtle"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo/Avatar Area */}
          <div ref={photoRef} className="flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Profile Photo */}
              <div
                ref={avatarRef}
                className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-moss-600/40 hover:border-moss-500/60 transition-colors duration-500"
              >
                <Image
                  src="/nic-myers-profile.png"
                  alt="Nicolas Myers - Founder of Myro Productions"
                  width={320}
                  height={320}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iIzI3MzAzYSIvPgogIDxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiMzYTQzNGUiLz4KPC9zdmc+"
                  className="object-cover w-full h-full"
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 320px"
                />
              </div>

              {/* Decorative accent border on hover */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/0 group-hover:border-accent/30 transition-all duration-500 ease-smooth pointer-events-none"></div>

              {/* Subtle glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 to-moss-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          </div>

          {/* Bio Content */}
          <div ref={contentRef} className="space-y-6">
            {/* Name and Title */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
                Nicolas Robert Myers
              </h2>
              <p className="text-xl text-accent font-medium">
                Founder & Lead Developer at Myro Productions
              </p>
            </div>

            {/* Story Paragraph */}
            <div className="prose prose-invert max-w-none">
              <p className="text-text-secondary text-lg leading-relaxed">
                With over a decade of experience in technology, I specialize in transforming complex problems into
                elegant, automated solutions. My journey began in AV event production before transitioning to AWS cloud
                services, AI development, and web solutions—where I now build intelligent systems, design cloud
                infrastructure, and help businesses modernize their technology stack.
              </p>
            </div>

            {/* Highlights/Stats Grid */}
            <div className="grid grid-cols-2 gap-4 py-4">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-carbon-light/50 backdrop-blur-sm rounded-lg p-4 border border-carbon-lighter hover:border-moss-600/50 transition-colors duration-300"
                >
                  <div
                    ref={(el) => {
                      if (el) statRefs.current[index] = el
                    }}
                    className="text-3xl font-bold text-accent mb-1"
                  >
                    {highlight.value}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {highlight.label}
                  </div>
                </div>
              ))}
            </div>

            {/* AWS Certifications */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                AWS Certifications
              </h3>
              <div
                ref={certificationsRef}
                className="flex flex-wrap gap-6 justify-start"
              >
                {certifications.map((cert) => (
                  <CertificationBadge
                    key={cert.id}
                    name={cert.name}
                    imagePath={cert.imagePath}
                    earnedDate={cert.earnedDate}
                  />
                ))}
              </div>
            </div>

            {/* Personal Quote */}
            <blockquote className="border-l-4 border-moss-600 pl-6 py-2 italic text-text-secondary">
              &quot;Why spend hours on repetitive tasks when you can automate them in minutes?
              That&apos;s not laziness—that&apos;s efficiency.&quot;
            </blockquote>

            {/* Skills/Technologies */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Technologies & Expertise
              </h3>
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="Technologies and skills"
              >
                {skills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    variant={index % 3 === 0 ? 'accent' : index % 3 === 1 ? 'moss' : 'default'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
