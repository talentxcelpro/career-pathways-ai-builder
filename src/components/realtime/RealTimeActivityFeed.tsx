import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  Bell, 
  BellOff,
  RefreshCw,
  Clock,
  Eye,
  Heart,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityItem {
  id: string;
  type: 'user_join' | 'user_leave' | 'message' | 'like' | 'share' | 'view';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content?: string;
  metadata?: Record<string, any>;
  created_at: string;
  is_read: boolean;
}

interface RealTimeActivityFeedProps {
  className?: string;
  maxItems?: number;
  showNotifications?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = memo(({
  className,
  maxItems = 50,
  showNotifications = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(showNotifications);
  const { user } = useAuth();

  // Fetch initial activities
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (error) throw error;

      setActivities(data || []);
      setUnreadCount(data?.filter(item => !item.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [maxItems]);

  // Real-time subscription
  useEffect(() => {
    fetchActivities();

    const channel = supabase
      .channel('activity_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        (payload) => {
          const newActivity = payload.new as ActivityItem;
          setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
          
          if (!newActivity.is_read) {
            setUnreadCount(prev => prev + 1);
            
            // Show notification if enabled and not from current user
            if (notificationsEnabled && newActivity.user_id !== user?.id) {
              showNotification(newActivity);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activity_feed'
        },
        (payload) => {
          const updatedActivity = payload.new as ActivityItem;
          setActivities(prev => 
            prev.map(item => 
              item.id === updatedActivity.id ? updatedActivity : item
            )
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities, maxItems, notificationsEnabled, user?.id]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchActivities, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  const showNotification = (activity: ActivityItem) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(`${activity.user_name} ${getActivityText(activity)}`, {
        icon: activity.user_avatar || '/default-avatar.png',
        body: activity.content || '',
        tag: activity.id
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification(activity);
        }
      });
    }
  };

  const markAsRead = useCallback(async (activityId: string) => {
    try {
      await supabase
        .from('activity_feed')
        .update({ is_read: true })
        .eq('id', activityId);
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await supabase
        .from('activity_feed')
        .update({ is_read: true })
        .eq('is_read', false);
      
      setUnreadCount(0);
      setActivities(prev => prev.map(item => ({ ...item, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_join':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'user_leave':
        return <Users className="h-4 w-4 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'share':
        return <Share className="h-4 w-4 text-purple-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity: ActivityItem): string => {
    switch (activity.type) {
      case 'user_join':
        return 'joined the session';
      case 'user_leave':
        return 'left the session';
      case 'message':
        return 'sent a message';
      case 'like':
        return 'liked a post';
      case 'share':
        return 'shared content';
      case 'view':
        return 'viewed content';
      default:
        return 'had an activity';
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-2 text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? 'default' : 'secondary'}
              className={cn(
                'h-6 px-2 text-xs',
                isConnected && 'animate-pulse'
              )}
            >
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="h-8 w-8 p-0"
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchActivities}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn(
                'h-4 w-4',
                isLoading && 'animate-spin'
              )} />
            </Button>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-fit"
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-2 w-16 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activity yet</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md transition-colors cursor-pointer',
                    !activity.is_read && 'bg-primary/5 border-l-2 border-primary',
                    'hover:bg-muted/50'
                  )}
                  onClick={() => !activity.is_read && markAsRead(activity.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user_avatar} />
                    <AvatarFallback>
                      {activity.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-sm truncate">
                        {activity.user_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getActivityText(activity)}
                      </span>
                    </div>
                    
                    {activity.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {activity.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.created_at)}
                      </span>
                      {!activity.is_read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

RealTimeActivityFeed.displayName = 'RealTimeActivityFeed';