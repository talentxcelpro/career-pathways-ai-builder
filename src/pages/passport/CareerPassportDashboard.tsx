import React from 'react';
import PassportOverview from './sections/PassportOverview';
import { ProfileSidebarNav } from '@/components/navigation/ProfileSidebarNav';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { PassportAcquisitionLanding } from './components/PassportAcquisitionLanding';
import { SEOHead } from '@/components/seo/SEOHead';

/**
 * Universal Career Passport Dashboard
 * - Unauthenticated visitors: high-converting public landing page explaining Career Passport
 * - Authenticated users: private passport management dashboard (protected with noindex, nofollow)
 */
export const CareerPassportDashboard: React.FC = () => {
  const { user, loading } = useOptimizedAuth();

  // If loading auth state, render minimal clean skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/30"></div>
          <p className="text-sm">Loading Career Passport...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated visitor lands on root passport path, show public acquisition landing
  if (!user) {
    return <PassportAcquisitionLanding />;
  }

  // Authenticated user: Render private Career Passport workspace
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <SEOHead 
        title="Career Passport Workspace | TalentXcel" 
        description="Manage your Career Passport, verified credentials, and professional identity."
        noIndex={true}
      />
      <div className="max-w-7xl mx-auto flex items-start">
        <ProfileSidebarNav />
        <div className="flex-1 min-w-0 px-4 md:px-6 py-6">
          <PassportOverview />
        </div>
      </div>
    </div>
  );
};

export default CareerPassportDashboard;
