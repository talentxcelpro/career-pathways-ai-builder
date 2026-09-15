import React, { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';

export const MobileAppInitializer: React.FC = () => {
  const pushNotificationState = usePushNotifications({ autoRegister: true });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform:', Capacitor.getPlatform());
      console.log('Push notifications:', {
        supported: pushNotificationState.isSupported,
        subscribed: pushNotificationState.isSubscribed,
        permission: pushNotificationState.permission,
        hasToken: !!pushNotificationState.pushToken,
      });
    } else {
      console.log('Running on web platform');
    }
  }, [
    pushNotificationState.isSubscribed,
    pushNotificationState.isSupported,
    pushNotificationState.permission,
    pushNotificationState.pushToken,
  ]);

  // This component doesn't render anything visible
  return null;
};
