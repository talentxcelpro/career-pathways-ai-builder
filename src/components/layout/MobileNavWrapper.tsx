import React from 'react';
import { PageSpecificBottomNav } from '@/components/navigation/PageSpecificBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileNavWrapperProps {
  children: React.ReactNode;
  disableBottomNav?: boolean;
}

export const MobileNavWrapper: React.FC<MobileNavWrapperProps> = ({ 
  children, 
  disableBottomNav = false 
}) => {
  const isMobile = useIsMobile();
  
  console.log('MobileNavWrapper - isMobile:', isMobile, 'disableBottomNav:', disableBottomNav);

  return (
    <>
      {children}
      {/* Add bottom padding to prevent content from being hidden behind nav */}
      {isMobile && !disableBottomNav && (
        <div className="h-20" /> // Spacer for bottom navigation
      )}
      {!disableBottomNav && <PageSpecificBottomNav />}
    </>
  );
};