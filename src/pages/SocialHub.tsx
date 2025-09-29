import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { CareerGPTAssistant } from "@/components/social/CareerGPTAssistant";
import { GroupsHub } from "@/components/social/GroupsHub";
import { AdvancedSearchHub } from "@/components/social/AdvancedSearchHub";
import { NewsFeed } from "@/components/news/NewsFeed";
import { LiveStreamingHub } from "@/components/social/LiveStreamingHub";
import { AnalyticsDashboard } from "@/components/social/AnalyticsDashboard";
import { CreatorMonetizationHub } from "@/components/social/CreatorMonetizationHub";
import { VirtualSpacesHub } from "@/components/social/VirtualSpacesHub";
import { Users, BookOpen, Bot, Sparkles, Newspaper, Search, UsersIcon, Radio, BarChart3, DollarSign, Headphones } from "lucide-react";

export default function SocialHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Social & Learning Hub</h1>
        <p className="text-muted-foreground text-lg">
          Connect, learn, and grow your career with our community-driven platform.
        </p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 text-xs lg:text-sm">
          <TabsTrigger value="feed" className="flex items-center gap-1 lg:gap-2">
            <Users className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1 lg:gap-2">
            <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-1 lg:gap-2">
            <Newspaper className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1 lg:gap-2">
            <UsersIcon className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-1 lg:gap-2">
            <Search className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Search</span>
          </TabsTrigger>
          <TabsTrigger value="streaming" className="flex items-center gap-1 lg:gap-2">
            <Radio className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 lg:gap-2">
            <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center gap-1 lg:gap-2">
            <DollarSign className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Creator</span>
          </TabsTrigger>
          <TabsTrigger value="virtual" className="flex items-center gap-1 lg:gap-2">
            <Headphones className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">AR/VR</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-1 lg:gap-2">
            <Bot className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <ProfessionalFeed />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <CareerContentHub />
        </TabsContent>

        <TabsContent value="news" className="mt-6">
          <NewsFeed />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupsHub />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <AdvancedSearchHub />
        </TabsContent>

        <TabsContent value="streaming" className="mt-6">
          <LiveStreamingHub />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="monetization" className="mt-6">
          <CreatorMonetizationHub />
        </TabsContent>

        <TabsContent value="virtual" className="mt-6">
          <VirtualSpacesHub />
        </TabsContent>

        <TabsContent value="ai-assistant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Career AI Assistant
              </CardTitle>
              <p className="text-muted-foreground">
                Get personalized career advice, interview preparation, and skill recommendations from our AI assistant.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Assistant Available</h3>
                <p className="text-muted-foreground mb-4">
                  Click the assistant icon in the bottom right corner to start chatting with your AI career coach.
                </p>
              </div>
            </CardContent>
          </Card>
          <CareerGPTAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}