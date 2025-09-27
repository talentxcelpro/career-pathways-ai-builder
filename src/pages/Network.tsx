
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
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
import { LinkedInMobileFeed } from "@/components/mobile/LinkedInMobileFeed";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useLinkedInFeed } from "@/hooks/useLinkedInFeed";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { UserPresence } from "@/components/realtime/UserPresence";
import { VideoCallButton } from "@/components/network/VideoCallButton";
import { LiveEventCard } from "@/components/network/LiveEventCard";
import { GoogleOneTapStatus } from "@/components/auth/GoogleOneTapStatus";


const Network = () => {
  console.log('Network component rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Network Page Test</h1>
        <p className="text-muted-foreground">If you can see this, the Network component is rendering correctly.</p>
        <div className="mt-8 p-4 border rounded-lg">
          <p>This is a simplified version to test for rendering issues.</p>
          <p>The original complex component will be restored once we identify the problem.</p>
        </div>
      </div>
    </div>
  );
};

export default Network;
