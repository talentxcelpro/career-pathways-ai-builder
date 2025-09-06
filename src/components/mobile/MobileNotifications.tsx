import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Briefcase, Users, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  networkUpdates: boolean;
  messages: boolean;
}

interface Notification {
  id: string;
  type: 'job' | 'application' | 'network' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: React.ReactNode;
}

export const MobileNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    jobAlerts: true,
    applicationUpdates: true,
    networkUpdates: false,
    messages: true,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'job',
        title: 'New Job Match',
        message: 'Senior React Developer at TechCorp matches your profile',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        icon: <Briefcase className="h-4 w-4 text-primary" />
      },
      {
        id: '2',
        type: 'application',
        title: 'Application Update',
        message: 'Your application for Frontend Developer was viewed',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        icon: <Trophy className="h-4 w-4 text-green-500" />
      },
      {
        id: '3',
        type: 'network',
        title: 'Connection Request',
        message: 'You have a new connection request',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        icon: <Users className="h-4 w-4 text-blue-500" />
      },
      {
        id: '4',
        type: 'message',
        title: 'New Message',
        message: 'Recruiter from Microsoft sent you a message',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
        icon: <MessageSquare className="h-4 w-4 text-purple-500" />
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive job alerts and updates",
          });
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
          <BellOff className="h-4 w-4 mr-1" />
          Enable
        </Button>
      </div>

      {/* Settings */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Notification Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Job Alerts</span>
            <Switch 
              checked={settings.jobAlerts}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, jobAlerts: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Application Updates</span>
            <Switch 
              checked={settings.applicationUpdates}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, applicationUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Network Updates</span>
            <Switch 
              checked={settings.networkUpdates}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, networkUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Messages</span>
            <Switch 
              checked={settings.messages}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, messages: checked }))
              }
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card 
            key={notification.id}
            className={`p-3 cursor-pointer transition-all ${
              !notification.read ? 'border-primary/30 bg-primary/5' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {notification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};