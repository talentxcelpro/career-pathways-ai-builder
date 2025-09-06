
import React, { Suspense, lazy } from 'react';
import { AppleHeroSection } from './AppleHeroSection';

// Lazy load non-critical components for faster initial page load
const WhyTalentXcel = lazy(() => import('./WhyTalentXcel').then(m => ({ default: m.WhyTalentXcel })));
const CTABanner = lazy(() => import('./CTABanner').then(m => ({ default: m.CTABanner })));
const SEOJobCategories = lazy(() => import('@/components/seo/SEOJobCategories').then(m => ({ default: m.SEOJobCategories })));
const MobileAppPreview = lazy(() => import('./MobileAppPreview').then(m => ({ default: m.MobileAppPreview })));
const AppleFooter = lazy(() => import('./AppleFooter').then(m => ({ default: m.AppleFooter })));

// Minimal loading skeleton
const SectionSkeleton = () => (
  <div className="py-20 animate-pulse">
    <div className="max-w-7xl mx-auto px-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Critical above-the-fold content loads immediately */}
      <AppleHeroSection />
      
      {/* Non-critical content loads progressively */}
      <Suspense fallback={<SectionSkeleton />}>
        <WhyTalentXcel />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <SEOJobCategories />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <CTABanner />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <MobileAppPreview />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <AppleFooter />
      </Suspense>
    </div>
  );
};
