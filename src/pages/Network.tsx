import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { ConnectionRequests } from "@/components/network/ConnectionRequests";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { NetworkPageWrapper } from "@/components/network/NetworkPageWrapper";
import { Users, UserPlus, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import Posts from './network/Posts';
import { ReferralNetworkAd } from "@/components/referral/ReferralNetworkAd";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";

const Network = () => {
  return (
    <NetworkPageWrapper>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-900">
              <div className="lg:col-span-2 space-y-6">
                <ConnectionRequests />
                <ConnectionSuggestions />
              </div>
              <div className="space-y-6">
                <ReferralNetworkAd variant="sidebar" />
                <AdvertisingSidebar position="right" maxAds={3} />
              </div>
            </div>
          </TabsContent>

            <TabsContent value="discover" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-900">
                <div className="lg:col-span-2 space-y-6">
                  <ConnectionSuggestions />
                  <CareerContentHub />
                </div>
                <div className="space-y-6">
                  <ReferralNetworkAd variant="sidebar" />
                  <AdvertisingSidebar position="right" maxAds={3} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="space-y-6 text-gray-900">
                <NetworkStats />
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
    </NetworkPageWrapper>
  );
};

export default Network;