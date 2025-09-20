
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';
import { NewsLatestWidget } from '@/components/news/NewsLatestWidget';

export const LandingPage = () => {
  console.log('LandingPage rendering');
  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <FeaturesSection />
      <SEOJobCategories />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CTABanner />
          </div>
          <div className="lg:col-span-1">
            <NewsLatestWidget />
          </div>
        </div>
      </div>
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
