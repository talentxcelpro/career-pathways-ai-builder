import { lazy } from 'react';

// Lazy load existing components for better performance
export const LazyRealTimeAnalytics = lazy(() => 
  import('@/components/analytics/RealTimeAnalytics').then(module => ({ 
    default: module.RealTimeAnalytics 
  }))
);

export const LazyPlatformTestRunner = lazy(() => 
  import('@/components/testing/PlatformTestRunner').then(module => ({ 
    default: module.PlatformTestRunner 
  }))
);

// Preload commonly used components that exist
export const preloadComponents = () => {
  // Preload analytics for admin users
  import('@/components/analytics/RealTimeAnalytics');
  // Preload test runner for development
  import('@/components/testing/PlatformTestRunner');
};