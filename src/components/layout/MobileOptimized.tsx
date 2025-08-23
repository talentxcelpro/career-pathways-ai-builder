import React from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

export const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({
  children,
  className,
  enablePullToRefresh = false,
  onRefresh
}) => {
  return (
    <div 
      className={cn(
        // Mobile-first responsive container
        "w-full min-h-screen",
        // iPhone safe areas
        "pb-safe-bottom pt-safe-top",
        // Touch optimizations
        "touch-pan-y overscroll-contain",
        // Performance optimizations
        "will-change-scroll transform-gpu",
        className
      )}
      style={{
        // iOS momentum scrolling
        WebkitOverflowScrolling: 'touch',
        // Hardware acceleration
        transform: 'translateZ(0)',
        // Prevent iOS rubber band
        overscrollBehavior: 'contain'
      }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

interface ResponsiveImageWrapperProps {
  children: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide';
  className?: string;
}

export const ResponsiveImageWrapper: React.FC<ResponsiveImageWrapperProps> = ({
  children,
  aspectRatio = 'photo',
  className
}) => {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'wide': return 'aspect-[21/9]';
      case 'photo': 
      default: return 'aspect-[4/3]';
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg",
        getAspectClass(),
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 3: return 'grid-cols-2 sm:grid-cols-3';
      case 2:
      default: return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'lg': return 'gap-6';
      case 'md':
      default: return 'gap-4';
    }
  };

  return (
    <div 
      className={cn(
        "grid",
        getGridClass(),
        getGapClass(),
        className
      )}
    >
      {children}
    </div>
  );
};