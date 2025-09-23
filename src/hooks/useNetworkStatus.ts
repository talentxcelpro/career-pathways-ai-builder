import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionSpeed: number | null; // Mbps
  effectiveType: string | null; // '2g', '3g', '4g', etc.
  rtt: number | null; // Round trip time in ms
  downlink: number | null; // Downlink speed in Mbps
  saveData: boolean; // Data saver mode
}

declare global {
  interface Navigator {
    connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
      saveData: boolean;
      addEventListener: (type: string, listener: EventListener) => void;
      removeEventListener: (type: string, listener: EventListener) => void;
    };
  }
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionSpeed: null,
    effectiveType: null,
    rtt: null,
    downlink: null,
    saveData: false
  });

  const updateNetworkStatus = useCallback(() => {
    const connection = navigator.connection;
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || null,
      connectionSpeed: connection?.downlink || null,
      rtt: connection?.rtt || null,
      downlink: connection?.downlink || null,
      saveData: connection?.saveData || false
    }));
  }, []);

  // Speed test function
  const measureConnectionSpeed = useCallback(async (): Promise<number> => {
    try {
      const imageUrl = `https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png?t=${Date.now()}`;
      const startTime = Date.now();
      
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const bitsLoaded = 272 * 92 * 24; // Approximate size in bits
      const speedBps = bitsLoaded / duration;
      const speedMbps = speedBps / (1024 * 1024);
      
      return Math.round(speedMbps * 100) / 100;
    } catch (error) {
      console.error('Speed test failed:', error);
      return 0;
    }
  }, []);

  // Enhanced speed test with multiple measurements
  const performSpeedTest = useCallback(async (): Promise<number> => {
    const tests = [];
    const testCount = 3;
    
    for (let i = 0; i < testCount; i++) {
      try {
        const speed = await measureConnectionSpeed();
        if (speed > 0) tests.push(speed);
      } catch (error) {
        console.warn(`Speed test ${i + 1} failed:`, error);
      }
    }
    
    if (tests.length === 0) return 0;
    
    // Calculate median for more accurate results
    tests.sort((a, b) => a - b);
    const median = tests[Math.floor(tests.length / 2)];
    
    setNetworkStatus(prev => ({
      ...prev,
      connectionSpeed: median
    }));
    
    return median;
  }, [measureConnectionSpeed]);

  // Get quality recommendation based on network
  const getQualityRecommendation = useCallback(() => {
    const { effectiveType, downlink, saveData } = networkStatus;
    
    if (saveData) return '360p';
    
    if (effectiveType === '4g' && downlink && downlink > 10) return '1080p';
    if (effectiveType === '4g' && downlink && downlink > 5) return '720p';
    if (effectiveType === '3g' || (downlink && downlink > 1)) return '480p';
    
    return '360p';
  }, [networkStatus]);

  // Check if connection is suitable for video streaming
  const isStreamingQuality = useCallback(() => {
    const { isOnline, effectiveType, downlink } = networkStatus;
    
    if (!isOnline) return false;
    if (effectiveType === '2g') return false;
    if (downlink && downlink < 0.5) return false;
    
    return true;
  }, [networkStatus]);

  // Get adaptive streaming config
  const getStreamingConfig = useCallback(() => {
    const { effectiveType, downlink, saveData, rtt } = networkStatus;
    
    let bufferSize = 30; // seconds
    let maxBitrate = 5000; // kbps
    let startBitrate = 1000; // kbps
    
    if (saveData) {
      bufferSize = 15;
      maxBitrate = 1000;
      startBitrate = 500;
    } else if (effectiveType === '4g' && downlink && downlink > 5) {
      bufferSize = 60;
      maxBitrate = 8000;
      startBitrate = 2000;
    } else if (effectiveType === '3g') {
      bufferSize = 20;
      maxBitrate = 2000;
      startBitrate = 800;
    } else if (effectiveType === '2g') {
      bufferSize = 10;
      maxBitrate = 500;
      startBitrate = 300;
    }
    
    // Adjust for high latency
    if (rtt && rtt > 500) {
      bufferSize = Math.max(bufferSize * 1.5, 45);
    }
    
    return {
      bufferSize,
      maxBitrate,
      startBitrate,
      adaptationAlgorithm: effectiveType === '2g' ? 'conservative' : 'adaptive'
    };
  }, [networkStatus]);

  useEffect(() => {
    updateNetworkStatus();
    
    // Listen for online/offline events
    const handleOnline = () => {
      updateNetworkStatus();
    };
    
    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    // Listen for connection changes
    const handleConnectionChange = () => {
      updateNetworkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }
    
    // Perform initial speed test
    if (navigator.onLine) {
      measureConnectionSpeed().then(speed => {
        if (speed > 0) {
          setNetworkStatus(prev => ({ ...prev, connectionSpeed: speed }));
        }
      });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus, measureConnectionSpeed]);

  return {
    ...networkStatus,
    performSpeedTest,
    getQualityRecommendation,
    isStreamingQuality: isStreamingQuality(),
    getStreamingConfig
  };
};