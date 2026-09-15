import { createContext, useContext, useEffect, useState, useCallback, ReactNode, FC } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  playNotificationSound: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  action_url?: string;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  sound_enabled?: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useOptimizedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context for sound
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext && 'AudioContext' in window) {
        setAudioContext(new AudioContext());
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, [audioContext]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Play sound and show browser notification
          handleNewNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updated.id ? updated : n)
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, loadNotifications]);

  // Initialize push notifications
  useEffect(() => {
    if (user) {
      initializePushNotifications();
    }
  }, [user]);

  const initializePushNotifications = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await initializeNativePush();
      } else {
        await initializeWebPush();
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  };

  const initializeWebPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return;
    }

    // In Lovable preview/sandbox environments, disable SW to avoid stale caches
    const host = location.hostname;
    const isPreview = host.includes('lovable.app') || host.includes('sandbox.lovable.dev') || host.includes('id-preview');
    if (isPreview) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        console.log('Service Worker disabled in preview. Unregistered and cleared caches.');
      } catch (e) {
        console.warn('Error while disabling SW in preview:', e);
      }
      // Keep state consistent
      setPermission(Notification.permission);
      setIsSubscribed(false);
      return;
    }

    try {
      // Register service worker (production only)
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Check current permission
      setPermission(Notification.permission);

      // Check existing subscription
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
          handleNewNotification(event.data.data);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const initializeNativePush = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        setIsSubscribed(true);
        setPermission('granted');
      }

      // Listen for registration token
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        await registerPushToken(token.value, 'mobile');
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        handleNewNotification(notification);
      });

      // Handle notification tap
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

    } catch (error) {
      console.error('Native push setup failed:', error);
    }
  };

  const handleNewNotification = (notification: any) => {
    // Play notification sound
    if (notification.sound_enabled !== false) {
      playNotificationSound();
    }

    // Show browser notification if not on mobile
    if (!Capacitor.isNativePlatform() && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message || notification.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });
    }

    // Show toast notification
    toast(notification.title, {
      description: notification.message || notification.body,
      action: notification.action_url ? {
        label: 'View',
        onClick: () => window.open(notification.action_url, '_blank')
      } : undefined
    });
  };

  const playNotificationSound = () => {
    try {
      // Play system notification sound
      if (audioContext && audioContext.state === 'running') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else {
        // Fallback: try to play audio file
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          console.log('Could not play notification sound');
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        if (Capacitor.isNativePlatform()) {
          await PushNotifications.register();
          setIsSubscribed(true);
        } else {
          const registration = await navigator.serviceWorker.ready;
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f40SawaN-F72YOFApNfUpVJ4LxoLHCkFCVRJfySpZ8_Q24eWBJA'
            )
          });

          await registerPushToken(JSON.stringify(subscription), 'web');
          setIsSubscribed(true);
        }
        
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const registerPushToken = async (token: string, platform: string) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('register-push-token', {
        body: { push_token: token, platform, user_id: user.id }
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await PushNotifications.removeAllListeners();
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;

    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: [user.id],
          title: 'Test Notification',
          body: 'This is a test notification from TalentXcel!',
          data: { test: true },
          priority: 'normal'
        }
      });
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value = {
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};