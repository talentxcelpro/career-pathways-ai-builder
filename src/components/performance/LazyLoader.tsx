import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyVideoPlayer = lazy(() => import('@/components/posts/VideoPlayer'));
export const LazyReelsUploadModal = lazy(() => import('@/components/mobile/ReelsUploadModal').then(m => ({ default: m.ReelsUploadModal })));
export const LazyReelsCommentsModal = lazy(() => import('@/components/mobile/ReelsCommentsModal').then(m => ({ default: m.ReelsCommentsModal })));

// Loading components
export const VideoPlayerSkeleton = () => (
  <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse rounded-lg" />
);

export const ModalSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// HOC for lazy loading with fallback
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType = () => <div>Loading...</div>
) => {
  return (props: P) => (
    <Suspense fallback={<FallbackComponent />}>
      <Component {...props} />
    </Suspense>
  );
};

// Preload components on idle
export const preloadComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload video player
      import('@/components/posts/VideoPlayer');
      
      // Preload modals
      import('@/components/mobile/ReelsUploadModal');
      import('@/components/mobile/ReelsCommentsModal');
    });
  }
};