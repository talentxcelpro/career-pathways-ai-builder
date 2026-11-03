import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, UserPlus, UserCheck, MessageSquare, MessageCircle, Briefcase, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface SocialNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  metadata?: Record<string, any>;
}

export function SocialNotifications() {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time listener for new notifications
    const channel = supabase
      .channel('social-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as any;
          // Filter out synthetic test users in realtime
          if (
            newNotification.message?.includes('User A') ||
            newNotification.title?.includes('User A') ||
            newNotification.message?.toLowerCase().includes('principal ai architect') ||
            newNotification.message?.toLowerCase().includes('test user')
          ) {
            return;
          }

          if (
            !newNotification.module || 
            newNotification.module === 'social' || 
            newNotification.module === 'network'
          ) {
            setNotifications(prev => [transformNotification(newNotification), ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const transformNotification = (dbNotification: any): SocialNotification => {
    // Map type from database 'type' column (with fallback to action_type)
    const rawType = dbNotification.type || dbNotification.action_type || 'system';
    
    return {
      id: dbNotification.id,
      type: rawType,
      title: dbNotification.title || 'Notification',
      message: dbNotification.message,
      created_at: dbNotification.created_at,
      is_read: dbNotification.is_read,
      metadata: dbNotification.metadata
    };
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Identify any synthetic test notifications (e.g. from E2E automated test scripts)
      const syntheticIds: string[] = [];
      const genuineRecords: any[] = [];

      (data || []).forEach(n => {
        const isSynthetic = 
          n.message?.includes('User A') || 
          n.title?.includes('User A') ||
          n.message?.toLowerCase().includes('principal ai architect') ||
          n.message?.toLowerCase().includes('test user');

        if (isSynthetic) {
          syntheticIds.push(n.id);
        } else {
          genuineRecords.push(n);
        }
      });

      // Purge synthetic test notifications from the database so they never linger
      if (syntheticIds.length > 0) {
        try {
          await supabase.from('notifications').delete().in('id', syntheticIds);
        } catch (delErr) {
          console.warn('Could not auto-purge synthetic notifications:', delErr);
        }
      }

      setNotifications(genuineRecords.map(transformNotification));
    } catch (error) {
      console.error('Error loading social notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'connection_request':
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      case 'connection_accepted':
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'job_save':
      case 'application':
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
        <CardHeader className="p-3.5 pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-bold">
            <Bell className="h-4 w-4 text-blue-600" />
            Live Network Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 pt-1">
          <div className="animate-pulse space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-xl"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
      <CardHeader className="p-3.5 pb-2">
        <CardTitle className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-foreground">
            <Bell className="h-4 w-4 text-blue-600" />
            Live Network Activity
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-blue-600 text-[10px] h-4.5 px-1.5 font-bold">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3.5 pt-1">
        {notifications.length === 0 ? (
          <div className="text-center py-5 text-muted-foreground space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-foreground">All caught up!</p>
            <p className="text-[11px] text-muted-foreground">
              New connection updates, posts, and reactions will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                  notification.is_read 
                    ? 'bg-slate-50/50 dark:bg-muted/20 border-slate-200/60 dark:border-border/40 opacity-75' 
                    : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-800/40'
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="shrink-0 mt-0.5 p-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-border/60">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-foreground truncate">{notification.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/75 mt-1 font-medium">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="shrink-0 h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-slate-200/60 dark:hover:bg-muted rounded-md"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
