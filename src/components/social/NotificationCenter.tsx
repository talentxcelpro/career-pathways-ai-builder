import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X, Settings, Heart, MessageCircle, UserPlus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  module: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
  actor_user?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { preferences, togglePreference, isUpdating } = useNotificationPreferences();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!notifications_actor_user_id_fkey (
            full_name,
            profile_picture_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(notification => ({
        ...notification,
        actor_user: notification.profiles
      }));
    },
    enabled: !!user
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'reaction':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
      case 'connection_request':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    return notification.module === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Notification Preferences</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'email_notifications', label: 'Email notifications' },
                          { key: 'push_notifications', label: 'Push notifications' },
                          { key: 'likes_notifications', label: 'Likes & reactions' },
                          { key: 'comments_notifications', label: 'Comments' },
                          { key: 'follows_notifications', label: 'New followers' },
                          { key: 'stories_notifications', label: 'Story updates' },
                          { key: 'reactions_notifications', label: 'Post reactions' }
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label htmlFor={key} className="text-sm">{label}</Label>
                            <Switch
                              id={key}
                              checked={preferences?.[key as keyof typeof preferences] || false}
                              onCheckedChange={() => togglePreference(key as any)}
                              disabled={isUpdating}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                <TabsTrigger value="network" className="text-xs">Network</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-muted rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-l-2 hover:bg-muted/50 cursor-pointer ${
                          notification.is_read 
                            ? 'border-transparent' 
                            : 'border-primary bg-primary/5'
                        }`}
                        onClick={() => !notification.is_read && markAsReadMutation.mutate(notification.id)}
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            {notification.actor_user ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.actor_user.profile_picture_url} />
                                <AvatarFallback className="text-xs">
                                  {notification.actor_user.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotificationMutation.mutate(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};