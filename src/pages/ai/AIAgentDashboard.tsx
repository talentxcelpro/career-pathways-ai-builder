import React, { useState } from 'react';
import TalentXcelAIChat from '@/components/ai/TalentXcelAIChat';
import { EnhancedAICareerIntelligence } from '@/components/ai/EnhancedAICareerIntelligence';
import { ProactiveNotificationSystem } from '@/components/ai/ProactiveNotificationSystem';
import { AdvancedAIPersonalization } from '@/components/ai/AdvancedAIPersonalization';
import { EnhancedAnalyticsDashboard } from '@/components/analytics/EnhancedAnalyticsDashboard';
import { PremiumNetworkingFeatures } from '@/components/social/PremiumNetworkingFeatures';
import { AICareerCopilot } from '@/components/ai/AICareerCopilot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/metaTags';
import { Brain, MessageSquare, TrendingUp, Zap, Users } from 'lucide-react';

const AIAgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel AI - Your AI-Powered Career Assistant | TalentXcel',
      description: 'Advanced AI assistant for career growth, intelligent job matching, resume optimization, interview prep, and personalized career insights.'
    });
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Enhanced Tab Navigation */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-transparent">
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="networking" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0">
            <TalentXcelAIChat />
          </TabsContent>
          
          <TabsContent value="intelligence" className="h-full m-0 overflow-y-auto">
            <EnhancedAICareerIntelligence />
          </TabsContent>
          
          <TabsContent value="personalization" className="h-full m-0 overflow-y-auto p-6">
            <AdvancedAIPersonalization />
          </TabsContent>
          
          <TabsContent value="analytics" className="h-full m-0 overflow-y-auto p-6">
            <EnhancedAnalyticsDashboard />
          </TabsContent>
          
          <TabsContent value="networking" className="h-full m-0 overflow-y-auto p-6">
            <PremiumNetworkingFeatures />
          </TabsContent>
        </div>
      </Tabs>

      {/* Proactive notification system */}
      <ProactiveNotificationSystem />
      
      {/* AI Career Copilot */}
      <AICareerCopilot />
    </div>
  );
};

export default AIAgentDashboard;