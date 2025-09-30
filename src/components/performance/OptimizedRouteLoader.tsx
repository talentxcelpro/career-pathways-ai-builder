import React, { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced loading skeleton for route transitions
const RouteLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-12 w-3/4" />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

// Optimized lazy loader with better error handling
export const createOptimizedRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback: React.ReactNode = <RouteLoadingSkeleton />
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

// Minimal loading for fast transitions
export const MinimalLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Page-specific loading skeletons
export const DashboardLoader: React.FC = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-16 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

export const JobsLoader: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-12 w-64 mb-6" />
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileLoader: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-start gap-6 mb-8">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);
