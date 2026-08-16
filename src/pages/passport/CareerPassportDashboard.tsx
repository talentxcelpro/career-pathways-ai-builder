import React from 'react';
import PassportOverview from './sections/PassportOverview';
import { ProfileSidebarNav } from '@/components/navigation/ProfileSidebarNav';

/**
 * Universal Career Passport Dashboard
 * Consistently renders the hyper-premium Career Passport Dashboard across all passport routes
 */
export const CareerPassportDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
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