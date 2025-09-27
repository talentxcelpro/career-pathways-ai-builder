// Temporary minimal implementation to bypass React dispatcher issues
export const useDeviceDetection = () => {
  // Return static values for now
  return {
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
    isIOS: typeof window !== 'undefined' ? /iPad|iPhone|iPod/.test(navigator.userAgent) : false,
    isAndroid: typeof window !== 'undefined' ? /Android/.test(navigator.userAgent) : false,
    isSafari: typeof window !== 'undefined' ? /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) : false,
    isChrome: typeof window !== 'undefined' ? /Chrome/.test(navigator.userAgent) : false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    orientation: typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'landscape' as 'portrait' | 'landscape',
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