import React from 'react';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  haptic?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  haptic = true,
  ...props
}) => {
  const handleTouch = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const variantClasses = {
    default: 'bg-background border border-border hover:bg-accent',
    primary: 'bg-gradient-brand text-white hover:shadow-brand shadow-lg',
    ghost: 'hover:bg-gradient-brand-soft',
    floating: 'bg-card shadow-float hover:shadow-elegant border border-border/50'
  };

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm min-w-[44px]', // iOS minimum tap target
    md: 'h-12 px-6 text-base min-w-[48px]',
    lg: 'h-14 px-8 text-lg min-w-[52px]',
    xl: 'h-16 px-10 text-xl min-w-[56px]'
  };

  return (
    <button
      className={cn(
        'rounded-xl font-medium transition-all duration-300 transform',
        'active:scale-95 hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'select-none touch-manipulation', // Optimize for touch
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onTouchStart={handleTouch}
      {...props}
    >
      {children}
    </button>
  );
};

export default TouchButton;