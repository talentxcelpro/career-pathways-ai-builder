import React from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';

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
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white hover:text-white/80'
              }`}
              onClick={() => onTabChange('following')}
            >
              Following
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white hover:text-white/80'
              }`}
              onClick={() => onTabChange('explore')}
            >
              Explore
            </button>
          </div>
        </div>

        {/* Center - Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
            alt="TalentXcel" 
            className="h-6 w-auto"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
          />
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/20 text-white hover:bg-primary/20 hover:text-primary-foreground transition-colors"
            onClick={onSearch}
          >
            <Search className="w-5 h-5" />
          </Button>

          <EnhancedNotificationCenter variant="mobile" />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 bg-black/20 text-white hover:bg-primary/20 hover:text-primary-foreground transition-colors relative"
            onClick={onMessages}
          >
            <MessageSquare className="w-5 h-5" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-xs bg-accent text-accent-foreground border-0">
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};