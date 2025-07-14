import React, { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';

export const MobileAppInitializer: React.FC = () => {
  const pushNotificationState = usePushNotifications();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform:', Capacitor.getPlatform());
      console.log('Push notifications state:', pushNotificationState);
    } else {
      console.log('Running on web platform');
    }
  }, [pushNotificationState]);

  // This component doesn't render anything visible
  return null;
};