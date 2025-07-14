import React from 'react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from './MobileBottomNav';
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
      "mobile-layout",
      fullHeight && "min-h-screen",
      showBottomNav && "pb-20", // Account for bottom navigation
      className
    )}>
      <div className="mobile-content">
        {children}
      </div>
      
      {showBottomNav && <MobileBottomNav />}
      
      {/* Safe area padding is handled via CSS classes */}
    </div>
  );
};