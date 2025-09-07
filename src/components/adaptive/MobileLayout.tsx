import React from 'react';
import { DeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface MobileLayoutProps {
  children: React.ReactNode;
  capabilities: DeviceCapabilities;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, capabilities }) => {
  return (
    <div 
      className={`
        min-h-screen bg-background
        ${capabilities.isNative ? 'safe-area-inset' : ''}
        ${capabilities.orientation === 'portrait' ? 'flex flex-col' : 'flex flex-row'}
      `}
      style={{
        // Native app adjustments
        paddingTop: capabilities.isNative ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: capabilities.isNative ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: capabilities.isNative ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: capabilities.isNative ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {/* Mobile-optimized container */}
      <div className="flex-1 overflow-hidden">
        <div className={`
          h-full 
          ${capabilities.hasTouch ? 'touch-optimized' : ''}
          ${capabilities.orientation === 'portrait' ? 'portrait-layout' : 'landscape-layout'}
        `}>
          {children}
        </div>
      </div>

      {/* Mobile-specific floating action button area */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Any floating actions will be rendered here */}
        </div>
      </div>
    </div>
  );
};