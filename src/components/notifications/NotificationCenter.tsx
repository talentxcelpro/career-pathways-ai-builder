import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  TestTube2,
  Check,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    playNotificationSound
  } = useNotifications();

  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match':
        return '💼';
      case 'connection_request':
        return '👥';
      case 'message':
        return '💬';
      case 'application_update':
        return '📋';
      case 'profile_view':
        return '👁️';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playNotificationSound}
              title="Test sound"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              title="Send test notification"
            >
              <TestTube2 className="h-4 w-4" />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Push Notification Controls */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Push Notifications:</span>
            {permission === 'granted' ? (
              <Badge variant="outline" className="text-green-600">
                <Bell className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">
                <BellOff className="h-3 w-3 mr-1" />
                Disabled
              </Badge>
            )}
          </div>
          
          {permission !== 'granted' ? (
            <Button
              size="sm"
              onClick={subscribeToPush}
              disabled={isLoading}
            >
              Enable Notifications
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
            >
              Disable
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll let you know when something happens!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    getPriorityColor(notification.priority)
                  } ${!notification.is_read ? 'ring-2 ring-blue-100' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { 
                              addSuffix: true 
                            })}
                          </span>
                          
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};