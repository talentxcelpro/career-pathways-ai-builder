
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { GiantAppWrapper, FastLoadSection } from "@/components/performance/GiantAppWrapper";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { NewsFeed } from "@/components/news/NewsFeed";
import { EnhancedNewsFeed } from "@/components/news/EnhancedNewsFeed";
import { LiveEventsFeed } from "@/components/network/LiveEventsFeed";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { EnhancedSmartConnectAI } from "@/components/network/EnhancedSmartConnectAI";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { EnhancedConnections } from "@/components/network/EnhancedConnections";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { Users, UserPlus, TrendingUp, MessageSquare, Sparkles, Newspaper, Trophy, Gift } from "lucide-react";
import Posts from './network/Posts';
import { updateMetaTags } from '@/utils/metaTags';
import { ReferralNetworkAd } from "@/components/referral/ReferralNetworkAd";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";
import { EnhancedMobileFeed } from "@/components/mobile/EnhancedMobileFeed";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useLinkedInFeed } from "@/hooks/useLinkedInFeed";
import { useAuth } from "@/contexts/AuthContext";
import { MobileNavWrapper } from "@/components/layout/MobileNavWrapper";
import { UserPresence } from "@/components/realtime/UserPresence";
import { VideoCallButton } from "@/components/network/VideoCallButton";
import { LiveEventCard } from "@/components/network/LiveEventCard";
import { GoogleOneTapStatus } from "@/components/auth/GoogleOneTapStatus";
import { FollowingFollowersList } from "@/components/social/FollowingFollowersList";
import { SubscriptionsManager } from "@/components/social/SubscriptionsManager";
import { SocialNotifications } from "@/components/social/SocialNotifications";
import { useRealtimeSocialUpdates } from "@/hooks/useRealtimeSocialUpdates";
import { useOptimizedPosts } from "@/hooks/useOptimizedPerformance";


const Network = () => {
  const { isMobile } = useMobileDetection();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts: optimizedPosts, loading: optimizedLoading, error: optimizedError, invalidateCache } = useOptimizedPosts();
  
  // Enable real-time social updates with performance optimization
  useRealtimeSocialUpdates();
  
  const {
    posts: fallbackPosts,
    loading: fallbackLoading,
    error: fallbackError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleConnect,
    handleApply
  } = useLinkedInFeed();

  // Use optimized posts when available, fallback to original feed
  const posts = optimizedPosts && optimizedPosts.length > 0 ? optimizedPosts : fallbackPosts;
  const loading = optimizedLoading && fallbackLoading;
  const error = optimizedError || fallbackError;

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

  // Mobile interface - use lightweight component to prevent memory issues
  if (isMobile && user) {
    return (
      <MobileNavWrapper>
        <div className="h-full flex flex-col bg-background relative">
          {/* Header */}
          <div className="bg-background border-b border-border/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">TalentXcel</h1>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {/* Simplified Mobile Feed */}
          <div className="flex-1 overflow-hidden">
            <React.Suspense fallback={<div className="p-6">Loading...</div>}>
              <EnhancedMobileFeed />
            </React.Suspense>
          </div>
        </div>
      </MobileNavWrapper>
    );
  }

  // Desktop interface with giant app performance optimization
  return (
    <GiantAppWrapper preloadRoute="/network">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 mobile-optimized">
      {/* One Tap Sign In Status - Show at top for guest users */}
      {!user && (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4">
          <GoogleOneTapStatus />
        </div>
      )}
      
      {/* Main Content with Mobile-First Tabs */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-1">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="flex w-full bg-card/90 backdrop-blur-md border-0 shadow-apple rounded-apple p-0.5 mb-1 h-8 sm:h-7 overflow-x-auto touch-pan-x">
            <TabsTrigger value="feed" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1.5 px-2 sm:py-1 whitespace-nowrap font-apple-medium min-h-[44px] sm:min-h-auto touch-target">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="smart-feed" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Smart Feed</span>
            </TabsTrigger>
            <button
              onClick={() => navigate('/gamification')}
              className="flex items-center gap-1 bg-transparent hover:bg-primary/8 rounded-apple-sm transition-apple text-xs py-1 px-2 text-foreground hover:text-primary whitespace-nowrap font-apple-medium"
            >
              <Trophy className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Gamification</span>
            </button>
            <button
              onClick={() => navigate('/refer-and-earn')}
              className="flex items-center gap-1 bg-transparent hover:bg-primary/8 rounded-apple-sm transition-apple text-xs py-1 px-2 text-foreground hover:text-primary whitespace-nowrap font-apple-medium"
            >
              <Gift className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Refer & Earn</span>
            </button>
            <TabsTrigger value="connections" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <UserPlus className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ai-connect" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">AI Connect</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-apple-sm transition-apple text-xs py-1 px-2 whitespace-nowrap font-apple-medium">
              <Newspaper className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">News</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <FastLoadSection priority="high" cacheKey="network-feed">
              <div className="space-y-6 text-gray-900">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Posts feedType="all" optimizedPosts={optimizedPosts} loading={loading} error={error} />
                </React.Suspense>
              </div>
            </FastLoadSection>
          </TabsContent>

          <TabsContent value="smart-feed" className="mt-0">
            <FastLoadSection priority="medium" cacheKey="smart-feed">
              <div className="space-y-6 text-gray-900">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Posts feedType="connections" optimizedPosts={optimizedPosts} loading={loading} error={error} />
                </React.Suspense>
              </div>
            </FastLoadSection>
          </TabsContent>


          <TabsContent value="connections" className="mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <FollowingFollowersList />
              </React.Suspense>
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <SubscriptionsManager />
              </React.Suspense>
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <SocialNotifications />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="text-gray-900">
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <CareerContentHub />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <NetworkAnalytics />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="ai-connect" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <EnhancedSmartConnectAI />
              </React.Suspense>
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-0">
            <div className="space-y-6 text-gray-900">
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }>
                <EnhancedNewsFeed showHero={true} />
              </React.Suspense>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      
      {/* Real-time Features */}
      <UserPresence userId={user?.id} />
      
      {/* Floating Messaging Sidebar */}
      <NetworkMessagingSidebar />
      
      {/* Mobile Bottom Navigation */}
      <div className="h-20 lg:h-0" /> {/* Spacer for mobile nav */}
      </div>
    </GiantAppWrapper>
  );
};

export default Network;
