'use client';

import { PORTFOLIO_CATEGORIES } from '@/lib/portfolio-data';

interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-3 mb-12"
      role="group"
      aria-label="Project category filters"
    >
      {PORTFOLIO_CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onFilterChange(category.id)}
          className={`
            px-6 py-2.5 rounded-full font-medium text-sm
            transition-all duration-300
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-carbon
            ${
              activeFilter === category.id
                ? 'bg-accent text-carbon shadow-lg shadow-accent/20 scale-105'
                : 'bg-carbon-light text-text-secondary hover:bg-moss-700 hover:text-text-primary focus-visible:bg-moss-700 focus-visible:text-text-primary'
            }
          `}
          aria-pressed={activeFilter === category.id}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
