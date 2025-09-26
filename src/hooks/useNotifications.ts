import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'connection' | 'job' | 'premium';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  module?: string;
  link?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byModule?: Record<string, number>;
  thisWeek?: number;
}

export const useNotifications = (filters?: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      console.log('✅ Notifications loaded:', data?.length);

    } catch (err: any) {
      console.error('❌ Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setIsMarkingAsRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message);
    } finally {
      setIsMarkingAsRead(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    setIsMarkingAllAsRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');

    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message);
      toast.error('Failed to update notifications');
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setIsDeletingNotification(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      setError(err.message);
      toast.error('Failed to delete notification');
    } finally {
      setIsDeletingNotification(false);
    }
  }, [notifications]);

  const createNotification = useCallback(async (notification: Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        ...notification,
        is_read: false,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Refresh notifications to include the new one
      fetchNotifications();

    } catch (err: any) {
      console.error('Failed to create notification:', err);
    }
  }, [user, fetchNotifications]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 New notification received:', payload);
        const newNotification = payload.new as AppNotification;
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.info(newNotification.title, {
          description: newNotification.message
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleSound = useCallback(() => {
    // Mock function for compatibility
    console.log('Sound toggled');
  }, []);

  const stats: NotificationStats = {
    total: notifications.length,
    unread: unreadCount,
    thisWeek: notifications.filter(n => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.created_at) > weekAgo;
    }).length,
    byModule: notifications.reduce((acc, n) => {
      const module = n.module || 'general';
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    stats,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    toggleSound,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeletingNotification
  };
};