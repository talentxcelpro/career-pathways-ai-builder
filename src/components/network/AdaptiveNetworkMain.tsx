import React from 'react';
import { AdaptiveLayout } from '@/components/adaptive/AdaptiveLayout';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

// Import existing network components
import { EnhancedMobileNetwork } from '@/components/mobile/EnhancedMobileNetwork';
import NetworkMain from '@/pages/Network';

// Mobile-optimized network component
const MobileNetworkComponent: React.FC = () => {
  return <EnhancedMobileNetwork />;
};

// Tablet-optimized network component
const TabletNetworkComponent: React.FC = () => {
  const capabilities = useDeviceCapabilities();
  
  return (
    <div className={`
      ${capabilities.orientation === 'portrait' ? 'tablet-portrait-network' : 'tablet-landscape-network'}
    `}>
      {/* Tablet-specific network layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        <div className="space-y-4">
          {/* Left column for tablet */}
          <NetworkMain />
        </div>
        {capabilities.orientation === 'landscape' && (
          <div className="space-y-4">
            {/* Right column for landscape tablet */}
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              {/* Tablet-specific quick actions */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Desktop-optimized network component  
const DesktopNetworkComponent: React.FC = () => {
  return (
    <div className="desktop-network-layout">
      {/* Desktop-specific network layout with full features */}
      <NetworkMain />
    </div>
  );
};

export const AdaptiveNetworkMain: React.FC = () => {
  return (
    <AdaptiveLayout
      mobileComponent={MobileNetworkComponent}
      tabletComponent={TabletNetworkComponent}
      desktopComponent={DesktopNetworkComponent}
    />
  );
};