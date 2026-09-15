import React from 'react';
import JobMatchGPT from '@/components/ai/JobMatchGPT';
import { Helmet } from 'react-helmet-async';

const JobMatchGPTPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Job Match GPT - AI Resume Analysis & Job Matching | TalentXcel</title>
        <meta name="description" content="Get AI-powered resume analysis and intelligent job matching. Upload your resume for instant feedback, ATS optimization, and personalized job recommendations." />
        <meta name="keywords" content="AI resume analysis, job matching, ATS optimization, career insights, resume enhancement, job recommendations" />
        <link rel="canonical" href="https://talentxcel.in/job-match-gpt" />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content="Job Match GPT - AI Resume Analysis & Job Matching" />
        <meta property="og:description" content="Upload your resume for AI-powered analysis, ATS optimization, and intelligent job matching with personalized recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/job-match-gpt" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Job Match GPT - AI Resume Analysis & Job Matching" />
        <meta name="twitter:description" content="Get AI-powered resume analysis and intelligent job matching with personalized recommendations." />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Job Match GPT",
            "description": "AI-powered resume analysis and job matching platform",
            "url": "https://talentxcel.in/job-match-gpt",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "AI Resume Analysis",
              "ATS Compatibility Check", 
              "Intelligent Job Matching",
              "Career Insights",
              "Skill Gap Analysis",
              "Salary Estimation"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <JobMatchGPT />
        </div>
      </div>
    </>
  );
};

export default JobMatchGPTPage;