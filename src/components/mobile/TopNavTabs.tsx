import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TopNavTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TopNavTabs: React.FC<TopNavTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement>>({});

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement && tabsRef.current) {
      const tabsRect = tabsRef.current.getBoundingClientRect();
      const activeRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: activeRect.left - tabsRect.left,
        width: activeRect.width
      });
    }
  }, [activeTab]);

  return (
    <div className={cn("relative", className)}>
      {/* Tabs Container */}
      <div 
        ref={tabsRef}
        className="flex overflow-x-auto scrollbar-hide relative bg-background border-b border-border"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current[tab.id] = el;
            }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 min-w-[80px] sm:min-w-[100px]",
              "hover:text-primary hover:bg-primary/10",
              activeTab === tab.id 
                ? "text-primary bg-primary/5" 
                : "text-muted-foreground"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center transition-all duration-200",
                "animate-pulse shadow-sm ring-1 ring-white/20",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary/30 to-primary/20 text-primary font-bold animate-bounce"
                  : "bg-gradient-to-r from-destructive/20 to-destructive/30 text-destructive-foreground animate-ping"
              )}
              style={{
                animationDuration: activeTab === tab.id ? '1s' : '2s',
                animationIterationCount: 'infinite'
              }}>
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        ))}
        
        {/* Active Tab Indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out shadow-sm"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>
    </div>
  );
};