import React from 'react';

export interface SkillTagProps {
  /**
   * The skill or technology name to display
   */
  skill: string;
  /**
   * Optional variant for different visual styles
   * @default 'default'
   */
  variant?: 'default' | 'accent' | 'moss';
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * SkillTag - A reusable component for displaying skills/technologies as styled tags
 *
 * @example
 * ```tsx
 * <SkillTag skill="TypeScript" variant="accent" />
 * ```
 */
export default function SkillTag({
  skill,
  variant = 'default',
  className = ''
}: SkillTagProps) {
  const variantStyles = {
    default: 'bg-carbon-light text-text-secondary border-carbon-lighter hover:border-moss-600',
    accent: 'bg-accent/10 text-accent border-accent/30 hover:border-accent',
    moss: 'bg-moss-800/50 text-moss-200 border-moss-700 hover:border-moss-500',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
        border transition-colors duration-300 ease-smooth
        ${variantStyles[variant]}
        ${className}
      `}
      role="listitem"
    >
      {skill}
    </span>
  );
}
