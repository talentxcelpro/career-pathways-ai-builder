import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationFilters {
  module?: string;
  is_read?: boolean;
  priority?: string;
  search?: string;
}

export const useEnhancedNotifications = (filters: NotificationFilters = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    notifications,
    unreadCount,
    isLoading,
    soundEnabled,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleSound,
    setLoading
  } = useNotificationStore();

  // Fetch notifications from database
  const { data: dbNotifications = [], error } = useQuery({
    queryKey: ['notifications', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

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

      return filteredData;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Handle data updates
  useEffect(() => {
    if (dbNotifications) {
      setNotifications(dbNotifications as any);
      setLoading(false);
    }
  }, [dbNotifications]); // Removed store functions from deps

  // Handle errors
  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]); // Removed store functions from deps

  // Real-time subscription setup
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    const channel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time notification change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as any;
            addNotification(newNotification);
          } else if (payload.eventType === 'UPDATE') {
            // Refresh data to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          } else if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]); // Removed addNotification and setLoading from deps

  // Filter notifications from store based on current filters
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (filters.module) {
      filtered = filtered.filter(n => n.module === filters.module);
    }
    if (filters.is_read !== undefined) {
      filtered = filtered.filter(n => n.is_read === filters.is_read);
    }
    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [notifications, filters]);

  // Statistics
  const stats = useMemo(() => {
    const allNotifications = notifications;
    return {
      total: allNotifications.length,
      unread: unreadCount,
      byModule: allNotifications.reduce((acc, notification) => {
        acc[notification.module] = (acc[notification.module] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: allNotifications.reduce((acc, notification) => {
        acc[notification.priority] = (acc[notification.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      thisWeek: allNotifications.filter(n => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.created_at) > weekAgo;
      }).length
    };
  }, [notifications, unreadCount]);

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    isLoading,
    error,
    stats,
    soundEnabled,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleSound,
    // Mutation states for compatibility
    isMarkingAsRead: false,
    isMarkingAllAsRead: false,
    isDeletingNotification: false
  };
};

// Hook for getting unread count only (lightweight)
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotificationStore();

  // Background sync of unread count
  useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  return { unreadCount };
};

// Hook for module-specific notifications
export const useModuleNotifications = (module: string) => {
  return useEnhancedNotifications({ module });
};