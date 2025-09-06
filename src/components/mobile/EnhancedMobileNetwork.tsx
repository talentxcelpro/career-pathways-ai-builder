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
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-30 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-none px-5 py-2.5 mx-1 text-sm font-semibold rounded-full transition-all duration-300 whitespace-nowrap",
                "transform hover:scale-105 active:scale-95 min-h-[44px] min-w-[80px] flex items-center justify-center",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40"
              )}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                backdropFilter: 'blur(8px)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)] pb-20">
        {activeTab === 'feed' && (
          <>
            {/* Stories Section */}
            <StoryBubbles />
            
            {/* Sticky Post Creation Button */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/20 px-4 py-3">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full h-12 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl flex items-center px-4 gap-3 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                </div>
                <span className="text-muted-foreground text-left flex-1">Share your thoughts...</span>
                <div className="w-6 h-6 border border-primary/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </button>
            </div>
            
            <EnhancedMobileFeed />
            
            {/* Post Creation Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-fade-in">
                <div className="w-full animate-slide-in-up">
                  <MobilePostCreation
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={() => setShowCreatePost(false)}
                  />
                </div>
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