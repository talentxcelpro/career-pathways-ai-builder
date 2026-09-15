import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Target, Shield, Users, BarChart } from 'lucide-react';
import CareerIntelligenceDashboard from '@/components/ai/CareerIntelligenceDashboard';
import EnhancedCareerAnalytics from '@/components/ai/EnhancedCareerAnalytics';
import IndustryBenchmarking from '@/components/ai/IndustryBenchmarking';
import CareerCredibilityScore from '@/components/ai/CareerCredibilityScore';
import NetworkingIntelligence from '@/components/ai/NetworkingIntelligence';
import RealTimeCareerIntelligence from '@/components/ai/RealTimeCareerIntelligence';
import { updateMetaTags } from '@/utils/metaTags';

const ComprehensiveCareerIntelligence: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Comprehensive Career Intelligence - TalentXcel | AI-Powered Career Analytics',
      description: 'Access comprehensive AI-powered career intelligence including real-time market data, credibility scoring, networking insights, and personalized career recommendations.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Main Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Comprehensive Career Intelligence
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Advanced AI-powered career analytics and real-time market intelligence
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI Dashboard</h3>
                <p className="text-xs text-muted-foreground">Real-time career intelligence</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Market Analytics</h3>
                <p className="text-xs text-muted-foreground">Live market data and trends</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <BarChart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Benchmarking</h3>
                <p className="text-xs text-muted-foreground">Industry and competitor analysis</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Credibility Score</h3>
                <p className="text-xs text-muted-foreground">Professional scoring system</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Networking</h3>
                <p className="text-xs text-muted-foreground">Strategic connection insights</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Career Paths</h3>
                <p className="text-xs text-muted-foreground">Personalized career roadmaps</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Intelligence Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
              <span className="md:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">Path</span>
            </TabsTrigger>
            <TabsTrigger value="benchmarking" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Benchmarking</span>
              <span className="md:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="credibility" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Credibility</span>
              <span className="md:hidden">Score</span>
            </TabsTrigger>
            <TabsTrigger value="networking" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Networking</span>
              <span className="md:hidden">Network</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Real-Time</span>
              <span className="md:hidden">Live</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <CareerIntelligenceDashboard />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <EnhancedCareerAnalytics />
          </TabsContent>
          
          <TabsContent value="benchmarking" className="mt-6">
            <IndustryBenchmarking />
          </TabsContent>
          
          <TabsContent value="credibility" className="mt-6">
            <CareerCredibilityScore />
          </TabsContent>
          
          <TabsContent value="networking" className="mt-6">
            <NetworkingIntelligence />
          </TabsContent>
          
          <TabsContent value="realtime" className="mt-6">
            <RealTimeCareerIntelligence />
          </TabsContent>
        </Tabs>

        {/* Advanced Features Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">
                🚀 Next-Generation Career Intelligence
              </h3>
              <p className="text-muted-foreground mb-4 max-w-3xl mx-auto">
                This comprehensive career intelligence platform provides real-time market analysis, 
                AI-powered insights, professional credibility scoring, and strategic networking intelligence 
                to accelerate your career growth with data-driven decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 Real-Time Market Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Live salary trends, skills demand, and industry growth metrics
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold mb-2">🧠 AI-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalized career recommendations and strategic guidance
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold mb-2">🏆 Professional Scoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantified credibility assessment and improvement roadmap
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveCareerIntelligence;