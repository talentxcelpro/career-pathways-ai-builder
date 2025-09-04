import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  animation?: 'bounce' | 'scale' | 'glow' | 'float' | 'rotate';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  animation,
  hoverEffect = 'scale',
  ...props
}) => {
  const animationClasses = {
    bounce: 'animate-bounce-in',
    scale: 'animate-scale-in',
    glow: 'animate-glow-pulse',
    float: 'animate-float',
    rotate: 'animate-rotate-scale'
  };

  const hoverClasses = {
    lift: 'hover:translate-y-[-2px] hover:shadow-elegant',
    glow: 'hover:shadow-glow hover:animate-glow-pulse',
    scale: 'hover:scale-105',
    none: ''
  };

  return (
    <Button
      className={cn(
        'transition-all duration-500 transform',
        animation && animationClasses[animation],
        hoverEffect && hoverClasses[hoverEffect],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};