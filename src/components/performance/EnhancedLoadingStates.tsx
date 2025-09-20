import React, { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Enhanced skeleton for network posts
export const NetworkPostSkeleton = memo(() => (
  <Card className="bg-card border shadow-sm rounded-xl p-6 animate-pulse">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-6 h-6 rounded" />
    </div>
    
    <div className="mt-4 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Media placeholder */}
    <Skeleton className="h-64 w-full mt-4 rounded-lg" />
    
    {/* Action buttons */}
    <div className="flex items-center justify-between mt-4">
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </Card>
));

// Enhanced skeleton for reels
export const ReelsSkeleton = memo(() => (
  <div className="relative w-full h-screen bg-black animate-pulse">
    {/* Video placeholder */}
    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
    
    {/* Profile section skeleton */}
    <div className="absolute bottom-20 left-4 space-y-3">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 bg-white/20" />
          <Skeleton className="h-3 w-20 bg-white/20" />
        </div>
      </div>
      
      {/* Caption skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-64 bg-white/20" />
        <Skeleton className="h-3 w-48 bg-white/20" />
      </div>
    </div>
    
    {/* Action buttons skeleton */}
    <div className="absolute bottom-20 right-4 space-y-4">
      <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
      <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
      <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
      <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
    </div>
  </div>
));

// Enhanced skeleton for connections
export const ConnectionSkeleton = memo(() => (
  <Card className="bg-card border shadow-sm rounded-xl p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
    
    <div className="flex space-x-2 mt-4">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
  </Card>
));

// Grid of loading skeletons
export const NetworkFeedLoadingGrid = memo(({ count = 6 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <NetworkPostSkeleton key={i} />
    ))}
  </div>
));

export const ConnectionsLoadingGrid = memo(({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ConnectionSkeleton key={i} />
    ))}
  </div>
));

// Progressive loading component
export const ProgressiveLoader = memo(({
  isLoading,
  loadingComponent,
  children,
  enableFadeIn = true
}: {
  isLoading: boolean;
  loadingComponent: React.ReactNode;
  children: React.ReactNode;
  enableFadeIn?: boolean;
}) => {
  if (isLoading) return <>{loadingComponent}</>;
  
  return (
    <div className={enableFadeIn ? 'animate-fade-in' : ''}>
      {children}
    </div>
  );
});

NetworkPostSkeleton.displayName = 'NetworkPostSkeleton';
ReelsSkeleton.displayName = 'ReelsSkeleton';
ConnectionSkeleton.displayName = 'ConnectionSkeleton';
NetworkFeedLoadingGrid.displayName = 'NetworkFeedLoadingGrid';
ConnectionsLoadingGrid.displayName = 'ConnectionsLoadingGrid';
ProgressiveLoader.displayName = 'ProgressiveLoader';