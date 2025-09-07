
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <FeaturesSection />
      <SEOJobCategories />
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
