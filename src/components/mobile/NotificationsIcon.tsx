import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationsIconProps {
  className?: string;
  isActive?: boolean;
}

export const NotificationsIcon: React.FC<NotificationsIconProps> = ({ className, isActive }) => {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className={cn(
          "w-6 h-6 rounded-2xl flex items-center justify-center transition-all duration-200",
          isActive 
            ? "bg-gradient-to-br from-yellow-600 to-orange-500 shadow-lg" 
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="m13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>
    </div>
  );
};