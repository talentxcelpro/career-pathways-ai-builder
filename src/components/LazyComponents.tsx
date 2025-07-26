import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyResumeBuilder = lazy(() => import('@/components/resume/ResumeBuilder'));
export const LazyAICareerCoPilot = lazy(() => import('@/components/ai/AICareerCoPilot'));
export const LazyRealTimeAnalytics = lazy(() => import('@/components/analytics/RealTimeAnalytics'));
export const LazyPlatformTestRunner = lazy(() => import('@/components/testing/PlatformTestRunner'));
export const LazyJobMatchingEngine = lazy(() => import('@/components/jobs/JobMatchingEngine'));

// Preload commonly used components
export const preloadComponents = () => {
  // Preload resume builder for authenticated users
  import('@/components/resume/ResumeBuilder');
  // Preload job matching for job seekers
  import('@/components/jobs/JobMatchingEngine');
};