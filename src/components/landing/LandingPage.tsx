
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppleHeroSection } from './AppleHeroSection';
import { FeaturesSection } from './FeaturesSection';
import { WhyTalentXcel } from './WhyTalentXcel';
import { CTABanner } from './CTABanner';
import { SEOJobCategories } from '@/components/seo/SEOJobCategories';
import { SEOLandingPageLinks } from '@/components/seo/SEOLandingPageLinks';
import { ChatrServiceSection } from './ChatrServiceSection';
import { LandingFooter } from './LandingFooter';

// Lazy load news widget for faster initial load
const NewsLatestWidget = React.lazy(() => 
  import('@/components/news/NewsLatestWidget').then(module => ({ default: module.NewsLatestWidget }))
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>TalentXcel — AI Career Platform for Jobs, Resumes, Colleges & Skills</title>
        <meta name="description" content="Careers, Designed — Not Discovered. Search verified jobs, build ATS-ready executive resumes, explore 10,250+ Indian colleges, and master high-income skills on TalentXcel." />
        <link rel="canonical" href="https://talentxcel.in/" />
        <meta property="og:title" content="TalentXcel — AI Career Platform for Jobs, Resumes, Colleges & Skills" />
        <meta property="og:description" content="Careers, Designed — Not Discovered. Search verified jobs, build ATS-ready executive resumes, explore 10,250+ Indian colleges, and master high-income skills on TalentXcel." />
        <meta property="og:url" content="https://talentxcel.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentXcel — AI Career Platform for Jobs, Resumes, Colleges & Skills" />
        <meta name="twitter:description" content="Careers, Designed — Not Discovered. Search verified jobs, build ATS-ready executive resumes, explore 10,250+ Indian colleges, and master skills." />
        <meta name="twitter:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
      </Helmet>
      <AppleHeroSection />
      <FeaturesSection />
      <ChatrServiceSection />
      <SEOJobCategories />
      <SEOLandingPageLinks />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CTABanner />
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={
              <div className="bg-card rounded-lg p-4 h-48 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <NewsLatestWidget />
            </Suspense>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};
