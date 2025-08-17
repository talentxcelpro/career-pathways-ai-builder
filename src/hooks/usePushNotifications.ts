import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isSupported] = useState('serviceWorker' in navigator && 'PushManager' in window);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission === 'granted') {
        setIsSubscribed(true);
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    setIsSubscribed(false);
    toast.success('Push notifications disabled');
    setIsLoading(false);
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test from TalentXcel!',
        icon: '/favicon.ico'
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};