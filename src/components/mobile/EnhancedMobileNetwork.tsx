import React, { useState } from 'react';
import { TopNavTabs } from './TopNavTabs';
import { FilterButtons, FilterType } from './FilterButtons';
import { RealTimeMobileNetwork } from './RealTimeMobileNetwork';
import { MobileEvents } from './MobileEvents';
import { useIsMobile } from '@/hooks/use-mobile';
import Messages from '@/pages/network/Messages';
import Events from '@/pages/network/Events';
import { MobileJobs } from '@/pages/mobile/MobileJobs';

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

  // Always render content; show a hint when not on mobile viewport
  const NotMobileHint = !isMobile ? (
    <div className="flex items-center justify-center h-10 text-xs text-muted-foreground border-b border-gray-200">
      This view is optimized for mobile devices.
    </div>
  ) : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <RealTimeMobileNetwork activeFilter={activeFilter} />;
      case 'network':
        return <RealTimeMobileNetwork activeFilter={activeFilter} />;
      case 'messages':
        return <Messages />;
      case 'events':
        return <Events />;
      case 'jobs':
        return <MobileJobs />;
      case 'skills':
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Skills coming soon...</p>
          </div>
        );
      default:
        return <RealTimeMobileNetwork activeFilter={activeFilter} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {NotMobileHint}
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