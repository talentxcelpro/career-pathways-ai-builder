import React, { Suspense, lazy, memo, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Global performance wrapper for all pages
interface GlobalPerformanceOptimizerProps {
  children: React.ReactNode;
  enableVirtualization?: boolean;
  preloadCritical?: boolean;
}

const GlobalFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
));

const GlobalErrorFallback = memo(({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-8">
    <div className="max-w-md w-full text-center space-y-4">
      <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">We're sorry, but something unexpected happened.</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
));

export const GlobalPerformanceOptimizer = memo<GlobalPerformanceOptimizerProps>(({
  children,
  enableVirtualization = true,
  preloadCritical = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fast initial render
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Preload critical resources
    if (preloadCritical) {
      // Preload fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
      fontPreload.as = 'style';
      document.head.appendChild(fontPreload);

      // Preconnect to external services
      const preconnects = [
        'https://api.supabase.co',
        'https://www.google-analytics.com'
      ];

      preconnects.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        document.head.appendChild(link);
      });
    }

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [preloadCritical]);

  if (!isVisible) {
    return <GlobalFallback />;
  }

  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <Suspense fallback={<GlobalFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

GlobalPerformanceOptimizer.displayName = 'GlobalPerformanceOptimizer';