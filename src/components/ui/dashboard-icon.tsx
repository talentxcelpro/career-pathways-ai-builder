
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  className?: string;
  animated?: boolean;
}

export const DashboardIcon: React.FC<DashboardIconProps> = ({
  icon: Icon,
  size = 'md',
  variant = 'neutral',
  className,
  animated = true
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    accent: 'text-green-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={cn(
      'p-3 rounded-xl shadow-sm transition-all duration-300',
      animated && 'hover:scale-105 hover:shadow-md',
      'bg-white/20 backdrop-blur-sm',
      className
    )}>
      <Icon 
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          'transition-colors duration-200'
        )}
        strokeWidth={1.5}
      />
    </div>
  );
};
