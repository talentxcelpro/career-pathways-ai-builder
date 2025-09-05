import React, { useEffect } from 'react';

export const MobileJobs: React.FC = () => {
  useEffect(() => {
    // Redirect to external jobs URL
    window.location.href = 'https://talentxcel.in/mobile/jobs';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to Jobs...</p>
      </div>
    </div>
  );
};