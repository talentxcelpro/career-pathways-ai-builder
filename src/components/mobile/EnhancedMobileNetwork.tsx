import React, { useState } from 'react';
import { RealTimeMobileNetwork } from './RealTimeMobileNetwork';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { MobileStories } from './MobileStories';
import { MobileMessaging } from './MobileMessaging';
import { MobileEvents } from './MobileEvents';
import { AIJobRecommendations } from './AIJobRecommendations';
import { SkillEndorsements } from './SkillEndorsements';
import { LiveNetworking } from './LiveNetworking';
import { ProfessionalGamification } from './ProfessionalGamification';
import { useIsMobile } from '@/hooks/use-mobile';

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'feed' | 'stories' | 'network' | 'messages' | 'events' | 'jobs' | 'skills' | 'live' | 'achievements'>('feed');

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Navigation */}
      <div className="flex bg-card border-b border-border/50 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('feed')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'feed' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Feed</button>
        <button onClick={() => setActiveTab('stories')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'stories' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Stories</button>
        <button onClick={() => setActiveTab('network')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'network' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Network</button>
        <button onClick={() => setActiveTab('messages')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'messages' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Messages</button>
        <button onClick={() => setActiveTab('events')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'events' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Events</button>
        <button onClick={() => setActiveTab('jobs')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'jobs' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Jobs</button>
        <button onClick={() => setActiveTab('skills')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'skills' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Skills</button>
        <button onClick={() => setActiveTab('live')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'live' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Live</button>
        <button onClick={() => setActiveTab('achievements')} className={`flex-none px-2 py-3 text-xs font-medium transition-colors whitespace-nowrap ${activeTab === 'achievements' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>Growth</button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && <EnhancedMobileFeed />}
        {activeTab === 'stories' && <MobileStories />}
        {activeTab === 'network' && <RealTimeMobileNetwork />}
        {activeTab === 'messages' && <MobileMessaging />}
        {activeTab === 'events' && <MobileEvents />}
        {activeTab === 'jobs' && <AIJobRecommendations />}
        {activeTab === 'skills' && <SkillEndorsements />}
        {activeTab === 'live' && <LiveNetworking />}
        {activeTab === 'achievements' && <ProfessionalGamification />}
      </div>
    </div>
  );
};