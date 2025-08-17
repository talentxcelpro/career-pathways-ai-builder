import React from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { LinkedInMobileHeader } from '@/components/mobile/LinkedInMobileHeader';

export const MobilePendingConnections: React.FC = () => {
  return (
    <MobileLayout>
      <LinkedInMobileHeader />
      <main className="p-4">
        <h1 className="text-lg font-semibold">Pending Connections</h1>
        <p className="text-sm text-muted-foreground mt-2">No pending requests right now.</p>
      </main>
    </MobileLayout>
  );
};

export default MobilePendingConnections;
