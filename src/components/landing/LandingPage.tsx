
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { TestimonialsSection } from './TestimonialsSection';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <AppleHeroSection />
      <WhyTalentXcel />
      <TestimonialsSection />
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
    </div>
  );
};
