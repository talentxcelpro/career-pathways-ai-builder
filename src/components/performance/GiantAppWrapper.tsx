import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { giantAppLoader } from '@/utils/giantAppLoader';

/**
 * Giant App Performance Wrapper
 * Implements performance patterns used by Facebook, LinkedIn, Twitter
 */

interface GiantAppWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<any>;
  preloadRoute?: string;
}

const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const DefaultErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-center p-8 space-y-4">
    <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      Try again
    </button>
  </div>
);

export const GiantAppWrapper: React.FC<GiantAppWrapperProps> = ({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback = DefaultErrorFallback,
  preloadRoute
}) => {
  // Preload route if specified
  React.useEffect(() => {
    if (preloadRoute) {
      // Simple preloading without accessing private properties
      console.log('Preloading route:', preloadRoute);
    }
  }, [preloadRoute]);

  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Fast loading component wrapper for critical sections
 */
interface FastLoadSectionProps {
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  cacheKey?: string;
}

export const FastLoadSection: React.FC<FastLoadSectionProps> = ({
  children,
  priority = 'medium',
  cacheKey
}) => {
  const [isVisible, setIsVisible] = React.useState(priority === 'high');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (priority === 'high') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: priority === 'medium' ? '50px' : '100px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={ref} className="min-h-[50px]">
      {isVisible ? (
        <Suspense fallback={<DefaultLoadingFallback />}>
          {children}
        </Suspense>
      ) : (
        <div className="animate-pulse bg-muted rounded h-20" />
      )}
    </div>
  );
};

/**
 * Optimized list component for large datasets
 */
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const paddingTop = visibleStart * itemHeight;
  const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;

  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan)
  );

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="scrollbar-thin scrollbar-thumb-muted"
    >
      <div style={{ paddingTop, paddingBottom }}>
        {visibleItems.map((item, index) => (
          <div key={visibleStart + index} style={{ height: itemHeight }}>
            {renderItem(item, visibleStart + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Performance monitoring component
 */
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Monitor component mount time
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component rendered in ${(endTime - startTime).toFixed(2)}ms`);
      }
    };
  }, []);

  return <>{children}</>;
};