import React, { Suspense, lazy, ComponentType } from 'react';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  enableIntersection?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback = <SkeletonCard lines={4} />,
  enableIntersection = false,
  rootMargin = '100px',
  threshold = 0.1,
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin,
    threshold,
  });

  if (enableIntersection && !isIntersecting) {
    return (
      <div 
        ref={ref} 
        className="min-h-[200px] flex items-center justify-center"
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto',
          containIntrinsicSize: '100% 200px'
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div style={{ 
        contain: 'layout style paint',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {fallback}
      </div>
    }>
      <div 
        ref={ref}
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto'
        }}
      >
        {children}
      </div>
    </Suspense>
  );
};

// Higher-order component for creating lazy-loaded components
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={
      <div style={{ 
        contain: 'layout style paint',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        containIntrinsicSize: '100% 300px'
      }}>
        {fallback || <SkeletonCard />}
      </div>
    }>
      <div style={{ contain: 'layout style paint' }}>
        <LazyComponent {...props} ref={ref} />
      </div>
    </Suspense>
  ));
}

// Specific lazy components for heavy modules
export const LazyJobsComponent = createLazyComponent(
  () => import('@/pages/Jobs'),
  <div className="space-y-4">
    <SkeletonCard lines={2} />
    <SkeletonCard lines={3} />
    <SkeletonCard lines={2} />
  </div>
);

export const LazyNetworkComponent = createLazyComponent(
  () => import('@/pages/Network'),
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} lines={3} />
    ))}
  </div>
);

export const LazyProfileComponent = createLazyComponent(
  () => import('@/pages/Profile'),
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
      </div>
    </div>
    <SkeletonCard lines={4} />
  </div>
);

// Performance-aware component loader
export const PerformantLazyLoader: React.FC<{
  component: string;
  fallback?: React.ReactNode;
  delay?: number;
}> = ({ component, fallback, delay = 0 }) => {
  const [shouldLoad, setShouldLoad] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldLoad(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldLoad) {
    return <>{fallback || <SkeletonCard />}</>;
  }

  const componentMap: Record<string, React.ComponentType> = {
    jobs: LazyJobsComponent,
    network: LazyNetworkComponent,
    profile: LazyProfileComponent,
  };

  const Component = componentMap[component];
  
  if (!Component) {
    return <div>Component not found: {component}</div>;
  }

  return <Component />;
};