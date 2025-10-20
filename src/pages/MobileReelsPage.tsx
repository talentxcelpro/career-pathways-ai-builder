import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const MobileReelsLazy = React.lazy(() => 
  import('@/pages/mobile/MobileReels').then(module => ({
    default: module.MobileReels
  })).catch(error => {
    console.error('Failed to load MobileReels:', error);
    return {
      default: () => (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Unable to load Reels</h2>
            <p className="text-white/70">Please try refreshing the page</p>
          </div>
        </div>
      )
    };
  })
);

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white/70 text-sm">Loading Reels...</p>
    </div>
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-white/70 mb-4">{error?.message || 'Failed to load content'}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const MobileReelsPage = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <MobileReelsLazy />
      </Suspense>
    </ErrorBoundary>
  );
};

export default MobileReelsPage;