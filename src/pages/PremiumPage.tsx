import React from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { PremiumStore } from '@/components/premium/PremiumStore';
import { PremiumMobileExperience } from '@/components/mobile/PremiumMobileExperience';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const PremiumPage: React.FC = () => {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    return (
      <MobileLayout>
        <PremiumMobileExperience />
      </MobileLayout>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PremiumStore />
    </div>
  );
};