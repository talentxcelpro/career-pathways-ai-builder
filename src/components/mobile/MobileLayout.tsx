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
        "mobile-layout relative safe-area-padding animate-fade-in",
        fullHeight && "min-h-screen",
        showBottomNav && !isNested && "pb-20 safe-area-padding-bottom", // Enhanced safe area support
        className
      )}>
        {/* Mobile Header */}
        {!isNested && <MobileHeader />}
        
        {/* Mobile Content */}
        <div className="mobile-content pt-0 gpu-accelerated">
          {children}
        </div>
          
        {showBottomNav && !isNested && <MobileBottomNav />}
        
        {/* PWA Install Prompt */}
        {!isNested && <PWAPrompt />}
        
        {/* Enhanced Offline indicator */}
        {!isOnline && !isNested && (
          <div className="fixed top-16 left-4 right-4 z-40 animate-slide-in-down">
            <div className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground text-center py-3 px-4 rounded-xl text-sm font-medium shadow-elegant backdrop-blur-apple">
              📡 You're offline. Some features may not work.
            </div>
          </div>
        )}
      </div>
    </MobileLayoutContext.Provider>
  );
};