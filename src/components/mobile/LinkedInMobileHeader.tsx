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
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-5 py-4">
        {/* Left side - Search */}
        <div className="flex items-center space-x-3 flex-1">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-full px-4 py-3 h-10 flex-1 justify-start max-w-xs shadow-sm transition-all duration-200"
            onClick={onSearch}
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 truncate font-medium">Search</span>
          </Button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-11 h-11 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={onMessages}
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-white rounded-full shadow-sm">
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-11 h-11 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={onNotifications}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-white rounded-full shadow-sm">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 p-0 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            onClick={onProfile}
          >
            <Avatar className="w-9 h-9 ring-2 ring-white shadow-md">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </div>
  );
};