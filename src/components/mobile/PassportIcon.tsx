import React from 'react';
import { cn } from '@/lib/utils';

interface PassportIconProps {
  className?: string;
  isActive?: boolean;
}

export const PassportIcon: React.FC<PassportIconProps> = ({ className, isActive }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className={cn(
          "w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-200",
          isActive 
            ? "bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg" 
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
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>
      </div>
    </div>
  );
};