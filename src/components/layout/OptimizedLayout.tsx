import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  padded?: boolean;
  centered?: boolean;
}

export const OptimizedLayout = memo<OptimizedLayoutProps>(({
  children,
  className,
  fullHeight = true,
  padded = true,
  centered = false
}) => {
  return (
    <div 
      className={cn(
        'w-full',
        fullHeight && 'min-h-screen',
        padded && 'px-4 sm:px-6 lg:px-8',
        centered && 'flex items-center justify-center',
        className
      )}
      style={{
        contain: 'layout style',
        contentVisibility: 'auto'
      }}
    >
      {children}
    </div>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';