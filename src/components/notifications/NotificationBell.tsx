import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Briefcase, ClipboardList, Eye, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'job_match':
      return Briefcase;
    case 'connection_request':
      return Users;
    case 'message':
      return MessageSquare;
    case 'application_update':
      return ClipboardList;
    case 'profile_view':
      return Eye;
    default:
      return Bell;
  }
};

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 min-w-[20px] items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="max-h-96 w-80 overflow-y-auto">
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {recentNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`cursor-pointer border-b p-3 hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <NotificationIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.length > 5 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={handleViewAll}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
