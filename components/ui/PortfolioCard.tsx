'use client';

import { useRef } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project } from '@/lib/portfolio-data-extended';

gsap.registerPlugin(ScrollTrigger);

interface PortfolioCardProps {
  project: Project;
  index?: number;
}

export default function PortfolioCard({ project, index = 0 }: PortfolioCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // GSAP scroll-triggered entrance animation
  useGSAP(() => {
    if (prefersReducedMotion || !cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        delay: (index % 3) * 0.1, // Stagger based on position in row
      }
    );
  }, [prefersReducedMotion, index]);

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <motion.article
        ref={cardRef}
        layout
        layoutId={project.id}
        initial={false} // Let GSAP handle entrance
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-carbon-light rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 max-w-full cursor-pointer"
      >
        {/* Image Placeholder with Gradient */}
        <div
          className="w-full h-64 relative overflow-hidden"
          style={{ background: project.imageGradient }}
          role="img"
          aria-label={`${project.title} project preview - ${project.category} themed gradient`}
        >
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-carbon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-text-primary text-lg font-semibold">View Details</span>
          </div>
        </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Status Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-block px-3 py-1 bg-moss-700 text-accent text-xs font-medium rounded-full capitalize">
            {project.category}
          </span>
          {project.status && (
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
              project.status === 'in-progress'
                ? 'bg-amber-900/50 text-amber-400'
                : project.status === 'planning'
                ? 'bg-blue-900/50 text-blue-400'
                : 'bg-green-900/50 text-green-400'
            }`}>
              {project.status === 'in-progress' ? 'In Progress' : project.status === 'planning' ? 'Planning' : 'Completed'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-300 break-words">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 line-clamp-3 break-words">
          {project.description}
        </p>

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="text-accent" aria-hidden="true">📊</span>
            <div className="flex flex-wrap gap-1.5">
              {project.metrics.map((metric, index) => (
                <span key={index} className="text-text-secondary">
                  <span className="text-accent font-semibold">
                    {metric.split(' ')[0]}
                  </span>{' '}
                  <span>{metric.split(' ').slice(1).join(' ')}</span>
                  {index < project.metrics!.length - 1 && (
                    <span className="text-accent mx-1">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-moss-900 text-text-secondary text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      </motion.article>
    </Link>
  );
}
