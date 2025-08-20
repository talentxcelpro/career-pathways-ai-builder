
import React from 'react';
import { TalentXcelNavigation } from './TalentXcelNavigation';
import { TalentXcelHero } from './TalentXcelHero';
import { JobCategoriesSection } from './JobCategoriesSection';
import { ComprehensiveFooter } from './ComprehensiveFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <TalentXcelNavigation />
      <TalentXcelHero />
      <JobCategoriesSection />
      <ComprehensiveFooter />
    </div>
  );
};
