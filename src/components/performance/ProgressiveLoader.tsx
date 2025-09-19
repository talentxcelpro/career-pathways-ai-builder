import React, { lazy, Suspense, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Progressive loading wrapper with intelligent chunking
export const createProgressiveLoader = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFn);
  const FallbackComponent = fallback || (() => <Skeleton className="h-32 w-full" />);
  
  return memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Route-based progressive loading
export const ProgressiveRoute = memo<{
  component: React.ComponentType;
  loading?: React.ComponentType;
}>(({ component: Component, loading: Loading }) => {
  const LoadingComponent = Loading || (() => <Skeleton className="h-64 w-full" />);
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Component />
    </Suspense>
  );
});

// Component-level progressive loading with priority
export const ProgressiveComponent = memo<{
  priority: 'high' | 'medium' | 'low';
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentType;
}>(({ priority, loader, fallback: Fallback }) => {
  const LazyComponent = lazy(() => {
    // Add artificial delay for low priority components
    if (priority === 'low') {
      return new Promise<{ default: React.ComponentType<any> }>(resolve => {
        setTimeout(() => resolve(loader()), 100);
      });
    }
    return loader();
  });

  const FallbackComponent = Fallback || (() => <Skeleton className="h-32 w-full" />);

  return (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent />
    </Suspense>
  );
});

ProgressiveRoute.displayName = 'ProgressiveRoute';
ProgressiveComponent.displayName = 'ProgressiveComponent';