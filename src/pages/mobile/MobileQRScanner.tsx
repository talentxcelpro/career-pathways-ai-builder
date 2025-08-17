import React from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { LinkedInMobileHeader } from '@/components/mobile/LinkedInMobileHeader';

export const MobileQRScanner: React.FC = () => {
  return (
    <MobileLayout>
      <LinkedInMobileHeader />
      <main className="p-4">
        <h1 className="text-lg font-semibold">QR Scanner</h1>
        <p className="text-sm text-muted-foreground mt-2">Scan feature coming soon.</p>
      </main>
    </MobileLayout>
  );
};

export default MobileQRScanner;
