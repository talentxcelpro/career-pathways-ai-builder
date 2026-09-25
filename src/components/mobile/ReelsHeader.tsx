import React from 'react';
import { Search, Bell, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';

export const REELS_CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'ai', label: '⚡ AI & ML' },
  { slug: 'systemdesign', label: '🏗️ System Design' },
  { slug: 'career', label: '💼 Career & Salary' },
  { slug: 'interview', label: '🎯 Interview Prep' },
  { slug: 'cloud', label: '☁️ Cloud & DevOps' },
  { slug: 'remote', label: '🌍 Global Remote' }
];

interface ReelsHeaderProps {
  activeTab: 'following' | 'explore';
  onTabChange: (tab: 'following' | 'explore') => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  onSearch: () => void;
  onNotifications: () => void;
  onMessages: () => void;
  notificationCount?: number;
  messageCount?: number;
}

export const ReelsHeader: React.FC<ReelsHeaderProps> = ({
  activeTab,
  onTabChange,
  category = 'all',
  onCategoryChange,
  onSearch,
  onNotifications,
  onMessages,
  notificationCount = 0,
  messageCount = 0
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
        {/* Left side - Tab switcher */}
        <div className="flex items-center">
          <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-0.5">
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'following'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
              onClick={() => onTabChange('following')}
            >
              Following
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
              onClick={() => onTabChange('explore')}
            >
              Explore
            </button>
          </div>
        </div>

        {/* Center - Brand */}
        <div className="flex items-center">
          <a href="/" className="text-white font-bold text-sm tracking-tight flex items-center gap-1">
            <span>Talent<span className="text-blue-400">Xcel</span></span>
            <span className="text-[10px] text-pink-400 font-semibold px-1.5 py-0.2 rounded-full bg-pink-500/20 border border-pink-500/30">Reels</span>
          </a>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 bg-black/30 text-white hover:bg-white/20 transition-colors"
            onClick={onSearch}
            title="Search Talent & Videos"
          >
            <Search className="w-4 h-4" />
          </Button>

          <EnhancedNotificationCenter variant="mobile" />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 bg-black/30 text-white hover:bg-white/20 transition-colors relative"
            onClick={onMessages}
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 text-[10px] bg-accent text-accent-foreground border-0">
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="px-3 pb-2 overflow-x-auto scrollbar-none flex items-center gap-1.5 max-w-lg mx-auto">
        {REELS_CATEGORIES.map((cat) => {
          const isSelected = (category || 'all').toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange?.(cat.slug)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all backdrop-blur-md border ${
                isSelected
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-black/30 text-white/80 border-white/10 hover:bg-black/50 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};