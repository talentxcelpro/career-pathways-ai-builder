import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface DeviceCapabilities {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  hasTouch: boolean;
  isNative: boolean;
  orientation: 'portrait' | 'landscape';
  networkType: 'slow' | 'fast' | 'unknown';
  screenSize: 'small' | 'medium' | 'large';
  pixelRatio: number;
  isAppleDevice: boolean;
  supportsHover: boolean;
}

export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    deviceType: 'desktop',
    hasTouch: false,
    isNative: false,
    orientation: 'landscape',
    networkType: 'unknown',
    screenSize: 'large',
    pixelRatio: 1,
    isAppleDevice: false,
    supportsHover: true,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // Device type detection
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*(?:Tablet|Tab))/i.test(userAgent) ||
                      (window.innerWidth >= 768 && window.innerWidth <= 1024);
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile && !isTablet) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      // Touch detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Native app detection
      const isNative = Capacitor.isNativePlatform();

      // Orientation detection
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

      // Network detection
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      let networkType: 'slow' | 'fast' | 'unknown' = 'unknown';
      if (connection) {
        if (connection.effectiveType === '4g' || connection.downlink > 2) {
          networkType = 'fast';
        } else {
          networkType = 'slow';
        }
      }

      // Screen size categorization
      const width = window.innerWidth;
      let screenSize: 'small' | 'medium' | 'large' = 'large';
      if (width < 768) screenSize = 'small';
      else if (width < 1024) screenSize = 'medium';

      // Pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;

      // Apple device detection
      const isAppleDevice = /Mac|iPhone|iPad|iPod/i.test(userAgent);

      // Hover support detection
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      setCapabilities({
        deviceType,
        hasTouch,
        isNative,
        orientation,
        networkType,
        screenSize,
        pixelRatio,
        isAppleDevice,
        supportsHover,
      });
    };

    // Initial detection
    detectCapabilities();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectCapabilities, 100); // Small delay for accurate measurements
    };

    // Listen for resize events
    const handleResize = () => {
      detectCapabilities();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return capabilities;
};