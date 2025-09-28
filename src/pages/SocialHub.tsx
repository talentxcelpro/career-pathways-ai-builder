import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { CareerGPTAssistant } from "@/components/social/CareerGPTAssistant";
import { GroupsHub } from "@/components/social/GroupsHub";
import { AdvancedSearchHub } from "@/components/social/AdvancedSearchHub";
import { NewsFeed } from "@/components/news/NewsFeed";
import { Users, BookOpen, Bot, Sparkles, Newspaper, Search, UsersIcon } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Professional Feed
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Career Content
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Assistant
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