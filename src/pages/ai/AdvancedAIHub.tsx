import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Target, MessageSquare, Globe, Zap } from 'lucide-react';
import EnhancedCareerAnalytics from '@/components/ai/EnhancedCareerAnalytics';
import IndustryBenchmarking from '@/components/ai/IndustryBenchmarking';
import CareerCredibilityScore from '@/components/ai/CareerCredibilityScore';
import NetworkingIntelligence from '@/components/ai/NetworkingIntelligence';
import AICareerCoach from '@/components/ai/AICareerCoach';
import VoiceCareerCoach from '@/components/ai/VoiceCareerCoach';
import WebRTCVoiceCoach from '@/components/ai/WebRTCVoiceCoach';
import { updateMetaTags } from '@/utils/metaTags';

const AdvancedAIHub: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Advanced AI Career Hub - TalentXcel | AI-Powered Career Intelligence',
      description: 'Access advanced AI features including predictive analytics, intelligent job matching, AI career coaching, and market intelligence for accelerated career growth.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Advanced AI Career Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Next-generation AI tools for intelligent career development
              </p>
            </div>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Predictive Analytics</h3>
                <p className="text-xs text-muted-foreground">AI-powered career trajectory forecasting</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Smart Job Matching</h3>
                <p className="text-xs text-muted-foreground">Intelligent job recommendations with ML</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI Career Coach</h3>
                <p className="text-xs text-muted-foreground">Personalized career guidance and mentoring</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Market Intelligence</h3>
                <p className="text-xs text-muted-foreground">Real-time market trends and insights</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tools Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Matching</span>
              <span className="md:hidden">🎯</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Text Chat</span>
              <span className="md:hidden">💬</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Voice WS</span>
              <span className="md:hidden">🎤</span>
            </TabsTrigger>
            <TabsTrigger value="webrtc" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">WebRTC</span>
              <span className="md:hidden">📞</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden md:inline">Intel</span>
              <span className="md:hidden">🌐</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-6">
            <EnhancedCareerAnalytics />
          </TabsContent>
          
          <TabsContent value="matching" className="mt-6">
            <IndustryBenchmarking />
          </TabsContent>
          
          <TabsContent value="coach" className="mt-6">
            <AICareerCoach />
          </TabsContent>
          
          <TabsContent value="voice" className="mt-6">
            <VoiceCareerCoach />
          </TabsContent>
          
          <TabsContent value="webrtc" className="mt-6">
            <WebRTCVoiceCoach />
          </TabsContent>
          
          <TabsContent value="intelligence" className="mt-6">
            <NetworkingIntelligence />
          </TabsContent>
        </Tabs>

        {/* Quick Access Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Unlock Full AI Potential
                </h3>
                <p className="text-muted-foreground">
                  Upgrade to Pro or Enterprise to access unlimited AI features, advanced analytics, and priority support.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAIHub;