import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushNotificationState {
  isRegistered: boolean;
  token: string | null;
  isSupported: boolean;
}

export const usePushNotifications = () => {
  const [notificationState, setNotificationState] = useState<PushNotificationState>({
    isRegistered: false,
    token: null,
    isSupported: Capacitor.isNativePlatform()
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only supported on native platforms');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        // Request permission to use push notifications
        const permStatus = await PushNotifications.requestPermissions();
        
        if (permStatus.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        } else {
          console.log('Push notification permission denied');
        }

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          setNotificationState(prev => ({
            ...prev,
            isRegistered: true,
            token: token.value
          }));

          // Store token via edge function
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            try {
              await supabase.functions.invoke('register-push-token', {
                body: {
                  push_token: token.value,
                  platform: Capacitor.getPlatform()
                }
              });
            } catch (error) {
              console.error('Failed to store push token:', error);
            }
          }
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast.error('Failed to register for push notifications');
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          toast.info(notification.title || 'New notification', {
            description: notification.body
          });
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
          
          // Handle notification tap - could navigate to specific screen
          const data = notification.notification.data;
          if (data?.route) {
            // Navigate to specific route if provided
            window.location.href = data.route;
          }
        });
        
      } catch (error) {
        console.error('Error initializing push notifications:', error);
        toast.error('Failed to initialize push notifications');
      }
    };

    initializePushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return notificationState;
};