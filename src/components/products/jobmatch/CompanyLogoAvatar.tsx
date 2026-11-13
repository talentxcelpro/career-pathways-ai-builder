// src/components/products/jobmatch/CompanyLogoAvatar.tsx
// Authentic Company Logo & Monogram Avatar for JobMatch OS
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { getCompanyLogo, generateCompanyMonogram } from '@/utils/companyLogos';

interface CompanyLogoAvatarProps {
  companyName: string;
  rawLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CompanyLogoAvatar: React.FC<CompanyLogoAvatarProps> = ({
  companyName,
  rawLogoUrl,
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedLogo = getCompanyLogo(companyName, rawLogoUrl);

  const sizeClasses = {
    sm: 'w-7 h-7 min-w-[28px] rounded-lg text-[10px]',
    md: 'w-10 h-10 min-w-[40px] rounded-xl text-xs',
    lg: 'w-12 h-12 min-w-[48px] rounded-xl text-sm',
    xl: 'w-16 h-16 min-w-[64px] rounded-2xl text-base'
  }[size];

  const fallbackMonogram = generateCompanyMonogram(companyName);

  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden bg-white border border-[#E2E8F0] shadow-2xs shrink-0 select-none ${sizeClasses} ${className}`}
      title={companyName}
    >
      {!hasError && resolvedLogo ? (
        <img
          src={resolvedLogo}
          alt={`${companyName} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <img
          src={fallbackMonogram}
          alt={`${companyName} monogram`}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};
