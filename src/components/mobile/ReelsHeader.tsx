import React from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const REELS_CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'ai', label: '⚡ AI & ML' },
  { slug: 'systemdesign', label: '🏗️ System Design' },
  { slug: 'career', label: '💼 Career & Salary' },
  { slug: 'interview', label: '🎯 Interview Prep' },
  { slug: 'cloud', label: '☁️ Cloud' },
  { slug: 'remote', label: '🌍 Remote' }
];

interface ReelsHeaderProps {
  activeTab: 'following' | 'explore';
  onTabChange: (tab: 'following' | 'explore') => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  onSearch: () => void;
  onNotifications?: () => void;
  onMessages?: () => void;
  notificationCount?: number;
  messageCount?: number;
}

export const ReelsHeader: React.FC<ReelsHeaderProps> = ({
  activeTab,
  onTabChange,
  category = 'all',
  onCategoryChange,
  onSearch,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent backdrop-blur-xs pointer-events-auto pt-2 pb-1">
      <div className="safe-area-top" />
      
      {/* Top minimal action bar */}
      <div className="flex items-center justify-between px-3 py-1.5 max-w-lg mx-auto">
        {/* Left: Minimal Back to Home */}
        <Link 
          to="/" 
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-all border border-white/10"
          title="Back to Home"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Center: Sleek Following / Explore Tabs */}
        <div className="flex bg-black/50 backdrop-blur-md border border-white/15 rounded-full p-0.5 shadow-md">
          <button
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'following'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => onTabChange('following')}
          >
            Following
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => onTabChange('explore')}
          >
            Explore
          </button>
        </div>

        {/* Right: Quick Search */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8 bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors border border-white/10"
          onClick={onSearch}
          title="Search Talent & Videos"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Clean Category Filter Pills (Minimal single-row scroll) */}
      <div className="px-3 pt-1 pb-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 max-w-lg mx-auto">
        {REELS_CATEGORIES.map((cat) => {
          const isSelected = (category || 'all').toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange?.(cat.slug)}
              className={`text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all backdrop-blur-md border ${
                isSelected
                  ? 'bg-white text-black border-white shadow-xs font-semibold'
                  : 'bg-black/40 text-white/75 border-white/10 hover:bg-black/60 hover:text-white'
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
