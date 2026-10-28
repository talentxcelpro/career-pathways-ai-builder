import React, { Suspense, lazy } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/config/seo';
import { AppleHeroSection } from './AppleHeroSection';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { SEOLandingPageLinks } from '@/components/seo/SEOLandingPageLinks';
import { LandingFooter } from './LandingFooter';
import { AboutTalentXcelSEO } from './AboutTalentXcelSEO';

// Below-the-fold sections lazy loaded to optimize mobile LCP & JS execution time
const FeaturesSection = lazy(() => import('./FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const ProductVideoSection = lazy(() => import('./ProductVideoSection').then(m => ({ default: m.ProductVideoSection })));
const ChatrServiceSection = lazy(() => import('./ChatrServiceSection').then(m => ({ default: m.ChatrServiceSection })));
const CTABanner = lazy(() => import('./CTABanner').then(m => ({ default: m.CTABanner })));
const NewsLatestWidget = lazy(() => 
  import('@/components/news/NewsLatestWidget').then(module => ({ default: module.NewsLatestWidget }))
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <SEOHead title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} canonical="https://talentxcel.in/" type="website" />
      <AppleHeroSection />
      
      <Suspense fallback={null}>
        <FeaturesSection />
      </Suspense>
      
      <Suspense fallback={null}>
        <ProductVideoSection />
      </Suspense>
      
      <Suspense fallback={null}>
        <ChatrServiceSection />
      </Suspense>
      
      <SEOJobCategories />
      <SEOLandingPageLinks />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Suspense fallback={null}>
              <CTABanner />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={
              <div className="bg-card rounded-lg p-4 h-48 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <NewsLatestWidget />
            </Suspense>
          </div>
        </div>
      </div>
      
      <AboutTalentXcelSEO />
      <LandingFooter />
    </div>
  );
};
