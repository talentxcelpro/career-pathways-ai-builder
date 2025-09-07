import React from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';
import { DesktopLayout } from './DesktopLayout';

interface AdaptiveLayoutProps {
  children?: React.ReactNode;
  mobileComponent?: React.ComponentType<any>;
  tabletComponent?: React.ComponentType<any>;
  desktopComponent?: React.ComponentType<any>;
  commonProps?: any;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  mobileComponent,
  tabletComponent,
  desktopComponent,
  commonProps = {}
}) => {
  const capabilities = useDeviceCapabilities();

  // If specific components are provided, render them based on device type
  if (mobileComponent || tabletComponent || desktopComponent) {
    switch (capabilities.deviceType) {
      case 'mobile':
        if (mobileComponent) {
          const MobileComponent = mobileComponent;
          return <MobileComponent {...commonProps} />;
        }
        break;
      case 'tablet':
        if (tabletComponent) {
          const TabletComponent = tabletComponent;
          return <TabletComponent {...commonProps} />;
        }
        // Fall back to mobile or desktop if tablet component not provided
        if (mobileComponent) {
          const MobileComponent = mobileComponent;
          return <MobileComponent {...commonProps} />;
        }
        break;
      case 'desktop':
        if (desktopComponent) {
          const DesktopComponent = desktopComponent;
          return <DesktopComponent {...commonProps} />;
        }
        break;
    }
  }

  // If no children provided and no specific components, return null
  if (!children && !mobileComponent && !tabletComponent && !desktopComponent) {
    return null;
  }

  // Default layout wrapper based on device capabilities
  switch (capabilities.deviceType) {
    case 'mobile':
      return (
        <MobileLayout capabilities={capabilities}>
          {children}
        </MobileLayout>
      );
    case 'tablet':
      return (
        <TabletLayout capabilities={capabilities}>
          {children}
        </TabletLayout>
      );
    default:
      return (
        <DesktopLayout capabilities={capabilities}>
          {children}
        </DesktopLayout>
      );
  }
};