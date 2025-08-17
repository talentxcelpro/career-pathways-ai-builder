import React, { Suspense, lazy, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load components for code splitting
const LazyComponent = lazy(() => import('./LazyComponentWrapper'));

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<any>;
  enableSuspense?: boolean;
  enableErrorBoundary?: boolean;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
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

export const PerformanceOptimizer = memo<PerformanceOptimizerProps>(({
  children,
  fallback = <DefaultFallback />,
  errorFallback = DefaultErrorFallback,
  enableSuspense = true,
  enableErrorBoundary = true
}) => {
  let content = children;

  if (enableSuspense) {
    content = (
      <Suspense fallback={fallback}>
        {content}
      </Suspense>
    );
  }

  if (enableErrorBoundary) {
    content = (
      <ErrorBoundary FallbackComponent={errorFallback}>
        {content}
      </ErrorBoundary>
    );
  }

  return <>{content}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';