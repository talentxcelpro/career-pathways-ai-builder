import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReelsHeaderProps {
  activeTab: 'following' | 'explore';
  onTabChange: (tab: 'following' | 'explore') => void;
  onSearch: () => void;
  onNotifications: () => void;
  onMessages: () => void;
  notificationCount?: number;
  messageCount?: number;
}

export const ReelsHeader: React.FC<ReelsHeaderProps> = ({
  activeTab,
  onTabChange,
  onSearch,
  onNotifications,
  onMessages,
  notificationCount = 0,
  messageCount = 0
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Tab switcher */}
        <div className="flex items-center">
          <div className="flex bg-black/30 rounded-full p-1">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'following'
                  ? 'bg-white text-black'
                  : 'text-white hover:text-white/80'
              }`}
              onClick={() => onTabChange('following')}
            >
              Following
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-black'
                  : 'text-white hover:text-white/80'
              }`}
              onClick={() => onTabChange('explore')}
            >
              Explore
            </button>
          </div>
        </div>

        {/* Center - Logo */}
        <div className="text-white font-bold text-lg">
          TalentXcel
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/20 text-white hover:bg-black/30"
            onClick={onSearch}
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/20 text-white hover:bg-black/30 relative"
            onClick={onNotifications}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-red-500 text-white border-0">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/20 text-white hover:bg-black/30 relative"
            onClick={onMessages}
          >
            <MessageSquare className="w-5 h-5" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-blue-500 text-white border-0">
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};