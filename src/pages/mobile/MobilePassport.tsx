import React from 'react';
import { MobileCareerPassport } from '@/components/mobile/MobileCareerPassport';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import CareerPassportDashboard from '@/pages/passport/CareerPassportDashboard';

export const MobilePassport: React.FC = () => {
  const { isMobile } = useMobileDetection();

  // Use mobile-optimized version for mobile devices, desktop version for desktop
  if (isMobile) {
    return <MobileCareerPassport />;
  }

  // Fallback to desktop version for non-mobile devices
  return <CareerPassportDashboard />;
};

export default MobilePassport;
