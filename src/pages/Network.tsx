
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/branded/HeroSection";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { ConnectionRequests } from "@/components/network/ConnectionRequests";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { Users, Network as NetworkIcon, UserPlus, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import Posts from './network/Posts';

const Network = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* TalentXcel Hero Section */}
      <HeroSection
        title="Professional Network Hub"
        subtitle="Connect, collaborate, and accelerate your career with TalentXcel's AI-powered networking platform"
        showAIBadge={true}
        backgroundGradient={true}
      />

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-sm border shadow-sm rounded-xl p-1 mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ai-connect" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Connect</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="space-y-6">
              <Posts />
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ConnectionRequests />
              </div>
              <div className="space-y-6">
                <ProfessionalFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="space-y-6">
              <ConnectionSuggestions />
              <CareerContentHub />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="space-y-6">
              <NetworkStats />
            </div>
          </TabsContent>

          <TabsContent value="ai-connect" className="mt-0">
            <div className="space-y-6">
              <SmartConnectAI />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Network;
