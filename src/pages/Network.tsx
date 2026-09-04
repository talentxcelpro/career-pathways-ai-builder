import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { EnhancedSmartConnectAI } from "@/components/network/EnhancedSmartConnectAI";
import { 
  Users, 
  Sparkles, 
  Trophy, 
  Gift, 
  UserPlus, 
  TrendingUp, 
  MessageSquare, 
  Search, 
  SlidersHorizontal,
  RotateCw,
  ChevronDown,
  Globe
} from "lucide-react";
import Posts from './network/Posts';
import { updateMetaTags } from '@/utils/metaTags';
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";
import { LinkedInMobileFeed } from "@/components/mobile/LinkedInMobileFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLinkedInFeed } from "@/hooks/useLinkedInFeed";
import { useAuth } from "@/contexts/AuthContext";
import { MobileNavWrapper } from "@/components/layout/MobileNavWrapper";
import { UserPresence } from "@/components/realtime/UserPresence";
import { GoogleOneTapStatus } from "@/components/auth/GoogleOneTapStatus";
import { FollowingFollowersList } from "@/components/social/FollowingFollowersList";
import { SubscriptionsManager } from "@/components/social/SubscriptionsManager";
import { SocialNotifications } from "@/components/social/SocialNotifications";
import { useRealtimeSocialUpdates } from "@/hooks/useRealtimeSocialUpdates";
import { LinkedInStyleBanner } from "@/components/profile/LinkedInStyleBanner";
import { EnhancedCreatePost } from "@/components/posts/EnhancedCreatePost";

