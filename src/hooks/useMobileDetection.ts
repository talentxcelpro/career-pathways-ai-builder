import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = windowSize;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    screenWidth: width,
    screenHeight: height,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    orientation: width > height ? 'landscape' : 'portrait' as 'portrait' | 'landscape',
    touchSupport: typeof window !== 'undefined' ? 'ontouchstart' in window : false
  };
};

export const useMobilePerformance = () => {
  // Return static values for now
  return {
    loadTime: 0,
    renderTime: 0,
    imageLoadCount: 0,
    totalImageSize: 0
  };
};

// Legacy compatibility wrapper
export const useMobileDetection = () => {
  const device = useDeviceDetection();
  return { isMobile: device.isMobile };
};