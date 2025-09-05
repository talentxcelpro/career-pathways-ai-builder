import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { MobileLayout } from './MobileLayout';

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

export const MobileAppWrapper: React.FC<MobileAppWrapperProps> = ({ children }) => {
  const { isMobile } = useMobileDetection();
  
  // Check if we're in auth context safely
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user;
  } catch (error) {
    // Not in auth context yet, user remains null
    console.log('Auth context not available:', error.message);
  }

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