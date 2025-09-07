import React from 'react';
import { DeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface TabletLayoutProps {
  children: React.ReactNode;
  capabilities: DeviceCapabilities;
}

export const TabletLayout: React.FC<TabletLayoutProps> = ({ children, capabilities }) => {
  return (
    <div 
      className={`
        min-h-screen bg-background
        ${capabilities.isNative ? 'safe-area-inset' : ''}
        ${capabilities.orientation === 'portrait' ? 'tablet-portrait' : 'tablet-landscape'}
      `}
      style={{
        // Native app adjustments
        paddingTop: capabilities.isNative ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: capabilities.isNative ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: capabilities.isNative ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: capabilities.isNative ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {/* Tablet-optimized layout */}
      <div className={`
        h-full
        ${capabilities.orientation === 'portrait' 
          ? 'flex flex-col max-w-2xl mx-auto' 
          : 'flex flex-row'
        }
        ${capabilities.hasTouch ? 'touch-optimized tablet-touch' : 'tablet-cursor'}
      `}>
        {capabilities.orientation === 'landscape' ? (
          // Landscape: Side-by-side layout
          <>
            <div className="w-1/3 border-r bg-muted/30">
              {/* Sidebar content for landscape */}
            </div>
            <div className="flex-1">
              {children}
            </div>
          </>
        ) : (
          // Portrait: Stacked layout with larger content area
          <div className="flex-1 px-4">
            {children}
          </div>
        )}
      </div>

      {/* Tablet-specific action areas */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {/* Tablet-sized floating actions */}
        </div>
      </div>
    </div>
  );
};