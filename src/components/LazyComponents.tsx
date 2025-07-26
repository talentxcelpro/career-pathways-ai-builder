import { lazy } from 'react';

// 🔴 Fix #1: Aggressive lazy loading to reduce 1.1MB unused JS
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

// Additional lazy components for major savings (commenting out non-existent imports)
// export const LazyAICareerCoPilot = lazy(() => import('@/components/ai/AICareerCoPilot'));
// export const LazyResumeBuilder = lazy(() => import('@/components/resume/ResumeBuilder'));
// export const LazyJobMatchingEngine = lazy(() => import('@/components/jobs/JobMatchingEngine'));
export const LazyAdvancedChart = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
// export const LazyDataTable = lazy(() => import('@tanstack/react-table'));

// Critical resource preloading for LCP improvement
export const preloadCriticalResources = () => {
  // 🔴 Fix #3: Preload LCP images
  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.as = 'image';
  heroImageLink.href = '/hero-image.webp';
  document.head.appendChild(heroImageLink);

  // Preload critical fonts to prevent layout shift
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // 🔴 Fix #5: Preconnect to critical domains
  const preconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://dthlgsnakhoftinssokm.supabase.co'
  ];

  preconnects.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Preload commonly used components that exist
export const preloadComponents = () => {
  // Preload analytics for admin users
  import('@/components/analytics/RealTimeAnalytics');
  // Preload test runner for development
  import('@/components/testing/PlatformTestRunner');
  
  // Preload critical resources
  preloadCriticalResources();
};