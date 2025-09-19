import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/80 to-muted bg-[length:200%_100%]";
  
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-sm h-4"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{ 
              width: index === lines - 1 ? '75%' : width,
              height: height 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const JobCardSkeleton: React.FC = () => (
  <div className="p-6 bg-card rounded-lg border space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton variant="circular" className="w-12 h-12" />
    </div>
    <Skeleton variant="text" lines={3} />
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="p-6 bg-card rounded-lg border space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="w-16 h-16" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton variant="text" lines={2} />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

export const PostSkeleton: React.FC = () => (
  <div className="p-6 bg-card rounded-lg border space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-1 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton variant="text" lines={4} />
    <Skeleton className="h-48 w-full rounded-md" />
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-6 bg-card rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton variant="circular" className="w-8 h-8" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProfileCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  </div>
);