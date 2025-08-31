
import React from 'react';
import { AppleHeroSection } from './AppleHeroSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { MobileAppPreview } from './MobileAppPreview';
import { AppleFooter } from './AppleFooter';
import { AppInstallBanner } from '@/components/install/AppInstallBanner';
import { UniversalAppPrompt } from '@/components/install/UniversalAppPrompt';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <AppInstallBanner />
      <AppleHeroSection />
      <WhyTalentXcel />
      <SEOJobCategories />
      <CTABanner />
      <MobileAppPreview />
      <AppleFooter />
      <UniversalAppPrompt />
    </div>
  );
};
