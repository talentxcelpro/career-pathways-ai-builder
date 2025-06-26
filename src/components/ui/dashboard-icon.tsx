
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardIconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  className?: string;
  animated?: boolean;
}

export const DashboardIcon: React.FC<DashboardIconProps> = ({
  icon: Icon,
  size = 'xs',
  variant = 'neutral',
  className,
  animated = true
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const containerSizes = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    accent: 'text-green-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={cn(
      'rounded-lg shadow-sm transition-all duration-300',
      containerSizes[size],
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
