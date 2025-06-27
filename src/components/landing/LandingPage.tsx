
import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { StatsSection } from './StatsSection';
import { CTASection } from './CTASection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CTASection />
      </main>
    </div>
  );
};
