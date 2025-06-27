
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Calendar, Briefcase, Bell } from "lucide-react";

interface NotificationsListProps {
  notifications: any[];
  onMarkAsRead: (notificationId: string) => void;
  isLoading: boolean;
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  isLoading
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'reaction':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'connection':
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'job':
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 p-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p className="text-gray-600">You're all caught up! No new notifications to show.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
            !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
          }`}
          onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
        >
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {notification.type === 'system' ? 'S' : 'N'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
