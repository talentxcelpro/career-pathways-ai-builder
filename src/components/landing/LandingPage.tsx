import { Link } from 'react-router-dom';

import React, { Suspense } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/config/seo';
import { PLATFORM_METRICS } from '@/config/platformMetrics';
import { AppleHeroSection } from './AppleHeroSection';
import { FeaturesSection } from './FeaturesSection';
import { ProductVideoSection } from './ProductVideoSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { SEOLandingPageLinks } from '@/components/seo/SEOLandingPageLinks';
import { ChatrServiceSection } from './ChatrServiceSection';
import { LandingFooter } from './LandingFooter';
import { AboutTalentXcelSEO } from './AboutTalentXcelSEO';

// Lazy load news widget for faster initial load
const NewsLatestWidget = React.lazy(() => 
  import('@/components/news/NewsLatestWidget').then(module => ({ default: module.NewsLatestWidget }))
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* 12 Independent Businesses Ecosystem Access Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold py-2 px-4 shadow-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">TalentXcel Multi-Product Commercial Operating System:</span>
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">12 Businesses Online</span>
          </div>
          <Link 
            to="/local-testing-index" 
            className="inline-flex items-center gap-1 bg-white text-[#2563EB] hover:bg-white/90 text-xs font-bold px-3 py-1 rounded-lg shadow-2xs transition-all"
          >
            <span>Launch Local Testing Directory (12 Subdomains) →</span>
          </Link>
        </div>
      </div>
      <SEOHead title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} canonical="https://talentxcel.in/" type="website" />
      <AppleHeroSection />
      <FeaturesSection />
      <ProductVideoSection />
      <ChatrServiceSection />
      <SEOJobCategories />
      <SEOLandingPageLinks />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CTABanner />
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



