import React from 'react';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { PWAPrompt } from './PWAPrompt';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useServiceWorker } from '@/hooks/useServiceWorker';

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
  const { isOnline } = useServiceWorker();

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
        
        {/* PWA Install Prompt */}
        {!isNested && <PWAPrompt />}
        
        {/* Offline indicator */}
        {!isOnline && !isNested && (
          <div className="fixed top-16 left-4 right-4 z-40">
            <div className="bg-yellow-500 text-white text-center py-2 px-4 rounded-lg text-sm">
              You're offline. Some features may not work.
            </div>
          </div>
        )}
        
        {/* Safe area padding is handled via CSS classes */}
      </div>
    </MobileLayoutContext.Provider>
  );
};