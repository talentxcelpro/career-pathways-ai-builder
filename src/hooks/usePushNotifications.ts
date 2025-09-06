import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported] = useState('serviceWorker' in navigator && 'PushManager' in window);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }

    // Initialize native push notifications on mobile
    if (Capacitor.isNativePlatform()) {
      initializeNativePush();
    }
  }, [isSupported, user]);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const initializeNativePush = async () => {
    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration token
      PushNotifications.addListener('registration', (token) => {
        console.log('Registration token: ', token.value);
        setPushToken(token.value);
        registerPushToken(token.value, 'mobile');
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
      });

      // Handle notification tap
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });

    } catch (error) {
      console.error('Native push initialization error:', error);
    }
  };

  const registerPushToken = async (token: string, platform: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('register-push-token', {
        body: { push_token: token, platform }
      });
      
      if (error) throw error;
      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        if (Capacitor.isNativePlatform()) {
          // Native mobile subscription handled in initializeNativePush
          setIsSubscribed(true);
        } else {
          // Web push subscription
          const registration = await navigator.serviceWorker.ready;
          
          // Generate VAPID keys or use existing ones
          const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f40SawaN-F72YOFApNfUpVJ4LxoLHCkFCVRJfySpZ8_Q24eWBJA'; // Replace with your VAPID public key
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });

          // Register subscription with backend
          const subscriptionData = JSON.stringify(subscription);
          await registerPushToken(subscriptionData, 'web');
          
          setIsSubscribed(true);
        }
        toast.success('Push notifications enabled!');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Unregister native push notifications
        await PushNotifications.removeAllListeners();
      } else {
        // Unsubscribe web push
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
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
    pushToken,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};