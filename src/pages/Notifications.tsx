import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, X, Briefcase, Users, MessageSquare, Settings } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'job',
      title: 'New job match found',
      message: 'Senior Software Engineer at TechCorp matches your profile',
      time: '2 minutes ago',
      unread: true,
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      id: 2,
      type: 'connection',
      title: 'Connection request',
      message: 'Sarah Johnson wants to connect with you',
      time: '1 hour ago',
      unread: true,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 3,
      type: 'message',
      title: 'New message',
      message: 'Mike Chen sent you a message about the React project',
      time: '3 hours ago',
      unread: false,
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: 4,
      type: 'job',
      title: 'Application update',
      message: 'Your application for Product Manager role has been reviewed',
      time: '1 day ago',
      unread: false,
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      id: 5,
      type: 'connection',
      title: 'Connection accepted',
      message: 'Emma Rodriguez accepted your connection request',
      time: '2 days ago',
      unread: false,
      icon: <Users className="h-4 w-4" />
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const filterNotifications = (type?: string) => {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities and opportunities
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="job" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({filterNotifications('job').length})
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connections ({filterNotifications('connection').length})
            </TabsTrigger>
            <TabsTrigger value="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages ({filterNotifications('message').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationsList 
              notifications={notifications} 
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </TabsContent>
          
          <TabsContent value="job">
            <NotificationsList 
              notifications={filterNotifications('job')} 
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </TabsContent>
          
          <TabsContent value="connection">
            <NotificationsList 
              notifications={filterNotifications('connection')} 
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </TabsContent>
          
          <TabsContent value="message">
            <NotificationsList 
              notifications={filterNotifications('message')} 
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface NotificationsListProps {
  notifications: any[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onDelete 
}) => {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground text-center">
            You're all caught up! New notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.unread ? 'border-l-4 border-l-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-full">
                {notification.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{notification.title}</h3>
                  <div className="flex items-center gap-2">
                    {notification.unread && (
                      <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                    )}
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{notification.message}</p>
                <div className="flex gap-2">
                  {notification.unread && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onDelete(notification.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Notifications;