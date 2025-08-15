import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { MobileLayout } from './MobileLayout';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

export const MobileAppWrapper: React.FC<MobileAppWrapperProps> = ({ children }) => {
  const { isMobile } = useMobileDetection();
  const { user } = useAuth();

  // If it's mobile and user is authenticated, use the mobile app layout
  if (isMobile && user) {
    return (
      <MobileLayout showBottomNav={true} fullHeight={true}>
        {children}
      </MobileLayout>
    );
  }

  // For desktop or non-authenticated mobile users, use default layout
  return <>{children}</>;
};