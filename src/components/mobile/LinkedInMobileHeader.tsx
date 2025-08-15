import React from 'react';
import { Search, MessageSquare, Bell, Users, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface LinkedInMobileHeaderProps {
  onSearch: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onMenu: () => void;
  messageCount?: number;
  notificationCount?: number;
}

export const LinkedInMobileHeader: React.FC<LinkedInMobileHeaderProps> = ({
  onSearch,
  onMessages,
  onNotifications,
  onProfile,
  onMenu,
  messageCount = 0,
  notificationCount = 0
}) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Search */}
        <div className="flex items-center space-x-3 flex-1">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 h-9 flex-1 justify-start max-w-xs"
            onClick={onSearch}
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 truncate">Search</span>
          </Button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-1">
          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10"
            onClick={onMessages}
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-red-500 text-white border-2 border-white">
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10"
            onClick={onNotifications}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-red-500 text-white border-2 border-white">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 p-0"
            onClick={onProfile}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
              <AvatarFallback className="text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </div>
  );
};