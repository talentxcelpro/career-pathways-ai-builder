import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  module: 'network' | 'jobs' | 'resume' | 'tools' | 'companies' | 'learning' | 'career_map' | 'employer';
  type: string;
  title: string;
  message: string;
  link: string;
  icon?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  sound: boolean;
  created_at: string;
  expires_at?: string;
}

export interface NotificationFilters {
  module?: string;
  is_read?: boolean;
  priority?: string;
  search?: string;
}

export const useNotifications = (filters: NotificationFilters = {}) => {
  const queryClient = useQueryClient();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('notifications-sound') !== 'false';
  });

  // Fetch notifications with filters
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      let filteredData = data || [];

      // Apply search filter client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          notification =>
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message?.toLowerCase().includes(searchLower)
        );
      }

      return filteredData as Notification[];
    },
    retry: 1
  });

  // Real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            
            // Play sound if enabled
            if (soundEnabled && newNotification.sound) {
              playNotificationSound(newNotification.priority);
            }
            
            // Show toast notification
            showToastNotification(newNotification);
          }
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [queryClient, soundEnabled]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async (module?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (module) {
        query = query.eq('module', module);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications marked as read');
    },
    onError: (error) => {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  });

  // Sound functions
  const playNotificationSound = useCallback((priority: string) => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      switch (priority) {
        case 'high':
          audio.src = '/sounds/notification-high.mp3';
          break;
        case 'medium':
          audio.src = '/sounds/notification-medium.mp3';
          break;
        case 'low':
          audio.src = '/sounds/notification-low.mp3';
          break;
        default:
          audio.src = '/sounds/notification-default.mp3';
      }
      audio.volume = 0.6;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notifications-sound', enabled.toString());
  }, []);

  // Toast notification display
  const showToastNotification = useCallback((notification: Notification) => {
    const priority = notification.priority;
    const toastOptions = {
      duration: priority === 'high' ? 8000 : priority === 'medium' ? 5000 : 3000,
      action: {
        label: 'View',
        onClick: () => {
          window.location.href = notification.link;
        }
      }
    };

    if (priority === 'high') {
      toast.error(notification.title, {
        description: notification.message,
        ...toastOptions
      });
    } else if (priority === 'medium') {
      toast.info(notification.title, {
        description: notification.message,
        ...toastOptions
      });
    } else {
      toast(notification.title, {
        description: notification.message,
        ...toastOptions
      });
    }
  }, []);

  // Statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    byModule: notifications.reduce((acc, notification) => {
      acc[notification.module] = (acc[notification.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    thisWeek: notifications.filter(n => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.created_at) > weekAgo;
    }).length
  };

  return {
    notifications,
    isLoading,
    error,
    stats,
    soundEnabled,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    toggleSound,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending
  };
};