import React, { Suspense } from 'react';
import { StableContainer } from "@/utils/layoutOptimizer";
import { ErrorBoundary } from 'react-error-boundary';

// Chunk loading error fallback
const ChunkErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <StableContainer minHeight="100vh" className="flex items-center justify-center">
    <div className="text-center space-y-4 p-6">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-foreground">Loading Failed</h1>
      <p className="text-muted-foreground max-w-md">
        Failed to load page resources. This can happen due to network issues or outdated cache.
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => {
            // Clear relevant caches and retry
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
            resetErrorBoundary();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
        <button
          onClick={() => {
            // Navigate to home
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
        >
          Go Home
        </button>
      </div>
    </div>
  </StableContainer>
);

// Enhanced lazy imports with retry logic
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      
      // If it's a chunk loading error, try to reload the chunk
      if (error instanceof Error && (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk'))) {
        // Clear cache and retry once
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Retry the import
        try {
          return await importFn();
        } catch (retryError) {
          console.error(`Retry failed for ${componentName}:`, retryError);
          // Return a fallback component
          return {
            default: () => (
              <div className="p-8 text-center">
                <p>Failed to load {componentName}. Please refresh the page.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded">
                  Refresh Page
                </button>
              </div>
            )
          };
        }
      }
      
      throw error;
    }
  });
};

// Lazy load major route components with error handling
export const LazyJobs = createLazyComponent(() => import('@/pages/Jobs'), 'Jobs');
export const LazyNetwork = createLazyComponent(() => import('@/pages/Network'), 'Network');
export const LazyProfile = createLazyComponent(() => import('@/pages/Profile'), 'Profile');
export const LazyUserProfile = createLazyComponent(() => import('@/pages/UserProfile'), 'UserProfile');
export const LazyCompanyDetail = createLazyComponent(() => import('@/pages/companies/CompanyDetail'), 'CompanyDetail');

// Performance-optimized loading fallback
export const RouteLoadingFallback = ({ pageName }: { pageName: string }) => (
  <StableContainer minHeight="100vh" className="flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground">Loading {pageName}...</p>
    </div>
  </StableContainer>
);

// Wrapper components with optimized suspense and error boundaries
export const JobsPage = () => (
  <ErrorBoundary FallbackComponent={ChunkErrorFallback}>
    <Suspense fallback={<RouteLoadingFallback pageName="Jobs" />}>
      <LazyJobs />
    </Suspense>
  </ErrorBoundary>
);

export const NetworkPage = () => (
  <ErrorBoundary FallbackComponent={ChunkErrorFallback}>
    <Suspense fallback={<RouteLoadingFallback pageName="Network" />}>
      <LazyNetwork />
    </Suspense>
  </ErrorBoundary>
);

export const ProfilePage = () => (
  <ErrorBoundary FallbackComponent={ChunkErrorFallback}>
    <Suspense fallback={<RouteLoadingFallback pageName="Profile" />}>
      <LazyProfile />
    </Suspense>
  </ErrorBoundary>
);

export const UserProfilePage = () => (
  <ErrorBoundary FallbackComponent={ChunkErrorFallback}>
    <Suspense fallback={<RouteLoadingFallback pageName="User Profile" />}>
      <LazyUserProfile />
    </Suspense>
  </ErrorBoundary>
);

export const CompanyDetailPage = () => (
  <ErrorBoundary FallbackComponent={ChunkErrorFallback}>
    <Suspense fallback={<RouteLoadingFallback pageName="Company Details" />}>
      <LazyCompanyDetail />
    </Suspense>
  </ErrorBoundary>
);