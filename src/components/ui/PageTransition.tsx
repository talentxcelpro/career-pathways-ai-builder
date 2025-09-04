import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variant = 'fade',
  duration = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const variantClasses = {
    fade: isVisible ? 'animate-page-enter' : 'opacity-0',
    slide: isVisible ? 'animate-slide-in-right' : 'translate-x-full opacity-0',
    scale: isVisible ? 'animate-scale-in' : 'scale-95 opacity-0'
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        variantClasses[variant],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export const StaggeredChildren: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 100, className }) => {
  return (
    <div className={cn('stagger-children', className)}>
      {children}
    </div>
  );
};