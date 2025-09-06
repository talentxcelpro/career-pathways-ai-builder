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

  // Streamlined navigation - focus on core features
  const tabs = [
    { id: 'feed', label: 'Feed', primary: true },
    { id: 'network', label: 'Connect', primary: true },
    { id: 'jobs', label: 'Jobs', primary: true },
    { id: 'messages', label: 'Chat', primary: false },
    { id: 'live', label: 'Live', primary: false }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Enterprise Navigation - Professional Polish */}
      <div className="sticky top-0 bg-background/98 backdrop-blur-xl border-b border-border/30 z-30">
        <div className="safe-area-padding-top">
          <div className="flex justify-center px-6 py-4">
            <div className="flex bg-card/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-border/50">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap min-h-[44px] flex items-center justify-center",
                    "transform hover:scale-105 active:scale-95",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md scale-105"
                      : tab.primary 
                        ? "text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  style={{ 
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {tab.label}
                  {tab.primary && activeTab !== tab.id && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Area */}
      <div className="flex-1 overflow-hidden safe-area-padding-bottom bg-gradient-to-b from-background to-muted/20">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Enterprise Stories Section */}
            <div className="bg-card/50 backdrop-blur-sm border-b border-border/30 shadow-sm">
              <StoryBubbles />
            </div>
            
            {/* Professional CTA Section */}
            <div className="px-4">
              <div className="bg-gradient-to-r from-primary/5 via-brand-green/5 to-primary/5 rounded-2xl p-4 border border-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">Share Your Success</h3>
                    <p className="text-sm text-muted-foreground">Connect with professionals worldwide</p>
                  </div>
                  <div className="bg-brand-green/10 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-brand-green">Free</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all duration-300 shadow-md"
                >
                  <div className="w-5 h-5 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                  <span className="font-semibold">Create Post</span>
                </button>
              </div>
            </div>
            
            <EnhancedMobileFeed />
            
            {/* Enhanced Post Creation Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-end animate-fade-in backdrop-blur-sm">
                <div className="w-full animate-slide-in-up">
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