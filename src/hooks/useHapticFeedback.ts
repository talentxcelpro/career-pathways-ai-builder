import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const triggerHaptic = useCallback(async (type: HapticType = 'light') => {
    // Native haptics if available
    if (Capacitor.isNativePlatform()) {
      try {
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light });
            break;
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium });
            break;
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy });
            break;
          case 'success':
            await Haptics.notification({ type: NotificationType.Success });
            break;
          case 'warning':
            await Haptics.notification({ type: NotificationType.Warning });
            break;
          case 'error':
            await Haptics.notification({ type: NotificationType.Error });
            break;
        }
        return;
      } catch (e) {
        console.warn('Native haptics failed, falling back to web vibrate');
      }
    }

    // Web fallback
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light': navigator.vibrate(10); break;
        case 'medium': navigator.vibrate(20); break;
        case 'heavy': navigator.vibrate(50); break;
        case 'success': navigator.vibrate([10, 50, 10]); break;
        case 'warning': navigator.vibrate([50, 50, 50]); break;
        case 'error': navigator.vibrate([100, 50, 100]); break;
      }
    }
  }, []);

  return { triggerHaptic };
}

