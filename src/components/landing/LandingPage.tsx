
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOInternalLinks } from '@/components/seo/SEOInternalLinks';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <WhyTalentXcel />
      <SEOInternalLinks />
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
