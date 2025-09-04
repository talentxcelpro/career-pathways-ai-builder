import React from 'react';
import { PublicToolsNav } from '@/components/layout/PublicToolsNav';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Helmet } from 'react-helmet-async';

const PublicTools: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Free Career Tools | TalentXcel</title>
        <meta name="description" content="Access powerful career tools for free. Build resumes, search jobs, get career insights, and prepare for interviews without signing up." />
        <meta name="keywords" content="free career tools, resume builder, job search, interview prep, career guidance" />
        <link rel="canonical" href="https://talentxcel.in/public-tools" />
      </Helmet>
      <PublicToolsNav />
      <OnboardingFlow />
    </>
  );
};

export default PublicTools;