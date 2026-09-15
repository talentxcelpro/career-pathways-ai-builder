import React from 'react';
import JobMatchGPT from '@/components/ai/JobMatchGPT';
import { Helmet } from 'react-helmet-async';

const JobMatchGPTPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Precision Match - Intelligence Identity Analysis | TalentXcel</title>
        <meta name="description" content="Get Intelligence-driven identity analysis and high-fidelity matching. Upload your professional identity for instant feedback, ATS synchronization, and personalized Tactical Moves." />
        <meta name="keywords" content="TalentXcel Precision Match, identity analysis, job matching, ATS synchronization, intelligence synchronicity, identity enhancement, Tactical Moves" />
        <link rel="canonical" href="https://talentxcel.in/precision-match" />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content="TalentXcel Precision Match - Professional Identity Analysis" />
        <meta property="og:description" content="Upload your identity for high-fidelity analysis, ATS synchronization, and intelligence matching with personalized Tactical Moves." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/precision-match" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentXcel Precision Match - Identity Analysis & Intelligence Matching" />
        <meta name="twitter:description" content="Get Intelligence-driven identity analysis and high-fidelity matching with personalized Tactical Moves." />
        
        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TalentXcel Precision Match",
            "description": "Intelligence-driven professional identity analysis and high-fidelity matching platform",
            "url": "https://talentxcel.in/precision-match",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Precision Identity Analysis",
              "ATS Synchronization Engine", 
              "Intelligence Job Matching",
              "Performance Sync",
              "Capability Gap Analysis",
              "Ecosystem Indexing"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl mb-8">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-apple-heavy text-blue-600 uppercase tracking-widest">Intelligence Match Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-apple-heavy text-slate-950 tracking-tighter mb-6 leading-none">
              Precision <br /> <span className="text-blue-600">Match</span> Engine
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-apple-medium leading-relaxed">
              Upload your professional identity and let our AI architect your next evolution with 
              high-fidelity matching and real-time ecosystem indexing.
            </p>
          </div>
          <div className="rounded-[48px] border border-slate-200 bg-white/40 backdrop-blur-2xl p-1 shadow-2xl overflow-hidden">
            <JobMatchGPT />
          </div>
        </div>
      </div>
    </>
  );
};

export default JobMatchGPTPage;
