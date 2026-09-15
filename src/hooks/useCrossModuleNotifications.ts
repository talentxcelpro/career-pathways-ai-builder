import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CrossModuleNotification {
  id: string;
  user_id: string;
  type: 'engagement' | 'connection' | 'job_match' | 'profile_visit' | 'content_mention';
  title: string;
  message: string;
  source_module: 'reels' | 'network' | 'jobs' | 'profile';
  source_content_id?: string;
  source_user_id?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  metadata: any;
}

export const useCrossModuleNotifications = () => {
  const [notifications, setNotifications] = useState<CrossModuleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get current user
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load notifications
  const loadNotifications = async () => {
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

      const typedNotifications = (data || []).map(notification => ({
        ...notification,
        metadata: notification.metadata || {}
      })) as CrossModuleNotification[];

      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel('cross-module-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            metadata: payload.new.metadata || {}
          } as CrossModuleNotification;

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast for high priority notifications
          if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: newNotification.priority === 'urgent' ? 10000 : 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = {
            ...payload.new,
            metadata: payload.new.metadata || {}
          } as CrossModuleNotification;

          setNotifications(prev =>
            prev.map(n =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Create cross-module notification
  const createNotification = async (notification: Omit<CrossModuleNotification, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.source_user_id || user.id, // Target user
          type: notification.type,
          title: notification.title,
          message: notification.message,
          source_module: notification.source_module,
          source_content_id: notification.source_content_id,
          source_user_id: user.id, // Current user who triggered the notification
          action_url: notification.action_url,
          priority: notification.priority,
          is_read: false,
          expires_at: notification.expires_at,
          metadata: notification.metadata || {},
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create specific notification types
  const notifyEngagement = async (targetUserId: string, engagementType: string, contentType: string, contentId: string, sourceModule: string) => {
    const titles = {
      like: 'New Like',
      comment: 'New Comment',
      share: 'Content Shared',
      save: 'Content Saved',
      apply: 'Job Application',
    };

    const messages = {
      like: `Someone liked your ${contentType}`,
      comment: `Someone commented on your ${contentType}`,
      share: `Someone shared your ${contentType}`,
      save: `Someone saved your ${contentType}`,
      apply: `Someone applied to your ${contentType}`,
    };

    await createNotification({
      source_user_id: targetUserId,
      type: 'engagement',
      title: titles[engagementType as keyof typeof titles] || 'New Engagement',
      message: messages[engagementType as keyof typeof messages] || 'Someone engaged with your content',
      source_module: sourceModule as any,
      source_content_id: contentId,
      action_url: `/${sourceModule}/${contentId}`,
      priority: 'medium',
      is_read: false,
      metadata: {
        engagement_type: engagementType,
        content_type: contentType,
      },
    });
  };

  const notifyConnection = async (targetUserId: string, connectionType: 'request' | 'accepted') => {
    const isRequest = connectionType === 'request';

    await createNotification({
      source_user_id: targetUserId,
      type: 'connection',
      title: isRequest ? 'New Connection Request' : 'Connection Accepted',
      message: isRequest ? 'Someone wants to connect with you' : 'Someone accepted your connection request',
      source_module: 'network',
      action_url: '/network/connections',
      priority: 'medium',
      is_read: false,
      metadata: {
        connection_type: connectionType,
      },
    });
  };

  const notifyJobMatch = async (targetUserId: string, jobId: string, matchScore: number) => {
    await createNotification({
      source_user_id: targetUserId,
      type: 'job_match',
      title: 'New Job Match',
      message: `Found a ${matchScore}% match for your profile`,
      source_module: 'jobs',
      source_content_id: jobId,
      action_url: `/jobs/${jobId}`,
      priority: matchScore > 85 ? 'high' : 'medium',
      is_read: false,
      metadata: {
        match_score: matchScore,
      },
    });
  };

  const notifyProfileVisit = async (targetUserId: string, visitorId: string) => {
    await createNotification({
      source_user_id: targetUserId,
      type: 'profile_visit',
      title: 'Profile Visit',
      message: 'Someone viewed your profile',
      source_module: 'profile',
      action_url: '/profile',
      priority: 'low',
      is_read: false,
      metadata: {
        visitor_id: visitorId,
      },
    });
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Convenience methods
    notifyEngagement,
    notifyConnection,
    notifyJobMatch,
    notifyProfileVisit,
  };
};