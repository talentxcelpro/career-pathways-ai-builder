import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Share2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LiveNotification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'share' | 'mention';
  title: string;
  message: string;
  avatar?: string;
  timestamp: number;
  actionUrl?: string;
  read: boolean;
}

interface LiveNotificationSystemProps {
  userId?: string | null;
}

export const LiveNotificationSystem: React.FC<LiveNotificationSystemProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Add new notification
  const addNotification = useCallback((notification: Omit<LiveNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: LiveNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only latest 5

    // Auto-remove after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 8000);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        const notification = payload.new;
        
        // Fetch related profile data if needed
        let avatar = '';
        if (notification.sender_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_picture_url, full_name')
            .eq('id', notification.sender_id)
            .single();
          
          avatar = profile?.profile_picture_url || '';
        }

        // Add to live notifications
        addNotification({
          type: notification.type as LiveNotification['type'],
          title: getNotificationTitle(notification.type),
          message: notification.message || notification.content,
          avatar,
          actionUrl: notification.action_url
        });

        // Show toast for important notifications
        if (['connection', 'mention'].includes(notification.type)) {
          toast.success(notification.message || notification.content, {
            duration: 4000,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);

  // Listen for engagement events
  useEffect(() => {
    const handleEngagementEvent = (event: CustomEvent) => {
      const { type, userId: engagementUserId, postId, userName } = event.detail;
      
      if (engagementUserId === userId) return; // Don't notify self

      addNotification({
        type: type as LiveNotification['type'],
        title: getNotificationTitle(type),
        message: `${userName || 'Someone'} ${getEngagementAction(type)} your post`,
        actionUrl: `/network/posts/${postId}`
      });
    };

    window.addEventListener('realtimeEngagement', handleEngagementEvent as EventListener);

    return () => {
      window.removeEventListener('realtimeEngagement', handleEngagementEvent as EventListener);
    };
  }, [userId, addNotification]);

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'like': return 'New Like';
      case 'comment': return 'New Comment';
      case 'connection': return 'Connection Request';
      case 'share': return 'Post Shared';
      case 'mention': return 'You were mentioned';
      default: return 'Notification';
    }
  };

  const getEngagementAction = (type: string) => {
    switch (type) {
      case 'like': return 'liked';
      case 'comment': return 'commented on';
      case 'share': return 'shared';
      default: return 'interacted with';
    }
  };

  const getNotificationIcon = (type: LiveNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'connection':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'mention':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`bg-card border border-border/60 rounded-lg shadow-lg p-4 backdrop-blur-sm ${
              notification.read ? 'opacity-70' : ''
            }`}
            onClick={() => {
              markAsRead(notification.id);
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
            }}
          >
            <div className="flex items-start gap-3">
              {notification.avatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback>
                    {getNotificationIcon(notification.type)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};