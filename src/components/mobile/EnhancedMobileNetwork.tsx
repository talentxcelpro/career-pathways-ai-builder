import React, { useState } from 'react';
import { Home, Users, Plus, Bell, Briefcase } from 'lucide-react';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { RealTimeMobileNetwork } from './RealTimeMobileNetwork';
import { MobileMessaging } from './MobileMessaging';
import { AIJobRecommendations } from './AIJobRecommendations';
import { LinkedInMobileHeader } from './LinkedInMobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'post' | 'notifications' | 'jobs'>('home');

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  const handleCreatePost = () => {
    navigate('/mobile/create-post');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <LinkedInMobileHeader />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && <EnhancedMobileFeed />}
        {activeTab === 'network' && <RealTimeMobileNetwork />}
        {activeTab === 'notifications' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <p className="text-muted-foreground">No new notifications</p>
          </div>
        )}
        {activeTab === 'jobs' && <AIJobRecommendations />}
      </div>

      {/* Bottom Navigation - LinkedIn Style */}
      <div className="bg-background border-t border-border/50 px-1 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'home' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'network' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">My Network</span>
          </button>

          <button
            onClick={handleCreatePost}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">Post</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'notifications' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-xs font-medium">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'jobs' 
                ? 'text-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs font-medium">Jobs</span>
          </button>
        </div>
      </div>
    </div>
  );
};