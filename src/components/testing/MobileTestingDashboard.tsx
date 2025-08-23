import React from 'react';
import { useDeviceDetection, useMobilePerformance } from '@/hooks/useMobileDetection';

export const MobileTestingDashboard: React.FC = () => {
  const device = useDeviceDetection();
  const performance = useMobilePerformance();

  const testResults = {
    deviceSupport: {
      iPhone: device.isIOS && device.isMobile,
      iPad: device.isIOS && device.isTablet,
      Android: device.isAndroid,
      Safari: device.isSafari,
      Chrome: device.isChrome,
      touchEnabled: device.touchSupport
    },
    imageOptimization: {
      webpSupported: 'createImageBitmap' in window,
      lazyLoadingSupported: 'loading' in HTMLImageElement.prototype,
      intersectionObserverSupported: 'IntersectionObserver' in window,
      srcSetSupported: 'srcset' in document.createElement('img')
    },
    performanceMetrics: {
      loadTime: `${performance.loadTime.toFixed(2)}ms`,
      renderTime: `${performance.renderTime.toFixed(2)}ms`,
      imagesLoaded: performance.imageLoadCount,
      totalImageSize: `${(performance.totalImageSize / 1024).toFixed(2)}KB`,
      devicePixelRatio: device.devicePixelRatio
    },
    viewportInfo: {
      width: device.screenWidth,
      height: device.screenHeight,
      orientation: device.orientation,
      aspectRatio: (device.screenWidth / device.screenHeight).toFixed(2)
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white text-xs p-4 rounded-lg max-w-xs">
      <h3 className="font-bold mb-2">Mobile Test Results</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Device:</strong>
          <div className="ml-2">
            📱 {device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : 'Other'} 
            {device.isMobile ? ' Mobile' : device.isTablet ? ' Tablet' : ' Desktop'}
          </div>
          <div className="ml-2">
            🌐 {device.isSafari ? 'Safari' : device.isChrome ? 'Chrome' : 'Other'}
          </div>
        </div>

        <div>
          <strong>Performance:</strong>
          <div className="ml-2">⚡ Load: {testResults.performanceMetrics.loadTime}</div>
          <div className="ml-2">🖼️ Images: {testResults.performanceMetrics.imagesLoaded}</div>
          <div className="ml-2">📐 DPR: {testResults.performanceMetrics.devicePixelRatio}x</div>
        </div>

        <div>
          <strong>Features:</strong>
          <div className="ml-2">
            ✅ WebP: {testResults.imageOptimization.webpSupported ? 'Yes' : 'No'}
          </div>
          <div className="ml-2">
            ✅ Lazy: {testResults.imageOptimization.lazyLoadingSupported ? 'Yes' : 'No'}
          </div>
          <div className="ml-2">
            ✅ SrcSet: {testResults.imageOptimization.srcSetSupported ? 'Yes' : 'No'}
          </div>
        </div>

        <div>
          <strong>Viewport:</strong>
          <div className="ml-2">
            📏 {testResults.viewportInfo.width} × {testResults.viewportInfo.height}
          </div>
          <div className="ml-2">
            🔄 {testResults.viewportInfo.orientation}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick test component for image loading
export const ImageLoadTest: React.FC<{ src: string }> = ({ src }) => {
  const [loadTime, setLoadTime] = React.useState<number>(0);
  const [loaded, setLoaded] = React.useState(false);
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();
  }, [src]);

  const handleLoad = () => {
    const endTime = performance.now();
    setLoadTime(endTime - startTime.current);
    setLoaded(true);
  };

  return (
    <div className="relative">
      <img
        src={src}
        onLoad={handleLoad}
        className="w-full h-32 object-cover rounded"
        loading="lazy"
        decoding="async"
      />
      {loaded && (
        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
          {loadTime.toFixed(0)}ms
        </div>
      )}
    </div>
  );
};