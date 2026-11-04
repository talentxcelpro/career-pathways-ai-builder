import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { EnhancedSmartConnectAI } from "@/components/network/EnhancedSmartConnectAI";
import { GamificationDashboard } from "@/components/gamification/GamificationDashboard";
import { RealTimeReferralDashboard } from "@/components/referral/RealTimeReferralDashboard";
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
  BookOpen,
  Gamepad2
} from "lucide-react";
import Posts from './network/Posts';
const CareerVersePage = React.lazy(() => import('./CareerVersePage'));

import { CareerContentHub } from "@/components/social/CareerContentHub";
import { Discover } from './network/Discover';
import { CreatorStudio } from './network/CreatorStudio';
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
import { NetworkSidebarNav } from "@/components/network/NetworkSidebarNav";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Layers, LayoutGrid } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TalentXcelLogo } from "@/components/common/TalentXcelLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const Network: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'feed';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', value);
      return updated;
    }, { replace: true });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [postFilter, setPostFilter] = useState<'all' | 'latest' | 'trending' | 'following'>('all');
  const queryClient = useQueryClient();
  
  const handleRefreshFeed = () => {
    queryClient.invalidateQueries({ queryKey: ['network-feed'] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['sidebar-connection-suggestions'] });
    queryClient.invalidateQueries({ queryKey: ['enhanced-connection-suggestions'] });
  };
  
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
    <SEOHead 
      title="Professional Network | Connect with Professionals | TalentXcel" 
      description="Join the global professional talent network to connect with professionals, build your career identity, and discover opportunities on TalentXcel." 
      canonical="https://talentxcel.in/network" 
      type="website" 
    />
  );



  // Consistent responsive layout renderer ensuring 100% UI theme fidelity on both mobile & desktop
  const renderUniformLayout = (middleContent: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-3 sm:gap-3.5">
      {/* LEFT COLUMN: PROFILE CARD + QUICK METRICS (hidden on mobile, shown on md+) */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-3">
        <LinkedInStyleBanner profile={user?.user_metadata} isOwnProfile={true} />
        <NetworkSidebarNav activeTab={activeTab} onTabChange={handleTabChange} connectionCount={537} />
      </div>

      {/* MIDDLE COLUMN: ACTIVE MODULE CONTENT (full-width on mobile, col-span-6 on lg) */}
      <div className="col-span-12 md:col-span-8 lg:col-span-6 space-y-2.5">
        {middleContent}
      </div>

      {/* RIGHT COLUMN: YOUR PROFESSIONAL DAY BRIEFING + SPONSORED PRO (hidden on mobile, shown on lg+) */}
      <div className="hidden lg:block lg:col-span-3 space-y-3">
        {/* YOUR PROFESSIONAL DAY ADD-ON CARD */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-4 text-white shadow-md border border-blue-800/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              Daily Briefing
            </span>
          </div>

          <h3 className="font-extrabold text-sm text-white tracking-tight mt-1">
            Your Professional Day
          </h3>
          <p className="text-xs text-blue-200/90 leading-relaxed mt-1.5 mb-3.5">
            Intelligence, community recommendations and career momentum
          </p>

          <button
            onClick={() => handleTabChange('creator-studio')}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 group-hover:shadow-md cursor-pointer"
          >
            <span>Creator Studio</span>
            <span>&rarr;</span>
          </button>
        </div>

        <AdvertisingSidebar />
      </div>
    </div>
  );

  return (
    <MobileNavWrapper>
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
        {/* SUB-NAVIGATION PILL TAB BAR (ALL 9 MODULES IN SAME UNIFIED THEME)            */}
        {/* ============================================================================ */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* ============================================================================ */}
          {/* MOBILE ONLY: TOP APP BAR + HEADER SECTION (Exact match to Image 3)           */}
          {/* ============================================================================ */}
          <div className="md:hidden space-y-2 mb-2.5">
            {/* Top Navigation Bar: Hamburger ☰ | TalentXcel Brand | 🔍 Search | 🔔 Bell | Avatar */}
            <div className="flex items-center justify-between px-3 py-2 -mx-3 -mt-2.5 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="p-1 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-muted rounded-lg active:scale-95 transition-transform"
                  aria-label="Open Network Navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <TalentXcelLogo iconSize={22} textSize="text-base font-extrabold" theme="light" />
                  <span className="text-slate-400 font-normal text-xs tracking-tight">| Network</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('mobile-network-search-input');
                    el?.focus();
                  }}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted rounded-full transition-colors"
                  aria-label="Search network"
                >
                  <Search className="h-4 w-4" />
                </button>
                <div className="relative text-slate-600 dark:text-slate-300">
                  <NotificationBell />
                </div>
                <Avatar 
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  onClick={() => navigate('/profile/edit')}
                >
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-white font-extrabold text-[10px]">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Page Title Row: "Professional Network" + Subtitle + MODULES [⊞] Button */}
            <div className="flex items-center justify-between pt-0.5 px-0.5">
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Professional <span className="text-blue-600 dark:text-blue-500">Network</span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                  Connect • Share • Learn • Grow
                </p>
              </div>

              {/* Modules Drawer Trigger Button: MODULES [⊞] */}
              <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 font-bold text-xs shadow-2xs transition-all active:scale-95"
                    aria-label="Open Network Modules"
                  >
                    <span className="tracking-wide">MODULES</span>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-3 w-[85%] max-w-xs overflow-y-auto z-[100]">
                  <SheetHeader className="mb-2 text-left">
                    <SheetTitle className="text-xs font-extrabold flex items-center justify-between uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-blue-600" />
                        <span>Network Navigation</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <NetworkSidebarNav 
                    activeTab={activeTab} 
                    onTabChange={(tab) => {
                      handleTabChange(tab);
                      setMobileDrawerOpen(false);
                    }} 
                    connectionCount={537} 
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ============================================================================ */}
          {/* 1. TAB CONTENT: MAIN FEED                                                    */}
          {/* ============================================================================ */}
          <TabsContent value="feed" className="mt-0">
            {renderUniformLayout(
              <>
                {/* Global Search Bar (Pill shape rounded-full matching Image 3) */}
                <div className="relative bg-white dark:bg-card border border-slate-200/90 dark:border-border/60 rounded-full px-3 py-1.5 shadow-2xs flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground ml-0.5 shrink-0" />
                  <Input
                    id="mobile-network-search-input"
                    placeholder="Search posts, people, companies, jobs, hashtags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent text-xs font-medium placeholder:text-muted-foreground focus-visible:ring-0 h-6 p-0"
                  />
                  <Button variant="ghost" size="sm" className="rounded-full h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0">
                    <SlidersHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* Enhanced Create Post Card */}
                <EnhancedCreatePost />

                {/* Feed Controls Bar: All Posts | Trending | Following | 🔄 */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setPostFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${postFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-border/60 hover:bg-slate-50'}`}
                    >
                      All Posts
                    </button>
                    <button 
                      onClick={() => setPostFilter('trending')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${postFilter === 'trending' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-border/60 hover:bg-slate-50'}`}
                    >
                      Trending
                    </button>
                    <button 
                      onClick={() => setPostFilter('following')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${postFilter === 'following' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-border/60 hover:bg-slate-50'}`}
                    >
                      Following
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      title="Refresh feed"
                      onClick={handleRefreshFeed} 
                      className="rounded-lg h-7 w-7 p-0 border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs hover:bg-slate-50"
                    >
                      <RotateCw className="h-3 w-3 text-slate-600 dark:text-slate-300" />
                    </Button>
                  </div>
                </div>

                {/* Posts Feed */}
                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                }>
                  <Posts feedType={postFilter === 'following' ? 'connections' : (postFilter === 'latest' ? 'all' : postFilter)} searchTerm={searchTerm} />
                </React.Suspense>
              </>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 2. TAB CONTENT: SMART FEED                                                   */}
          {/* ============================================================================ */}
          <TabsContent value="smart-feed" className="mt-0">
            {renderUniformLayout(
              <>
                <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-foreground">Smart Connections Feed</h3>
                      <p className="text-[11px] text-muted-foreground">Showing prioritized posts exclusively from your accepted professional connections.</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-bold shrink-0">
                    Connection Curated
                  </Badge>
                </div>

                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                }>
                  <Posts feedType="connections" />
                </React.Suspense>
              </>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 3. TAB CONTENT: GAMIFICATION (CAREERVERSE / CAREER RPG - 100% MATCHING LIVE) */}
          {/* ============================================================================ */}
          <TabsContent value="gamification" className="mt-0">
            <React.Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white text-xs">Loading Career RPG...</div>}>
              <div className="w-full">
                <CareerVersePage />
              </div>
            </React.Suspense>
          </TabsContent>

          {/* ============================================================================ */}
          {/* 4. TAB CONTENT: REFER & EARN                                                 */}
          {/* ============================================================================ */}
          <TabsContent value="refer-and-earn" className="mt-0">
            {renderUniformLayout(
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Refer &amp; Earn...</div>}>
                <RealTimeReferralDashboard />
              </React.Suspense>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 5. TAB CONTENT: CONNECTIONS                                                  */}
          {/* ============================================================================ */}
          <TabsContent value="connections" className="mt-0">
            {renderUniformLayout(
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/60 shadow-xs gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-foreground">Professional Connections Hub</h3>
                      <p className="text-[11px] text-muted-foreground">Real-time accepted network members, followers, and active connection requests.</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/network/connections')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-7 px-3 rounded-lg shrink-0"
                  >
                    Manage Hub &rarr;
                  </Button>
                </div>

                <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Connections...</div>}>
                  <FollowingFollowersList />
                </React.Suspense>

                <div className="space-y-3 pt-2">
                  <React.Suspense fallback={null}>
                    <SubscriptionsManager />
                  </React.Suspense>
                  <React.Suspense fallback={null}>
                    <SocialNotifications />
                  </React.Suspense>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 6. TAB CONTENT: DISCOVER (CAREER HUB & ARTICLES - 100% MATCHING LIVE)       */}
          {/* ============================================================================ */}
          <TabsContent value="discover" className="mt-0">
            <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Discovery Hub...</div>}>
              <div className="w-full">
                <Discover isEmbedded={true} />
              </div>
            </React.Suspense>
          </TabsContent>

          {/* ============================================================================ */}
          {/* 7. TAB CONTENT: ANALYTICS                                                    */}
          {/* ============================================================================ */}
          <TabsContent value="analytics" className="mt-0">
            {renderUniformLayout(
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Network Analytics...</div>}>
                <NetworkAnalytics />
              </React.Suspense>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 8. TAB CONTENT: AI CONNECT                                                   */}
          {/* ============================================================================ */}
          <TabsContent value="ai-connect" className="mt-0">
            {renderUniformLayout(
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading AI Smart Connect...</div>}>
                <EnhancedSmartConnectAI />
              </React.Suspense>
            )}
          </TabsContent>

          {/* ============================================================================ */}
          {/* 9. TAB CONTENT: CREATOR STUDIO                                               */}
          {/* ============================================================================ */}
          <TabsContent value="creator-studio" className="mt-0">
            {renderUniformLayout(
              <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Creator Studio...</div>}>
                <CreatorStudio isEmbedded={true} />
              </React.Suspense>
            )}
          </TabsContent>

        </Tabs>

      </div>
      
      {/* Real-time Features & Messaging */}
      <UserPresence userId={user?.id} />
      <NetworkMessagingSidebar />

      </div>
    </MobileNavWrapper>
  );
};

export default Network;
