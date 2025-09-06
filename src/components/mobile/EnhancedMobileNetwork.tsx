import React, { useState } from 'react';
import { RealTimeMobileNetwork } from './RealTimeMobileNetwork';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { StoryBubbles } from './StoryBubbles';
import { MobileMessaging } from './MobileMessaging';
import { MobileEvents } from './MobileEvents';
import { AIJobRecommendations } from './AIJobRecommendations';
import { SkillEndorsements } from './SkillEndorsements';
import { LiveNetworking } from './LiveNetworking';
import { ProfessionalGamification } from './ProfessionalGamification';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MobilePostCreation } from '@/components/mobile/MobilePostCreation';

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'feed' | 'stories' | 'network' | 'messages' | 'events' | 'jobs' | 'skills' | 'live' | 'achievements'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'stories', label: 'Stories' },
    { id: 'network', label: 'Network' },
    { id: 'messages', label: 'Messages' },
    { id: 'events', label: 'Events' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'skills', label: 'Skills' },
    { id: 'live', label: 'Live' },
    { id: 'achievements', label: 'Growth' }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile-First Tab Navigation - LinkedIn Style */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-10">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-none px-4 py-2 mx-1 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap",
                "transform hover:scale-105 active:scale-95",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && (
          <>
            <div className="px-4 py-2">
              <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowCreatePost(true)}>
                Share your thoughts...
              </Button>
            </div>
            <EnhancedMobileFeed />
            {showCreatePost && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                <MobilePostCreation
                  onClose={() => setShowCreatePost(false)}
                  onPostCreated={() => setShowCreatePost(false)}
                />
              </div>
            )}
          </>
        )}
        {activeTab === 'stories' && <StoryBubbles />}
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