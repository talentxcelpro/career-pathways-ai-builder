import React, { useState } from 'react';
import { Bell, X, Check, Trash2, ExternalLink, User, Briefcase, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { useCrossModuleNotifications } from '@/hooks/useCrossModuleNotifications';
import { useProfileLinking } from '@/hooks/useProfileLinking';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface EnhancedNotificationCenterProps {
  className?: string;
  variant?: 'header' | 'mobile' | 'sidebar';
  showUnreadOnly?: boolean;
}

export const EnhancedNotificationCenter: React.FC<EnhancedNotificationCenterProps> = ({
  className = '',
  variant = 'header',
  showUnreadOnly = false,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useCrossModuleNotifications();

  const { getProfile, goToProfile } = useProfileLinking();

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.is_read) return false;
    if (activeFilter === 'all') return true;
    return notification.type === activeFilter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'engagement':
        return <MessageSquare className="h-4 w-4" />;
      case 'connection':
        return <Users className="h-4 w-4" />;
      case 'job_match':
        return <Briefcase className="h-4 w-4" />;
      case 'profile_visit':
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    switch (type) {
      case 'engagement':
        return 'text-blue-600';
      case 'connection':
        return 'text-green-600';
      case 'job_match':
        return 'text-purple-600';
      case 'profile_visit':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    }

    // Close popover on mobile
    if (variant === 'mobile') {
      setIsOpen(false);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const NotificationItem: React.FC<{ notification: any }> = ({ notification }) => {
    const [sourceProfile, setSourceProfile] = useState<any>(null);

    React.useEffect(() => {
      if (notification.source_user_id) {
        getProfile(notification.source_user_id).then(setSourceProfile);
      }
    }, [notification.source_user_id]);

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors",
          !notification.is_read && "bg-blue-50 border-l-2 border-l-blue-500"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        {/* Source User Avatar */}
        {sourceProfile && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={sourceProfile.profile_picture_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {sourceProfile.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Notification Icon */}
        <div className={cn(
          "mt-1 p-1.5 rounded-full",
          getNotificationColor(notification.type, notification.priority)
        )}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {notification.message}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {notification.source_module}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
                {notification.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(notification.action_url);
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                onClick={(e) => handleDeleteNotification(e, notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'engagement', label: 'Engagement', count: notifications.filter(n => n.type === 'engagement').length },
    { value: 'connection', label: 'Connections', count: notifications.filter(n => n.type === 'connection').length },
    { value: 'job_match', label: 'Jobs', count: notifications.filter(n => n.type === 'job_match').length },
    { value: 'profile_visit', label: 'Profile', count: notifications.filter(n => n.type === 'profile_visit').length },
  ];

  if (variant === 'mobile') {
    return (
      <div className={className}>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-red-500 text-white border-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Mobile Full-Screen Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex gap-2 p-4 overflow-x-auto">
                {filterOptions.map((filter) => (
                  <Badge
                    key={filter.value}
                    variant={activeFilter === filter.value ? "default" : "outline"}
                    className="whitespace-nowrap cursor-pointer"
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label} ({filter.count})
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="px-4 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                </div>
              )}

              {/* Notifications List */}
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notifications to show</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Popover Version
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-red-500 text-white border-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-1 p-2 overflow-x-auto">
            {filterOptions.slice(0, 4).map((filter) => (
              <Badge
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                className="whitespace-nowrap cursor-pointer text-xs"
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {/* Notifications */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                filteredNotifications.slice(0, 10).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {filteredNotifications.length > 10 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};