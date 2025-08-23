import React from 'react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { useMobileDetection } from '@/hooks/useMobileDetection';

const MobileLayoutContext = React.createContext(false);

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
  const isNested = React.useContext(MobileLayoutContext);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MobileLayoutContext.Provider value={true}>
      <div className={cn(
        "mobile-layout relative",
        fullHeight && "min-h-screen",
        showBottomNav && !isNested && "pb-20", // Account for bottom navigation when not nested
        className
      )}>
        {/* Mobile Header */}
        {!isNested && <MobileHeader />}
        
      {/* Mobile Content */}
      <div className="mobile-content pt-0">
        {children}
      </div>
        
        {showBottomNav && !isNested && <MobileBottomNav />}
        
        {/* Safe area padding is handled via CSS classes */}
      </div>
    </MobileLayoutContext.Provider>
  );
};