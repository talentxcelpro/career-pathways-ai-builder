import React, { useState } from 'react';
import { TopNavTabs } from './TopNavTabs';
import { FilterButtons, FilterType } from './FilterButtons';
import { AddictiveFeed } from './AddictiveFeed';
import { useIsMobile } from '@/hooks/use-mobile';

type TabType = 'feed' | 'network' | 'messages' | 'events' | 'jobs' | 'skills';

const tabs = [
  { id: 'feed' as TabType, label: 'Feed', count: 23 },
  { id: 'network' as TabType, label: 'Network', count: 156 },
  { id: 'messages' as TabType, label: 'Messages', count: 5 },
  { id: 'events' as TabType, label: 'Events', count: 12 },
  { id: 'jobs' as TabType, label: 'Jobs', count: 47 },
  { id: 'skills' as TabType, label: 'Skills' },
];

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <AddictiveFeed />;
      case 'network':
        return <AddictiveFeed />;
      case 'messages':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Messages coming soon...</p>
          </div>
        );
      case 'events':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Events coming soon...</p>
          </div>
        );
      case 'jobs':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Jobs coming soon...</p>
          </div>
        );
      case 'skills':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Skills coming soon...</p>
          </div>
        );
      default:
        return <AddictiveFeed />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Navigation Tabs */}
      <TopNavTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
        className="sticky top-0 z-40 bg-white"
      />

      {/* Filter Buttons - Show only for feed and network tabs */}
      {(activeTab === 'feed' || activeTab === 'network') && (
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          className="sticky top-[52px] z-30 bg-white border-b border-gray-100"
        />
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};