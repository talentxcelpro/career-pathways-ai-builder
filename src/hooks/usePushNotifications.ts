import { useEffect, useState } from 'react';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // We only register push notifications on Native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform() || !user) return;

    let isMounted = true;

    const registerNotifications = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log('Push notification permissions not granted');
          return;
        }

        // Add listeners
        await PushNotifications.addListener('registration', async (token: Token) => {
          if (!isMounted) return;
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);

          // Save token to backend using edge function
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const platform = Capacitor.getPlatform();
            
            // Invoke the register-push-token edge function
            await supabase.functions.invoke('register-push-token', {
              body: {
                token: token.value,
                platform: platform === 'android' ? 'android' : (platform === 'ios' ? 'ios' : 'web'),
                deviceInfo: { timestamp: new Date().toISOString() }
              }
            });
            console.log('Token successfully registered to backend');
          } catch (e) {
            console.error('Error saving push token to backend', e);
          }
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ', error);
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received: ', notification);
          // Show local toast when app is in foreground
          toast.message(notification.title || 'New Notification', {
            description: notification.body,
            action: notification.data?.url ? {
              label: 'View',
              onClick: () => navigate(notification.data.url)
            } : undefined
          });
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed: ', notification);
          const data = notification.notification.data;
          
          if (data && data.url) {
            navigate(data.url);
          }
        });

        // Register with Apple/Google to receive token
        await PushNotifications.register();
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    registerNotifications();

    return () => {
      isMounted = false;
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [user, navigate]);

  return { token };
};
