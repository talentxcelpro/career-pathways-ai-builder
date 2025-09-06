import React, { useState } from 'react';
import { Bell, Briefcase, Users, MessageCircle, Trophy, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  networkUpdates: boolean;
  messages: boolean;
}

export const MobileNotifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useEnhancedNotifications();
  
  // Clean notifications - remove copilot-related ones with diagnostics
  const filteredNotifications = notifications.filter(n => {
    const isCopilot = n.title?.toLowerCase().includes('copilot') ||
                     n.message?.toLowerCase().includes('copilot') ||
                     n.title?.toLowerCase().includes('talentxcel copilot');
    
    if (isCopilot) {
      console.log('🚫 Filtered out copilot notification:', n.title);
    }
    
    return !isCopilot;
  });
  const [settings, setSettings] = useState<NotificationSettings>({
    jobAlerts: true,
    applicationUpdates: true,
    networkUpdates: true,
    messages: true,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match':
      case 'job_alert':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'application_update':
        return <Trophy className="h-4 w-4 text-green-600" />;
      case 'connection_request':
      case 'network_update':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const distance = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    return distance
      .replace('about ', '')
      .replace(' ago', '')
      .replace('minutes', 'm')
      .replace('minute', 'm')
      .replace('hours', 'h')
      .replace('hour', 'h')
      .replace('days', 'd')
      .replace('day', 'd')
      .replace('weeks', 'w')
      .replace('week', 'w');
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getAvatarSrc = (n: any) =>
    n?.data?.actor?.avatar_url ||
    n?.data?.actor_avatar ||
    n?.data?.avatar_url ||
    n?.data?.avatar ||
    n?.avatar_url ||
    n?.image ||
    n?.avatar ||
    '';
  const getActorName = (n: any) =>
    n?.data?.actor?.name ||
    n?.data?.actor_name ||
    n?.data?.user?.name ||
    n?.data?.name ||
    n?.actor_name ||
    n?.sender_name ||
    '';
  const getCreatedAt = (n: any) => n?.created_at || n?.data?.created_at || n?.inserted_at || (n as any)?.timestamp;
  const getTargetUrl = (n: any) => n?.data?.url || (n as any).link || (n as any).action_url || '';
  const openNotification = async (n: any) => {
    try {
      if (user?.id) {
        await markAsRead(n.id);
      }
    } catch (e) {
      console.warn('markAsRead failed (non-blocking):', e);
    }
    const url = getTargetUrl(n);
    if (!url) return;

    if (!user?.id && url.startsWith('/')) {
      window.location.href = `/auth?redirect=${encodeURIComponent(url)}`;
      return;
    }

    if (url.startsWith('/')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-foreground" />
              <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
            >
              Enable
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Notification Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Job Alerts</span>
              <Switch
                checked={settings.jobAlerts}
                onCheckedChange={(checked) => updateSetting('jobAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Application Updates</span>
              <Switch
                checked={settings.applicationUpdates}
                onCheckedChange={(checked) => updateSetting('applicationUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network Updates</span>
              <Switch
                checked={settings.networkUpdates}
                onCheckedChange={(checked) => updateSetting('networkUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Messages</span>
              <Switch
                checked={settings.messages}
                onCheckedChange={(checked) => updateSetting('messages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll let you know when something happens!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={cn(
                  "border-0 shadow-sm cursor-pointer transition-all",
                  !notification.is_read && "bg-blue-50/50 border-l-4 border-l-blue-500"
                )}
                onClick={() => openNotification(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <UserAvatar 
                        src={getAvatarSrc(notification)}
                        userName={getActorName(notification) || notification.title}
                        size="md"
                        hasUnread={!notification.is_read}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground line-clamp-2">
                            {notification.title}
                          </h3>
                          {getActorName(notification) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {getActorName(notification)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(getCreatedAt(notification))}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Action buttons for specific notification types */}
                      {notification.type === 'job_match' && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs">
                            View jobs
                          </Button>
                        </div>
                      )}

                      {(notification.type === 'application_update' || notification.type === 'network_update') && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs">
                            Say congrats
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};