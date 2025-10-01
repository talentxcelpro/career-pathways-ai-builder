/**
 * Battery-Conscious Optimizations
 * Reduces power consumption on mobile devices
 */

import { useState, useEffect, useCallback } from 'react';

interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface OptimizationConfig {
  reduceAnimations: boolean;
  reducePollRate: boolean;
  reduceQuality: boolean;
  disableBackgroundSync: boolean;
}

const LOW_BATTERY_THRESHOLD = 0.2; // 20%
const CRITICAL_BATTERY_THRESHOLD = 0.1; // 10%

export function useBatteryOptimization() {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationConfig>({
    reduceAnimations: false,
    reducePollRate: false,
    reduceQuality: false,
    disableBackgroundSync: false,
  });

  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          
          const updateStatus = () => {
            setBatteryStatus({
              level: battery.level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            });
          };

          updateStatus();

          battery.addEventListener('levelchange', updateStatus);
          battery.addEventListener('chargingchange', updateStatus);

          return () => {
            battery.removeEventListener('levelchange', updateStatus);
            battery.removeEventListener('chargingchange', updateStatus);
          };
        } catch (error) {
          console.warn('Battery API not supported');
        }
      }
    };

    getBatteryStatus();
  }, []);

  // Apply optimizations based on battery level
  useEffect(() => {
    if (!batteryStatus) return;

    const { level, charging } = batteryStatus;

    if (charging) {
      // Full performance when charging
      setOptimizations({
        reduceAnimations: false,
        reducePollRate: false,
        reduceQuality: false,
        disableBackgroundSync: false,
      });
    } else if (level <= CRITICAL_BATTERY_THRESHOLD) {
      // Critical battery - aggressive optimizations
      setOptimizations({
        reduceAnimations: true,
        reducePollRate: true,
        reduceQuality: true,
        disableBackgroundSync: true,
      });
    } else if (level <= LOW_BATTERY_THRESHOLD) {
      // Low battery - moderate optimizations
      setOptimizations({
        reduceAnimations: true,
        reducePollRate: true,
        reduceQuality: false,
        disableBackgroundSync: false,
      });
    } else {
      // Normal battery - no optimizations
      setOptimizations({
        reduceAnimations: false,
        reducePollRate: false,
        reduceQuality: false,
        disableBackgroundSync: false,
      });
    }
  }, [batteryStatus]);

  const getOptimizedPollRate = useCallback((defaultRate: number): number => {
    if (optimizations.reducePollRate) {
      return defaultRate * 2; // Double the poll interval
    }
    return defaultRate;
  }, [optimizations.reducePollRate]);

  const shouldAnimate = useCallback((): boolean => {
    return !optimizations.reduceAnimations;
  }, [optimizations.reduceAnimations]);

  const getImageQuality = useCallback((): 'high' | 'medium' | 'low' => {
    if (optimizations.reduceQuality) return 'low';
    return 'high';
  }, [optimizations.reduceQuality]);

  const shouldSync = useCallback((): boolean => {
    return !optimizations.disableBackgroundSync;
  }, [optimizations.disableBackgroundSync]);

  return {
    batteryStatus,
    optimizations,
    getOptimizedPollRate,
    shouldAnimate,
    getImageQuality,
    shouldSync,
    isBatteryLow: batteryStatus ? batteryStatus.level <= LOW_BATTERY_THRESHOLD : false,
    isBatteryCritical: batteryStatus ? batteryStatus.level <= CRITICAL_BATTERY_THRESHOLD : false,
  };
}

// Reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Network-aware optimizations
export function useNetworkOptimization() {
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'offline'>('fast');
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) return;

    const updateConnection = () => {
      const effectiveType = connection.effectiveType;
      setSaveData(connection.saveData || false);

      if (effectiveType === '4g') {
        setConnectionType('fast');
      } else if (effectiveType === '3g' || effectiveType === '2g' || effectiveType === 'slow-2g') {
        setConnectionType('slow');
      } else {
        setConnectionType('fast');
      }
    };

    updateConnection();
    connection.addEventListener('change', updateConnection);

    return () => connection.removeEventListener('change', updateConnection);
  }, []);

  const shouldLoadHighQualityImages = useCallback(() => {
    return connectionType === 'fast' && !saveData;
  }, [connectionType, saveData]);

  const shouldPreload = useCallback(() => {
    return connectionType === 'fast' && !saveData;
  }, [connectionType, saveData]);

  return {
    connectionType,
    saveData,
    shouldLoadHighQualityImages,
    shouldPreload,
    isSlowConnection: connectionType === 'slow',
  };
}
