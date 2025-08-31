import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'rectangular',
  lines = 1,
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = cn(
    'bg-muted',
    animation === 'pulse' ? 'animate-pulse' : 'skeleton',
    className
  );

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'rectangular':
        return 'rounded';
      case 'card':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, getVariantClasses())}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, getVariantClasses())}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const JobCardSkeleton: React.FC = () => (
  <div className="p-6 border rounded-lg space-y-4 layout-contain">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <SkeletonLoader variant="text" height="1.25rem" width="70%" />
        <SkeletonLoader variant="text" height="1rem" width="50%" />
      </div>
      <SkeletonLoader variant="circular" width="3rem" height="3rem" />
    </div>
    <SkeletonLoader variant="text" lines={3} />
    <div className="flex gap-2">
      <SkeletonLoader variant="rectangular" height="1.5rem" width="4rem" />
      <SkeletonLoader variant="rectangular" height="1.5rem" width="5rem" />
    </div>
  </div>
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="p-4 border rounded-lg space-y-4 layout-contain">
    <div className="flex items-center gap-3">
      <SkeletonLoader variant="circular" width="3rem" height="3rem" />
      <div className="space-y-2 flex-1">
        <SkeletonLoader variant="text" height="1.125rem" width="60%" />
        <SkeletonLoader variant="text" height="0.875rem" width="80%" />
      </div>
    </div>
    <SkeletonLoader variant="text" lines={2} />
    <div className="flex gap-2">
      <SkeletonLoader variant="rectangular" height="2rem" width="5rem" />
      <SkeletonLoader variant="rectangular" height="2rem" width="6rem" />
    </div>
  </div>
);

export const PostSkeleton: React.FC = () => (
  <div className="p-6 border rounded-lg space-y-4 layout-contain">
    <div className="flex items-center gap-3">
      <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
      <div className="space-y-1 flex-1">
        <SkeletonLoader variant="text" height="1rem" width="40%" />
        <SkeletonLoader variant="text" height="0.75rem" width="60%" />
      </div>
    </div>
    <SkeletonLoader variant="text" lines={4} />
    <SkeletonLoader variant="rectangular" height="12rem" className="rounded-lg" />
    <div className="flex items-center gap-4">
      <SkeletonLoader variant="rectangular" height="1.5rem" width="3rem" />
      <SkeletonLoader variant="rectangular" height="1.5rem" width="4rem" />
      <SkeletonLoader variant="rectangular" height="1.5rem" width="3rem" />
    </div>
  </div>
);

export const NavigationSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b layout-contain">
    <SkeletonLoader variant="rectangular" height="2rem" width="8rem" />
    <div className="flex gap-4">
      <SkeletonLoader variant="rectangular" height="1.5rem" width="4rem" />
      <SkeletonLoader variant="rectangular" height="1.5rem" width="4rem" />
      <SkeletonLoader variant="rectangular" height="1.5rem" width="4rem" />
    </div>
    <SkeletonLoader variant="circular" width="2rem" height="2rem" />
  </div>
);

export const GridSkeleton: React.FC<{ count?: number; variant?: 'job' | 'profile' | 'post' }> = ({ 
  count = 6, 
  variant = 'job' 
}) => {
  const SkeletonComponent = {
    job: JobCardSkeleton,
    profile: ProfileCardSkeleton,
    post: PostSkeleton,
  }[variant];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};