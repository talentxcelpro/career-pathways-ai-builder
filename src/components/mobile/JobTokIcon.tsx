import React from 'react';
import { cn } from '@/lib/utils';

interface JobTokIconProps {
  className?: string;
  isActive?: boolean;
}

export const JobTokIcon: React.FC<JobTokIconProps> = ({ className, isActive }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className={cn(
          "w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-200",
          isActive 
            ? "bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg" 
            : "bg-gradient-to-br from-gray-400 to-gray-500"
        )}>
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white"
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </div>
      </div>
    </div>
  );
};