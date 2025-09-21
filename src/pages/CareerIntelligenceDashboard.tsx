import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  Zap,
  Clock,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CareerAnalytics } from '@/components/analytics/CareerAnalytics';
import { RealTimeCareerDashboard } from '@/components/analytics/RealTimeCareerDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const CareerIntelligenceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Here you would typically refresh data from your analytics API
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your career analytics report is being generated..."
    });
  };

  const handleShareDashboard = async () => {
    try {
      await navigator.share({
        title: 'My Career Analytics Dashboard',
        text: 'Check out my career progression analytics on TalentXcel',
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Dashboard link copied to clipboard"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access your career analytics dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Career Intelligence Dashboard - Real-Time Analytics | TalentXcel</title>
        <meta 
          name="description" 
          content="Monitor your career progression with real-time analytics, market insights, and AI-powered recommendations for accelerated professional growth." 
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Career Intelligence Dashboard
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Real-time insights into your professional growth
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareDashboard}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Career Score</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">85/100</div>
                    <Badge variant="secondary" className="mt-1">Elite Tier</Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Growth Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">+23%</div>
                    <Badge variant="secondary" className="mt-1">This Month</Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Market Rank</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">Top 15%</div>
                    <Badge variant="secondary" className="mt-1">In Your Field</Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Opportunities</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <Badge variant="secondary" className="mt-1">AI Matched</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Dashboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="realtime" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="realtime" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-Time
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="benchmarks" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Benchmarks
                </TabsTrigger>
              </TabsList>

              {/* Real-Time Dashboard */}
              <TabsContent value="realtime" className="space-y-6">
                <RealTimeCareerDashboard />
              </TabsContent>

              {/* Detailed Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <CareerAnalytics userId={user.id} />
              </TabsContent>

              {/* AI Insights */}
              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Career Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                          <h3 className="font-semibold text-blue-900 mb-2">
                            🎯 Skill Development Priority
                          </h3>
                          <p className="text-sm text-blue-800">
                            Focus on advancing your TypeScript skills to Senior level. 
                            Market demand shows 34% higher salary potential.
                          </p>
                        </div>
                        
                        <div className="p-4 border border-green-200 rounded-lg bg-green-50/50">
                          <h3 className="font-semibold text-green-900 mb-2">
                            📈 Career Opportunity
                          </h3>
                          <p className="text-sm text-green-800">
                            Your profile matches 92% with Senior Frontend roles. 
                            Consider applying to positions at tech companies.
                          </p>
                        </div>
                        
                        <div className="p-4 border border-purple-200 rounded-lg bg-purple-50/50">
                          <h3 className="font-semibold text-purple-900 mb-2">
                            🌟 Network Expansion
                          </h3>
                          <p className="text-sm text-purple-800">
                            Connect with 5 more professionals in your field to 
                            reach the top 10% networking tier.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Market Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Growth</span>
                          <Badge className="bg-green-100 text-green-800">+18% YoY</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Remote Opportunities</span>
                          <Badge className="bg-blue-100 text-blue-800">78% of roles</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Salary Trend</span>
                          <Badge className="bg-green-100 text-green-800">+12% increase</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Competition Level</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Benchmarks */}
              <TabsContent value="benchmarks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Industry Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Comprehensive Benchmarks Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        We're building detailed industry comparisons and peer benchmarking
                      </p>
                      <Button>
                        Get Early Access
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Data updates every {refreshInterval} seconds • Last calculation: {lastUpdated.toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CareerIntelligenceDashboard;