
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { EnhancedConnections } from "@/components/network/EnhancedConnections";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { EmailTestButton } from "@/components/EmailTestButton";
import { Users, UserPlus, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import Posts from './network/Posts';
import { updateMetaTags } from '@/utils/metaTags';
import { ReferralNetworkAd } from "@/components/referral/ReferralNetworkAd";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";
import { ReelsFeed } from "@/components/mobile/ReelsFeed";
import { ReelsHeader } from "@/components/mobile/ReelsHeader";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useReelsFeed } from "@/hooks/useReelsFeed";
import { useAuth } from "@/contexts/AuthContext";

const Network = () => {
  const { isMobile } = useMobileDetection();
  const { user } = useAuth();
  const [reelsTab, setReelsTab] = useState<'following' | 'explore'>('explore');
  
  const {
    posts,
    loading,
    error,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleFollow,
    handleApply
  } = useReelsFeed(reelsTab);

  // SEO meta tags and structured data
  React.useEffect(() => {
    updateMetaTags({
      title: 'Professional Network | Connect with Industry Experts | TalentXcel',
      description: 'Build your professional network. Connect with industry experts, join professional groups, attend virtual events, and advance your career through meaningful connections.',
      url: `${window.location.origin}/network`,
      keywords: ['professional networking', 'industry experts', 'career networking', 'professional connections', 'industry events', 'career growth'],
      type: 'website',
      image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    });

    // Add SocialMediaPosting structured data
    const networkSchema = {
      "@context": "https://schema.org/",
      "@type": "SocialMediaPosting",
      "headline": "Professional Networking Platform",
      "url": `${window.location.origin}/network`,
      "description": "Connect with professionals, share insights, and grow your career network",
      "author": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(networkSchema);
    script.id = 'network-schema';
    
    const existing = document.getElementById('network-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('network-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  // Mobile Reels-style interface
  if (isMobile && user) {
    return (
      <div className="fixed inset-0 bg-black">
        <ReelsHeader
          activeTab={reelsTab}
          onTabChange={setReelsTab}
          onSearch={() => console.log('Search')}
          onNotifications={() => console.log('Notifications')}
          onMessages={() => console.log('Messages')}
          notificationCount={3}
          messageCount={5}
        />
        <ReelsFeed
          posts={posts}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onComment={handleComment}
          onFollow={handleFollow}
          onApply={handleApply}
        />
      </div>
    );
  }

  // Desktop interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-card/80 backdrop-blur-sm border shadow-sm rounded-md p-0.5 mb-0 h-8">
            <TabsTrigger value="feed" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="smart-feed" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Smart Feed</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <UserPlus className="w-3 h-3" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ai-connect" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-all text-xs py-1 px-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">AI Connect</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <Posts feedType="all" />
            </div>
          </TabsContent>

          <TabsContent value="smart-feed" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <Posts feedType="smart" />
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-0">
            <EnhancedConnections />
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="text-gray-900">
              <CareerContentHub />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <NetworkAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="ai-connect" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <SmartConnectAI />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Messaging Sidebar */}
      <NetworkMessagingSidebar />
    </div>
  );
};

export default Network;
