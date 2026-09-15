import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationInit: React.FC = () => {
  usePushNotifications({ autoRegister: true });
  return null;
};
