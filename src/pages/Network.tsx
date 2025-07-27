import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { ConnectionRequests } from "@/components/network/ConnectionRequests";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";

import { Users, UserPlus, TrendingUp, MessageSquare, Sparkles, Home, Search, Zap } from "lucide-react";
import Posts from './network/Posts';
import { ReferralNetworkAd } from "@/components/referral/ReferralNetworkAd";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";

const Network = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="feed" className="w-full">
          <div className="border-b border-gray-200/30 mb-8">
            <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
              <TabsTrigger 
                value="feed" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Feed</span>
              </TabsTrigger>
              <TabsTrigger 
                value="smart-feed" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Smart Feed</span>
              </TabsTrigger>
              <TabsTrigger 
                value="connections" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Connections</span>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Search className="h-4 w-4" />
                <span className="font-medium">Discover</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai-connect" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span className="font-medium">AI Connect</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="mt-0">
            <Posts />
          </TabsContent>

          <TabsContent value="smart-feed" className="mt-0">
            <CareerContentHub />
          </TabsContent>

          <TabsContent value="connections" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Connection Requests</h2>
                <ConnectionRequests />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Discover People</h2>
                <ConnectionSuggestions />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Discover People</h2>
                <ConnectionSuggestions />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Advertisement</h2>
                <AdvertisingSidebar />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <NetworkStats />
          </TabsContent>

          <TabsContent value="ai-connect" className="mt-0">
            <SmartConnectAI />
          </TabsContent>
        </Tabs>

        {/* Persistent Messaging Sidebar */}
        <NetworkMessagingSidebar />
      </div>
    </div>
  );
};

export default Network;