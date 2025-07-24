
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';

import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <WhyTalentXcel />
      
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
