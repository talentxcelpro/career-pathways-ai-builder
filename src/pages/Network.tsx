
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkNavbar } from "@/components/network/NetworkNavbar";
import { NetworkSidebar } from "@/components/network/NetworkSidebar";
import { EnhancedFeed } from "@/components/network/EnhancedFeed";
import { RightSidebar } from "@/components/network/RightSidebar";
import { EnhancedConnections } from "@/components/network/EnhancedConnections";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { NewPostFloater } from "@/components/network/NewPostFloater";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";
import { LinkedInMobileFeed } from "@/components/mobile/LinkedInMobileFeed";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useLinkedInFeed } from "@/hooks/useLinkedInFeed";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { TrendingUp, Users, UserPlus, Sparkles } from "lucide-react";
import { updateMetaTags } from '@/utils/metaTags';

const Network = () => {
  const { isMobile } = useMobileDetection();
  const { user } = useAuth();
  
  const {
    posts,
    loading,
    error,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleConnect,
    handleApply
  } = useLinkedInFeed();

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

  // Mobile LinkedIn-style interface
  if (isMobile && user) {
    return (
      <MobileLayout>
        <LinkedInMobileFeed
          posts={posts}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onComment={handleComment}
          onConnect={handleConnect}
          onApply={handleApply}
        />
      </MobileLayout>
    );
  }

  // Desktop interface - LinkedIn-like layout
  return (
    <div className="min-h-screen bg-muted/20 font-system">
      {/* Navigation Bar */}
      <NetworkNavbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <NetworkSidebar />
          </div>
          
          {/* Main Feed */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/80 backdrop-blur-sm border border-border/60 rounded-lg p-1">
                <TabsTrigger value="feed" className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Following</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Trending</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2 text-sm font-medium">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Network</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-0">
                <EnhancedFeed feedType="all" />
              </TabsContent>

              <TabsContent value="following" className="mt-0">
                <EnhancedFeed feedType="following" />
              </TabsContent>

              <TabsContent value="trending" className="mt-0">
                <EnhancedFeed feedType="trending" />
              </TabsContent>

              <TabsContent value="connections" className="mt-0">
                <React.Suspense fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                }>
                  <EnhancedConnections />
                </React.Suspense>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <NewPostFloater />
      <NetworkMessagingSidebar />
    </div>
  );
};

export default Network;
