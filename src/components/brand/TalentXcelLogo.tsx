import React from 'react';
import { cn } from '@/lib/utils';

interface TalentXcelLogoProps {
  className?: string;
  showText?: boolean;
}

export const TalentXcelLogo: React.FC<TalentXcelLogoProps> = ({ 
  className = "h-8 w-8", 
  showText = false 
}) => {
  return (
    <div className={cn("flex items-center gap-2", showText ? undefined : className)}>
      <img
        src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png"
        alt="TalentXcel"
        className={cn("shrink-0 object-contain", showText ? className : "h-full w-full")}
        loading="eager"
        decoding="async"
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight">
            TalentXcel
          </span>
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-tighter leading-none mt-0.5">
            Pro Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