const Network: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'feed';
  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', value);
      return updated;
    }, { replace: true });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [postFilter, setPostFilter] = useState<'all' | 'latest' | 'trending'>('all');
  
  // Enable real-time social updates
  useRealtimeSocialUpdates();
  
  const {
    posts,
    loading,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleConnect,
    handleApply,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useLinkedInFeed();

  const seoHelmet = (
    <Helmet>
      <title>Universal Career Network | TalentXcel — Connect, Share &amp; Grow</title>
      <meta name="description" content="Connect with industry peers, share career insights, discover job opportunities, and build your professional presence on TalentXcel." />
      <meta name="keywords" content="professional network, career network india, tech community, professional connections, industry mentors, talentxcel network" />
      <link rel="canonical" href="https://talentxcel.in/network" />
      <meta property="og:title" content="Universal Career Network | TalentXcel" />
      <meta property="og:description" content="Connect with industry peers, share career insights, and discover verified career opportunities on TalentXcel." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://talentxcel.in/network" />
      <meta property="og:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Universal Career Network | TalentXcel" />
      <meta name="twitter:description" content="Connect with industry peers, share career insights, and discover opportunities on TalentXcel." />
      <meta name="twitter:image" content="https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" />
    </Helmet>
  );

  // Mobile interface
  if (isMobile && user) {
    return (
      <MobileNavWrapper>
        {seoHelmet}
        <LinkedInMobileFeed
          posts={posts}
          loading={loading}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onComment={handleComment}
          onConnect={handleConnect}
          onApply={handleApply}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </MobileNavWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 pb-20">
      {seoHelmet}
      
      {/* One Tap Sign In Status for guests */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <GoogleOneTapStatus />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5">

        {/* ============================================================================ */}
        {/* 1. SUB-NAVIGATION PILL TAB BAR (COMPACT PADDING & MARGINS) */}
        {/* ============================================================================ */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          
          <div className="bg-white/80 dark:bg-card backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-border/60 p-1 shadow-xs mb-2.5 overflow-x-auto no-scrollbar">
            <TabsList className="flex items-center gap-1 bg-transparent h-auto p-0">
              
              <TabsTrigger 
                value="feed" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feed</span>
              </TabsTrigger>

              <TabsTrigger 
                value="smart-feed" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500 data-[state=active]:text-white" />
                <span>Smart Feed</span>
              </TabsTrigger>

              <button
                onClick={() => navigate('/gamification')}
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Gamification</span>
              </button>

              <button
                onClick={() => navigate('/refer-and-earn')}
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5 text-pink-500" />
                <span>Refer &amp; Earn</span>
              </button>

              <TabsTrigger 
                value="connections" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-500 data-[state=active]:text-white" />
                <span>Connections</span>
              </TabsTrigger>

              <TabsTrigger 
                value="discover" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-500 data-[state=active]:text-white" />
                <span>Discover</span>
              </TabsTrigger>

              <TabsTrigger 
                value="analytics" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500 data-[state=active]:text-white" />
                <span>Analytics</span>
              </TabsTrigger>

              <TabsTrigger 
                value="ai-connect" 
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xs text-slate-700 dark:text-slate-300 hover:text-foreground flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 data-[state=active]:text-white" />
                <span>AI Connect</span>
              </TabsTrigger>

            </TabsList>
          </div>

          {/* ============================================================================ */}
          {/* TAB CONTENT: FEED (MAIN 3-COLUMN LAYOUT MATCHING MOCKUP 1:1) */}
          {/* ============================================================================ */}
          <TabsContent value="feed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-3 sm:gap-3.5">

              {/* LEFT COLUMN: PROFILE CARD + NAVIGATION MENU */}
              <div className="md:col-span-4 lg:col-span-3 space-y-3">
                <LinkedInStyleBanner profile={user?.user_metadata} isOwnProfile={true} />
              </div>

              {/* MIDDLE COLUMN: GLOBAL SEARCH, ENHANCED CREATE POST & FEED */}
              <div className="md:col-span-8 lg:col-span-6 space-y-2.5">
                
                {/* 1. Global Search Bar matching mockup */}
                <div className="relative bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl p-1 shadow-xs flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />
                  <Input
                    placeholder="Search posts, people, companies, jobs, hashtags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent text-xs font-semibold placeholder:text-muted-foreground focus-visible:ring-0 h-6.5"
                  />
                  <Button variant="ghost" size="sm" className="rounded-lg h-6.5 w-6.5 p-0 text-muted-foreground hover:text-foreground shrink-0">
                    <SlidersHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* 2. Enhanced Create Post Card matching mockup (compact by default) */}
                <EnhancedCreatePost />

                {/* 3. Feed Controls Bar matching mockup */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-card px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-border/60 shadow-xs cursor-pointer">
                    <span>All Posts</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-card px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-border/60 shadow-xs cursor-pointer">
                      <span>Latest</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()} 
                      className="rounded-lg h-7 w-7 p-0 border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs"
                    >
                      <RotateCw className="h-3 w-3 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </div>
                </div>

                {/* 4. Posts Feed */}
                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                }>
                  <Posts feedType="all" />
                </React.Suspense>

              </div>

              {/* RIGHT COLUMN: PRO SPONSORED CARDS & PEOPLE YOU MAY KNOW */}
              <div className="md:col-span-12 lg:col-span-3 space-y-3">
                <AdvertisingSidebar />
              </div>

            </div>
          </TabsContent>

          {/* TAB CONTENT: SMART FEED */}
          <TabsContent value="smart-feed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-3 sm:gap-3.5">
              <div className="md:col-span-4 lg:col-span-3 space-y-3">
                <LinkedInStyleBanner profile={user?.user_metadata} isOwnProfile={true} />
              </div>
              <div className="md:col-span-8 lg:col-span-6 space-y-2.5">
                <Posts feedType="connections" />
              </div>
              <div className="md:col-span-12 lg:col-span-3 space-y-3">
                <AdvertisingSidebar />
              </div>
            </div>
          </TabsContent>

          {/* TAB CONTENT: CONNECTIONS */}
          <TabsContent value="connections" className="mt-0 space-y-4">
            {/* Quick Hub Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/60 shadow-xs gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Professional Connections Hub</h3>
                  <p className="text-xs text-muted-foreground">Manage your connections, pending invitations, and message peers in real time.</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/network/connections')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
              >
                Open Full Connections Hub &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <React.Suspense fallback={<div className="p-8 text-center">Loading Connections...</div>}>
                  <FollowingFollowersList />
                </React.Suspense>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <React.Suspense fallback={<div className="p-8 text-center">Loading Subscriptions...</div>}>
                  <SubscriptionsManager />
                </React.Suspense>
                <React.Suspense fallback={<div className="p-8 text-center">Loading Notifications...</div>}>
                  <SocialNotifications />
                </React.Suspense>
              </div>
            </div>
          </TabsContent>

          {/* TAB CONTENT: DISCOVER */}
          <TabsContent value="discover" className="mt-0">
            <React.Suspense fallback={<div className="p-8 text-center">Loading Discover...</div>}>
              <CareerContentHub />
            </React.Suspense>
          </TabsContent>

          {/* TAB CONTENT: ANALYTICS */}
          <TabsContent value="analytics" className="mt-0">
            <React.Suspense fallback={<div className="p-8 text-center">Loading Analytics...</div>}>
              <NetworkAnalytics />
            </React.Suspense>
          </TabsContent>

          {/* TAB CONTENT: AI CONNECT */}
          <TabsContent value="ai-connect" className="mt-0">
            <React.Suspense fallback={<div className="p-8 text-center">Loading AI Connect...</div>}>
              <EnhancedSmartConnectAI />
            </React.Suspense>
          </TabsContent>

        </Tabs>

      </div>
      
      {/* Real-time Features & Messaging */}
      <UserPresence userId={user?.id} />
      <NetworkMessagingSidebar />

    </div>
  );
};

export default Network;
