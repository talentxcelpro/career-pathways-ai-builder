import React, { useState } from 'react';
import TalentXcelAIChat from '@/components/ai/TalentXcelAIChat';
import { EnhancedAICareerIntelligence } from '@/components/ai/EnhancedAICareerIntelligence';
import { ProactiveNotificationSystem } from '@/components/ai/ProactiveNotificationSystem';
import { AdvancedAIPersonalization } from '@/components/ai/AdvancedAIPersonalization';
import EnhancedCareerAnalyticsCommandCenter from '@/components/ai/EnhancedCareerAnalytics';
import { PremiumNetworkingFeatures } from '@/components/social/PremiumNetworkingFeatures';
import { TalentXcelNavigatorWidget } from '@/components/ai/AICareerNavigator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/metaTags';
import { MessageSquare, TrendingUp, Zap, Users, Sparkles, Brain, Activity, Shield } from 'lucide-react';

const AIAgentCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel AI Hub - Strategic Professional Intelligence | TalentXcel',
      description: 'Advanced TalentXcel AI Hub for career growth, Strategic Matching, performance optimization, and personalized Professional Intelligence signals.'
    });
  }, []);

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col edge-to-edge">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Premium Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-50 px-6">
          <TabsList className="flex items-center justify-start h-20 bg-transparent gap-8">
            <TabsTrigger value="chat" className="h-12 px-6 rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Navigator</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="h-12 px-6 rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Intelligence Engine</span>
            </TabsTrigger>
            <TabsTrigger value="personalization" className="h-12 px-6 rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Performance Signals</span>
            </TabsTrigger>
            <TabsTrigger value="career-analytics" className="h-12 px-6 rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Analytics Hub</span>
            </TabsTrigger>
            <TabsTrigger value="networking" className="h-12 px-6 rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Ecosystem Hub</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Intelligence Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />
          
          <TabsContent value="chat" className="h-full m-0 relative z-10">
            <TalentXcelAIChat />
          </TabsContent>
          
          <TabsContent value="intelligence" className="h-full m-0 overflow-y-auto relative z-10 pb-32">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <EnhancedAICareerIntelligence />
            </div>
          </TabsContent>
          
          <TabsContent value="personalization" className="h-full m-0 overflow-y-auto relative z-10 pb-32">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <AdvancedAIPersonalization />
            </div>
          </TabsContent>
          
          <TabsContent value="career-analytics" className="h-full m-0 overflow-y-auto relative z-10 pb-32">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <EnhancedCareerAnalyticsCommandCenter />
            </div>
          </TabsContent>
          
          <TabsContent value="networking" className="h-full m-0 overflow-y-auto relative z-10 pb-32">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <PremiumNetworkingFeatures />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Proactive notification system */}
      <ProactiveNotificationSystem />
      
      {/* Strategic AI Navigator */}
      <TalentXcelNavigatorWidget />
    </div>
  );
};

export default AIAgentCommandCenter;
