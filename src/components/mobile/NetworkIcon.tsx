import React from 'react';
import { cn } from '@/lib/utils';

interface NetworkIconProps {
  className?: string;
  isActive?: boolean;
}

export const NetworkIcon: React.FC<NetworkIconProps> = ({ className, isActive }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className={cn(
          "w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-200",
          isActive 
            ? "bg-gradient-to-br from-blue-600 to-green-500 shadow-lg" 
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};