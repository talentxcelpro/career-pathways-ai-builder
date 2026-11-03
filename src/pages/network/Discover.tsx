import React from 'react';
import { CareerContentHub } from '@/components/social/CareerContentHub';
import { SEOHead } from '@/components/seo/SEOHead';

interface DiscoverProps {
  isEmbedded?: boolean;
}

export const Discover: React.FC<DiscoverProps> = ({ isEmbedded = false }) => {
  if (isEmbedded) {
    return <CareerContentHub />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 py-4 px-3 sm:px-6">
      <SEOHead 
        title="Discover Career Insights & Articles · TalentXcel"
        description="Share your expertise, discover career insights, and grow with a community of professionals on TalentXcel."
        canonical="https://talentxcel.in/network/discover"
      />
      <div className="max-w-7xl mx-auto">
        <CareerContentHub />
      </div>
    </div>
  );
};

export default Discover;
