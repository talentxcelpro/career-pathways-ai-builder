import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { ErrorBoundary } from 'react-error-boundary';
import { MobileReels } from '@/pages/mobile/MobileReels';

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-white/70 mb-4">{error?.message || 'Failed to load content'}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const MobileReelsPage = () => {
  return (
    <>
      <SEOHead 
        title="Professional Career Content & Reels | TalentXcel" 
        description="Watch short-form professional career content, industry insights, and interview tips on TalentXcel Reels." 
        canonical="https://talentxcel.in/reels" 
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MobileReels />
      </ErrorBoundary>
    </>
  );
};

export default MobileReelsPage;
