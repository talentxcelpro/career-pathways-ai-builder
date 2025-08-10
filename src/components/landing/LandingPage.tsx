
import React from 'react';
import { HeroSection } from './HeroSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOInternalLinks } from '@/components/seo/SEOInternalLinks';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhyTalentXcel />
      <SEOInternalLinks />
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
