/**
 * Smart Notification System with Batching and Priority
 * LinkedIn-style real-time notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'connection' | 'job' | 'message' | 'like' | 'comment' | 'mention';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  read: boolean;
  action_url?: string;
  user_avatar?: string;
  user_name?: string;
}

interface NotificationBatch {
  notifications: Notification[];
  count: number;
  highestPriority: 'low' | 'medium' | 'high' | 'urgent';
}

const BATCH_DELAY = 2000; // 2 seconds
const MAX_BATCH_SIZE = 5;

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const batchRef = useRef<Notification[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Batch notifications to prevent flooding
  const processBatch = useCallback(() => {
    if (batchRef.current.length === 0) return;

    const batch: NotificationBatch = {
      notifications: [...batchRef.current],
      count: batchRef.current.length,
      highestPriority: batchRef.current.reduce((highest, notif) => {
        const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorities[notif.priority] > priorities[highest] ? notif.priority : highest;
      }, 'low' as Notification['priority']),
    };

    // Show batch notification
    if (batch.count === 1) {
      const notif = batch.notifications[0];
      showSingleNotification(notif);
    } else {
      showBatchNotification(batch);
    }

    // Add to state
    setNotifications(prev => [...batch.notifications, ...prev]);
    setUnreadCount(prev => prev + batch.count);

    // Clear batch
    batchRef.current = [];
  }, []);

  const showSingleNotification = (notif: Notification) => {
    const icon = getNotificationIcon(notif.type);
    
    toast(notif.title, {
      description: notif.message,
      action: notif.action_url ? {
        label: 'View',
        onClick: () => window.location.href = notif.action_url!,
      } : undefined,
      duration: notif.priority === 'urgent' ? 10000 : 5000,
    });
  };

  const showBatchNotification = (batch: NotificationBatch) => {
    const typeGroups = batch.notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summary = Object.entries(typeGroups)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    toast('New Notifications', {
      description: `You have ${batch.count} new notifications: ${summary}`,
      action: {
        label: 'View All',
        onClick: () => window.location.href = '/notifications',
      },
      duration: 6000,
    });
  };

  const addToBatch = useCallback((notification: Notification) => {
    batchRef.current.push(notification);

    // Clear existing timer
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }

    // Process immediately if urgent or batch is full
    if (notification.priority === 'urgent' || batchRef.current.length >= MAX_BATCH_SIZE) {
      processBatch();
    } else {
      // Schedule batch processing
      batchTimerRef.current = setTimeout(processBatch, BATCH_DELAY);
    }
  }, [processBatch]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification: Notification = {
              id: payload.new.id,
              title: payload.new.title,
              message: payload.new.message,
              type: payload.new.module || 'message',
              priority: payload.new.priority || 'medium',
              timestamp: Date.now(),
              read: false,
              action_url: payload.new.action_url,
              user_avatar: payload.new.metadata?.user_avatar,
              user_name: payload.new.metadata?.user_name,
            };

            addToBatch(notification);
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      channelRef.current = channel;
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, [addToBatch]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

function getNotificationIcon(type: string) {
  const icons = {
    connection: '👥',
    job: '💼',
    message: '💬',
    like: '❤️',
    comment: '💭',
    mention: '@',
  };
  return icons[type as keyof typeof icons] || '🔔';
}
