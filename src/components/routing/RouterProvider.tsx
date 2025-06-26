
import { Suspense } from 'react';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { router } from '@/router';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

export const RouterProvider = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReactRouterProvider router={router} />
    </Suspense>
  );
};
