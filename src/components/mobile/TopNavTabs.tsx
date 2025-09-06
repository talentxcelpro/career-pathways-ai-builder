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
        className="flex overflow-x-auto scrollbar-hide relative bg-white border-b border-gray-200"
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
              "flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200",
              "hover:text-blue-600 hover:bg-blue-50",
              activeTab === tab.id 
                ? "text-blue-600" 
                : "text-gray-600"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center transition-all duration-200",
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              )}>
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        ))}
        
        {/* Active Tab Indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      </div>
    </div>
  );
};