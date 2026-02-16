import React from 'react';
import Image from 'next/image';

export interface CertificationBadgeProps {
  /**
   * The certification name to display
   */
  name: string;
  /**
   * Path to the certification badge image
   */
  imagePath: string;
  /**
   * When the certification was earned
   */
  earnedDate: string;
  /**
   * Optional URL to the credential verification page (e.g., Credly)
   */
  credentialUrl?: string;
}

/**
 * CertificationBadge - A reusable component for displaying certification badges
 *
 * @example
 * ```tsx
 * <CertificationBadge
 *   name="AWS Certified Cloud Practitioner"
 *   imagePath="/images/certifications/aws-certified-cloud-practitioner.png"
 *   earnedDate="January 2026"
 * />
 * ```
 */
export default function CertificationBadge({
  name,
  imagePath,
  earnedDate,
  credentialUrl,
}: CertificationBadgeProps) {
  const BadgeContent = (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative w-[120px] h-[120px] transition-transform duration-300 group-hover:scale-105">
        <Image
          src={imagePath}
          alt={`${name} certification badge`}
          width={120}
          height={120}
          className="rounded-lg"
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">{name}</p>
        <p className="text-xs text-text-secondary mt-1">{earnedDate}</p>
      </div>
    </div>
  );

  if (credentialUrl) {
    return (
      <a
        href={credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-90 transition-opacity"
      >
        {BadgeContent}
      </a>
    );
  }

  return BadgeContent;
}
