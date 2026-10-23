import React, { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';
import { initOtaUpdater } from '@/lib/ota-updater';

export const MobileAppInitializer: React.FC = () => {
  const pushNotificationState = usePushNotifications();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      console.log('[NativeInit] Running on native platform:', Capacitor.getPlatform());
      console.log('[NativeInit] Push notifications state:', pushNotificationState);
      
      // Initialize OTA updater and notify native container that bundle loaded cleanly
      initOtaUpdater().catch((err) => {
        console.warn('[NativeInit] OTA Updater failed to initialize:', err);
      });
    } else {
      console.log('[NativeInit] Running on web platform');
    }
  }, [pushNotificationState]);

  return null;
};