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

  // Compact navigation - essential features only
  const tabs = [
    { id: 'feed', label: 'Home' },
    { id: 'network', label: 'Network' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'messages', label: 'Messages' },
    { id: 'live', label: 'Live' }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Compact Navigation */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-30">
        <div className="safe-area-padding-top">
          <div className="flex justify-center px-2 py-2">
            <div className="flex bg-card/60 rounded-xl p-0.5 shadow-sm border border-border/30 w-full max-w-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-h-[36px] flex items-center justify-center",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Maximized Space */}
      <div className="flex-1 overflow-hidden safe-area-padding-bottom bg-background">
        {activeTab === 'feed' && (
          <div className="h-full flex flex-col">
            {/* Minimal CTA Bar */}
            <div className="px-4 py-3 border-b border-border/20">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full h-10 bg-card border border-border/50 rounded-lg flex items-center px-4 text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                What's on your mind?
              </button>
            </div>
            
            {/* Feed Content - Full Height */}
            <div className="flex-1 overflow-hidden">
              <EnhancedMobileFeed />
            </div>
            
            {/* Post Creation Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
                <div className="w-full">
                  <MobilePostCreation
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={() => setShowCreatePost(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'network' && <RealTimeMobileNetwork />}
        {activeTab === 'jobs' && <AIJobRecommendations />}
        {activeTab === 'messages' && <MobileMessaging />}
        {activeTab === 'live' && <LiveNetworking />}
      </div>
    </div>
  );
};