'use client';

import Link from 'next/link';
import { useState } from 'react';
import LinkedInIcon from '@/components/icons/LinkedInIcon';
import GitHubIcon from '@/components/icons/GitHubIcon';
import TwitterIcon from '@/components/icons/TwitterIcon';

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/nicolas-myers-8b1599123',
    icon: LinkedInIcon,
    label: 'Visit Nicolas Myers on LinkedIn',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Myro-Productions-Portfolio',
    icon: GitHubIcon,
    label: 'Visit Myro Productions on GitHub',
  },
  {
    name: 'Twitter',
    href: 'https://x.com/Myro_Prod_Biz',
    icon: TwitterIcon,
    label: 'Visit Myro Productions on X',
  },
];

const QUICK_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '#services' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      // TODO: Integrate with Buttondown API
      // For now, using a simple form submission approach
      const formData = new FormData(e.currentTarget);

      const response = await fetch('https://buttondown.email/api/emails/embed-subscribe/myroproductions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        // Reset error message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-carbon-dark border-t border-moss-700">
      {/* Subtle moss gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-moss-600 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        {/* Newsletter Section - Above main footer */}
        <div className="mb-12 pb-12 border-b border-moss-700/30">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Stay Updated
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Get tips on automation, AI development, and project insights.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-carbon-light border border-moss-700 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Email address"
              />
              <input type="hidden" name="embed" value="1" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-moss-600 hover:bg-moss-500 text-text-primary font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-moss-600/20 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-moss-600 disabled:hover:shadow-none"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mt-4 p-3 bg-moss-700/20 border border-moss-600 rounded-lg text-moss-200 text-sm animate-fade-in">
                Thanks for subscribing! Check your inbox to confirm.
              </div>
            )}
            {status === 'error' && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-sm animate-fade-in">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Main footer content - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Column 1: Brand */}
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold bg-gradient-to-r from-moss-400 to-accent bg-clip-text text-transparent mb-3">
              MYRO
            </div>
            <p className="text-text-secondary text-sm mb-6 max-w-xs mx-auto md:mx-0">
              Rapid prototyping, automation solutions, and AI-accelerated development for modern businesses.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 justify-center md:justify-start">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-text-secondary hover:text-accent transition-all duration-300 transform hover:scale-110 focus-visible:text-accent focus-visible:scale-110 rounded-md p-1 -m-1"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-text-secondary hover:text-accent focus-visible:text-accent transition-colors duration-300 text-sm rounded px-2 py-1 -mx-2"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary mb-1">Phone</p>
                <a
                  href="tel:+13175631247"
                  className="hover:text-accent focus-visible:text-accent transition-colors duration-300 rounded px-1 -mx-1 inline-block"
                >
                  (317) 563-1247
                </a>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">Email</p>
                <a
                  href="mailto:nmyers@myroproductions.com"
                  className="hover:text-accent focus-visible:text-accent transition-colors duration-300 rounded px-1 -mx-1 inline-block"
                >
                  nmyers@myroproductions.com
                </a>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">Location</p>
                <p>Remote & On-site Available</p>
              </div>
              <div>
                <p className="font-medium text-text-primary mb-1">Hours</p>
                <p>Mon - Fri: 9AM - 6PM EST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-carbon-light">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-text-muted text-sm">
              &copy; {currentYear} Myro Productions. All rights reserved.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <p className="text-text-muted text-sm">
                Built with{' '}
                <span className="text-accent font-medium">Next.js</span>
              </p>

              {/* Back to top button */}
              <button
                onClick={scrollToTop}
                aria-label="Scroll back to top"
                className="group flex items-center gap-2 text-text-secondary hover:text-accent focus-visible:text-accent transition-all duration-300 text-sm font-medium min-w-[120px] justify-center rounded-lg px-3 py-2"
              >
                Back to top
                <svg
                  className="w-4 h-4 transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
