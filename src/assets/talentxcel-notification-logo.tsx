import React from 'react';

export const TalentXcelNotificationLogo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="talentxcel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-foreground))" />
        </linearGradient>
      </defs>
      
      {/* Main circle */}
      <circle cx="50" cy="50" r="45" fill="url(#talentxcel-gradient)" />
      
      {/* Letter T */}
      <path
        d="M25 25 L75 25 M50 25 L50 75"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Decorative elements */}
      <circle cx="30" cy="70" r="3" fill="white" opacity="0.8" />
      <circle cx="70" cy="70" r="3" fill="white" opacity="0.8" />
      <circle cx="50" cy="80" r="2" fill="white" opacity="0.6" />
    </svg>
  );
};