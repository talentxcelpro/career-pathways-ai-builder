import React from 'react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
  fullHeight?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
  className,
  fullHeight = false
}) => {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn(
      "mobile-layout relative",
      fullHeight && "min-h-screen",
      showBottomNav && "pb-20", // Account for bottom navigation
      className
    )}>
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Mobile Content */}
      <div className="mobile-content pt-0">
        {children}
      </div>
      
      {showBottomNav && <MobileBottomNav />}
      
      {/* Safe area padding is handled via CSS classes */}
    </div>
  );
};