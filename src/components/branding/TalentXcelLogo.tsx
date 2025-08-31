import React from 'react';

interface TalentXcelLogoProps {
  variant?: 'full' | 'symbol' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TalentXcelLogo: React.FC<TalentXcelLogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className = "" 
}) => {
  console.log('TalentXcelLogo rendering with variant:', variant, 'size:', size);
  
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const symbolSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12', 
    xl: 'h-16 w-16'
  };

  // Simple fallback logo as a circle with TX
  const FallbackLogo = ({ className: fallbackClassName }: { className: string }) => (
    <div className={`${fallbackClassName} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold`}>
      TX
    </div>
  );

  // Logo symbol only (TX in circle)
  if (variant === 'symbol') {
    return (
      <div className={`${symbolSizeClasses[size]} ${className}`}>
        <FallbackLogo className="w-full h-full" />
      </div>
    );
  }

  // Text only version
  if (variant === 'text') {
    return (
      <div className={`${className} flex items-center`}>
        <span className="font-bold text-foreground">
          talent<span className="text-blue-600">Xcel</span>
        </span>
      </div>
    );
  }

  // Full logo with symbol and text
  return (
    <div className={`${className} flex items-center gap-2`}>
      <FallbackLogo className={symbolSizeClasses[size]} />
      <span className={`font-bold text-foreground ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : 'text-base'}`}>
        talent<span className="text-blue-600">Xcel</span>
      </span>
    </div>
  );
};