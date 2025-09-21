import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Users, Calendar, MessageSquare, Plus } from 'lucide-react';

interface MobileHubBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'discussions', label: 'Discuss', icon: MessageSquare },
  { id: 'join', label: 'Join', icon: Plus },
];

export const MobileHubBottomNav: React.FC<MobileHubBottomNavProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-apple border-t border-border/20",
      "safe-area-padding-bottom",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg touch-target transition-colors",
                "min-w-[60px] space-y-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};