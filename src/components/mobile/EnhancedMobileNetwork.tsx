import React, { useState } from 'react';
import { RealTimeMobileNetwork } from './RealTimeMobileNetwork';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { MobileMessaging } from './MobileMessaging';
import { MobileEvents } from './MobileEvents';
import { AIJobRecommendations } from './AIJobRecommendations';
import { MobileProfileSearch } from './MobileProfileSearch';
import { useIsMobile } from '@/hooks/use-mobile';

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'network' | 'messages' | 'jobs'>('feed');

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Compact Tab Navigation */}
      <div className="flex bg-card border-b border-border/50">
        <button 
          onClick={() => setActiveTab('feed')} 
          className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
            activeTab === 'feed' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Feed
        </button>
        <button 
          onClick={() => setActiveTab('search')} 
          className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
            activeTab === 'search' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Search
        </button>
        <button 
          onClick={() => setActiveTab('network')} 
          className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
            activeTab === 'network' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Network
        </button>
        <button 
          onClick={() => setActiveTab('messages')} 
          className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
            activeTab === 'messages' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Messages
        </button>
        <button 
          onClick={() => setActiveTab('jobs')} 
          className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
            activeTab === 'jobs' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Jobs
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && <EnhancedMobileFeed />}
        {activeTab === 'search' && <MobileProfileSearch />}
        {activeTab === 'network' && <RealTimeMobileNetwork />}
        {activeTab === 'messages' && <MobileMessaging />}
        {activeTab === 'jobs' && <AIJobRecommendations />}
      </div>
    </div>
  );
};