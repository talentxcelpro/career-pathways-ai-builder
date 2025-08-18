import React from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import CareerPassportDashboard from '@/pages/passport/CareerPassportDashboard';

export const MobilePassport: React.FC = () => {
  return (
    <MobileLayout>
      {/* Reuse desktop dashboard inside mobile layout */}
      <CareerPassportDashboard />
    </MobileLayout>
  );
};

export default MobilePassport;
