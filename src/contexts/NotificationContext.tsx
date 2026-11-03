import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, FC } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  event_type?: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  link?: string;
  action_url?: string;
  module?: string;
  category?: string;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  icon?: string;
  sound?: boolean;
  sound_enabled?: boolean;
  delivery_status?: string;
  relevance_score?: number;
  group_key?: string;
  group_count?: number;
  opened_at?: string;
  clicked_at?: string;
  converted_at?: string;
  conversion_type?: string;
  created_at: string;
  updated_at?: string;
  read_at?: string;
  expires_at?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  unreadOnly: boolean;
  setUnreadOnly: (unreadOnly: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'recent' | 'relevance';
  setSortBy: (sort: 'recent' | 'relevance') => void;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  unregisterDeviceToken: (token?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (module?: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  trackInteraction: (id: string, action: 'open' | 'click' | 'convert' | 'dismiss', conversionType?: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  playNotificationSound: (priority?: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper for multi-tab synchronization
const broadcastSync = (payload: any) => {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('talentxcel_notification_sync');
      channel.postMessage(payload);
      channel.close();
    }
  } catch (_) {
    // Graceful fallback for non-supporting browsers
  }
};

export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useOptimizedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'relevance'>('recent');

  // Audio Context initialization on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext && typeof window !== 'undefined' && 'AudioContext' in window) {
        setAudioContext(new AudioContext());
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, [audioContext]);

  // Load notifications from database with optional relevance ordering
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      setIsLoading(true);
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      if (sortBy === 'relevance') {
        query = query
          .order('relevance_score', { ascending: false })
          .order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, sortBy]);

  // Track user engagement and conversion events (Phase 6 Telemetry)
  const trackInteraction = useCallback(async (
    id: string, 
    action: 'open' | 'click' | 'convert' | 'dismiss', 
    conversionType?: string
  ) => {
    try {
      await supabase.rpc('record_notification_interaction', {
        p_notification_id: id,
        p_action: action,
        p_conversion_type: conversionType || null,
        p_metadata: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      console.warn('Interaction tracking note:', err);
    }
  }, []);

  // Cross-Tab Synchronization (BroadcastChannel)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const syncChannel = new BroadcastChannel('talentxcel_notification_sync');

    syncChannel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'MARK_READ' && data.id) {
        setNotifications(prev =>
          prev.map(n => n.id === data.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
      } else if (data.type === 'MARK_ALL_READ') {
        setNotifications(prev =>
          prev.map(n => (!data.module || n.module === data.module) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        );
      } else if (data.type === 'DELETE' && data.id) {
        setNotifications(prev => prev.filter(n => n.id !== data.id));
      } else if (data.type === 'REFRESH') {
        loadNotifications();
      }
    };

    return () => {
      syncChannel.close();
    };
  }, [loadNotifications]);

  // Tab Focus & Online Reconnection Reconciliation
  useEffect(() => {
    if (!user) return;

    const handleFocusOrOnline = () => {
      loadNotifications();
    };

    window.addEventListener('focus', handleFocusOrOnline);
    window.addEventListener('online', handleFocusOrOnline);

    return () => {
      window.removeEventListener('focus', handleFocusOrOnline);
      window.removeEventListener('online', handleFocusOrOnline);
    };
  }, [user, loadNotifications]);

  // Real-time Postgres Changes Subscription
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          
          handleNewNotification(newNotif);
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
            prev.map(n => n.id === updated.id ? { ...n, ...updated } : n)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) {
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime notifications connected for user:', user.id);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  // Initialize Web / Native Push
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
      console.error('Push notification initialization error:', error);
    }
  };

  const initializeWebPush = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setPermission(Notification.permission);

      if ('PushManager' in window && registration.pushManager) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
          handleNewNotification(event.data.data);
        }
      });
    } catch (error) {
      console.warn('Service Worker registration note:', error);
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

      PushNotifications.addListener('registration', async (token) => {
        await registerDeviceToken(token.value, 'mobile', 'fcm');
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        handleNewNotification(notification);
      });
    } catch (error) {
      console.warn('Native push setup note:', error);
    }
  };

  const handleNewNotification = (notification: any) => {
    // Play alert audio
    if (notification.sound !== false && notification.sound_enabled !== false) {
      playNotificationSound(notification.priority);
    }

    const notifTitle = notification.title || 'New Notification';
    const notifMessage = notification.message || notification.body || '';
    const destinationUrl = notification.link || notification.action_url || notification.data?.url || '/notifications';

    // Show native desktop notification if window is blurred
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(notifTitle, {
          body: notifMessage,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: notification.id || `notif_${Date.now()}`
        });
      } catch (_) {}
    }

    // In-app visual toast with deep link navigation & click tracking
    toast(notifTitle, {
      description: notifMessage,
      action: {
        label: 'View',
        onClick: () => {
          if (notification.id) {
            trackInteraction(notification.id, 'click');
          }
          if (destinationUrl) {
            window.location.href = destinationUrl;
          }
        }
      }
    });
  };

  const playNotificationSound = useCallback((priority: string = 'medium') => {
    try {
      if (audioContext && audioContext.state === 'running') {
        const oscillator = audioContext.createGain ? audioContext.createOscillator() : null;
        if (!oscillator) return;
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const freq = priority === 'high' || priority === 'urgent' ? 880 : priority === 'low' ? 440 : 660;
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.35);
      } else {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }, [audioContext]);

  const registerDeviceToken = async (
    token: string, 
    platform: string = 'web', 
    provider: string = 'web_push',
    subscriptionDetails: any = {}
  ) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('register-push-token', {
        body: {
          action: 'register',
          token,
          platform,
          provider,
          endpoint: subscriptionDetails.endpoint,
          p256dh: subscriptionDetails.keys?.p256dh,
          auth_secret: subscriptionDetails.keys?.auth,
          device_info: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
          }
        }
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  };

  const unregisterDeviceToken = async (token?: string) => {
    if (!user) return;
    try {
      await supabase.functions.invoke('register-push-token', {
        body: {
          action: 'unregister',
          token: token || null
        }
      });
    } catch (error) {
      console.warn('Device unregister note:', error);
    }
  };

  const subscribeToPush = async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          setIsSubscribed(true);
          setPermission('granted');
          toast.success('Push notifications enabled!');
        } else {
          toast.error('Permission denied for notifications');
        }
      } else {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          toast.error('Push messaging is not supported in this browser');
          return;
        }

        const perm = await Notification.requestPermission();
        setPermission(perm);

        if (perm === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f40SawaN-F72YOFApNfUpVJ4LxoLHCkFCVRJfySpZ8_Q24eWBJA';

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });

          const subJson = subscription.toJSON();
          await registerDeviceToken(
            subscription.endpoint,
            'web',
            'web_push',
            subJson
          );

          setIsSubscribed(true);
          toast.success('Push notifications enabled!');
        } else {
          toast.error('Notification permission denied');
        }
      }
    } catch (error: any) {
      console.error('Push subscription failed:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await PushNotifications.removeAllListeners();
      } else if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await unregisterDeviceToken(subscription.endpoint);
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

  const markAsRead = async (id: string) => {
    // 1. Optimistic Update with Rollback snapshot
    const prevNotifications = [...notifications];
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString(), opened_at: new Date().toISOString() } : n)
    );
    broadcastSync({ type: 'MARK_READ', id });
    trackInteraction(id, 'open');

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString(), opened_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prevNotifications);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async (module?: string) => {
    // 1. Optimistic Update with Rollback snapshot
    const prevNotifications = [...notifications];
    setNotifications(prev =>
      prev.map(n => {
        if (!module || n.module === module) {
          return { ...n, is_read: true, read_at: new Date().toISOString() };
        }
        return n;
      })
    );
    broadcastSync({ type: 'MARK_ALL_READ', module });

    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (module) {
        query = query.eq('module', module);
      }

      const { error } = await query;
      if (error) throw error;
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(prevNotifications);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    // 1. Optimistic Update with Rollback snapshot
    const prevNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));
    broadcastSync({ type: 'DELETE', id });
    trackInteraction(id, 'dismiss');

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(prevNotifications);
      toast.error('Failed to dismiss notification');
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          actor_id: user.id,
          type: 'platform_test',
          event_type: 'PLATFORM_ANNOUNCEMENT',
          title: 'TalentXcel Notification Engine Online',
          message: 'Real-time delivery, audio indicators, and deep links are active.',
          module: 'network',
          category: 'system_updates',
          priority: 'medium',
          relevance_score: 0.900,
          link: '/notifications',
          is_read: false,
          delivery_status: 'delivered',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Test notification generated successfully!');
    } catch (error: any) {
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
    activeFilter,
    setActiveFilter,
    unreadOnly,
    setUnreadOnly,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    subscribeToPush,
    unsubscribeFromPush,
    unregisterDeviceToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    trackInteraction,
    sendTestNotification,
    playNotificationSound,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
