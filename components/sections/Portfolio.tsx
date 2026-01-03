'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/lib/portfolio-data-extended';
import FilterButtons from '@/components/ui/FilterButtons';
import PortfolioCard from '@/components/ui/PortfolioCard';

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Filter projects based on active category
  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((project) => project.category === activeFilter);

  // GSAP entrance animation
  useGSAP(() => {
    if (prefersReducedMotion || !titleRef.current) return;

    const ctx = gsap.context(() => {
      // Animate section header
      gsap.fromTo(
        titleRef.current!.children,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="py-20 px-6 bg-moss-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Portfolio
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Explore a selection of projects spanning live entertainment, automation systems, and custom software solutions.
          </p>
        </div>

        {/* Filter Buttons */}
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <AnimatePresence mode="wait">
            <div
              key={activeFilter}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProjects.map((project, index) => (
                <PortfolioCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">
              No projects found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
