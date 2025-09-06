import React from 'react';
import { cn } from '@/lib/utils';

interface JobsIconProps {
  className?: string;
  isActive?: boolean;
}

export const JobsIcon: React.FC<JobsIconProps> = ({ className, isActive }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className={cn(
          "w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-200",
          isActive 
            ? "bg-gradient-to-br from-orange-600 to-red-500 shadow-lg" 
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
            <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z" />
            <path d="M8 5v2" />
            <path d="M16 5v2" />
            <path d="M12 11h4" />
          </svg>
        </div>
      </div>
    </div>
  );
};