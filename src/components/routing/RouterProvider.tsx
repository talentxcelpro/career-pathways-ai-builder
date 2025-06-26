
import { Suspense } from 'react';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading application..." />
  </div>
);

export const RouterProvider = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReactRouterProvider router={router} />
    </Suspense>
  );
};
