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
import { CareerCareerAnalytics } from '@/components/analytics/CareerAnalytics';
import { RealTimeCareerCommandCenter } from '@/components/analytics/RealTimeCareerDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useAchievements } from '@/hooks/useAchievements';

const CareerIntelligenceCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { careerScore, growthRate, marketRank, opportunities, loading: metricsLoading } = useCareerMetrics();
  const { achievements, totalPoints, loading: achievementsLoading } = useAchievements();
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const loading = metricsLoading || achievementsLoading;

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleExportData = () => {
    toast({
      title: "Export Initialized",
      description: "Your Intelligence Analytics report is being synchronized..."
    });
  };

  const handleShareCommandCenter = async () => {
    try {
      await navigator.share({
        title: 'My TalentXcel Intelligence Hub',
        text: 'Synchronizing my professional progression analytics on TalentXcel',
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Indexed",
        description: "Intelligence Hub link copied to professional clipboard"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center edge-to-edge bg-slate-50">
        <Card className="max-w-md w-full mx-4 rounded-[32px] border-slate-200 shadow-2xl">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-slate-300" />
            <h2 className="text-2xl font-apple-heavy text-slate-950 mb-4">Authentication Required</h2>
            <p className="text-slate-500 font-apple-medium leading-relaxed">
              Please initialize your session to synchronize with your Intelligence Hub.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
      <Helmet>
        <title>Intelligence Hub - Real-Time Performance Analytics | TalentXcel</title>
        <meta 
          name="description" 
          content="Monitor your professional synchronization with real-time intelligence analytics, market insights, and performance recommendations." 
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-apple-heavy text-slate-950 tracking-tighter">
              Intelligence Hub
            </h1>
            <p className="text-xl text-slate-500 mt-2 font-apple-medium">
              Real-time synchronization of your professional evolution
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">
                Last Index: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" onClick={handleExportData} className="h-14 px-8 rounded-2xl border-slate-200 bg-white shadow-sm font-apple-heavy hover:shadow-md transition-all">
              <Download className="h-5 w-5 mr-3" />
              Export
            </Button>
            <Button variant="outline" size="lg" onClick={handleShareCommandCenter} className="h-14 px-8 rounded-2xl border-slate-200 bg-white shadow-sm font-apple-heavy hover:shadow-md transition-all">
              <Share2 className="h-5 w-5 mr-3" />
              Share Hub
            </Button>
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-slate-950 text-white shadow-2xl hover:scale-105 transition-all font-apple-heavy">
              <Settings className="h-5 w-5 mr-3" />
              Configure Hub
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-white border-slate-100 rounded-[40px] shadow-2xl overflow-hidden">
            <CardContent className="p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Performance Score</span>
                    </div>
                    <div className="text-4xl font-apple-heavy text-slate-950 tracking-tighter mb-2">
                      {loading ? '...' : `${careerScore}/100`}
                    </div>
                    <Badge className="bg-slate-950 text-white border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                      {careerScore >= 80 ? 'ELITE TIER' : careerScore >= 60 ? 'PROFESSIONAL' : 'EVOLVING'}
                    </Badge>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="p-2 bg-emerald-50 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Evolution Rate</span>
                    </div>
                    <div className="text-4xl font-apple-heavy text-emerald-600 tracking-tighter mb-2">
                      {loading ? '...' : `+${growthRate}%`}
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">QUARTERLY INDEX</Badge>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Market Status</span>
                    </div>
                    <div className="text-4xl font-apple-heavy text-indigo-600 tracking-tighter mb-2">
                      {loading ? '...' : `Top ${marketRank}%`}
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">GLOBAL INDEX</Badge>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-xl">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Active Syncs</span>
                    </div>
                    <div className="text-4xl font-apple-heavy text-amber-600 tracking-tighter mb-2">
                      {loading ? '...' : opportunities}
                    </div>
                    <Badge className="bg-amber-50 text-amber-600 border-0 font-apple-heavy text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">AI MATCHED</Badge>
                  </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Hub Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="realtime" className="space-y-8">
            <TabsList className="h-20 w-full p-2 bg-slate-100/50 backdrop-blur-xl rounded-[32px] border border-slate-200 grid grid-cols-4 gap-2">
              <TabsTrigger value="realtime" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-slate-950">
                <Zap className="h-4 w-4 mr-2" />
                Real-Time
              </TabsTrigger>
              <TabsTrigger value="CareerAnalytics" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-blue-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-indigo-600">
                <Brain className="h-4 w-4 mr-2" />
                Intelligence
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="rounded-2xl font-apple-heavy text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-emerald-600">
                <Target className="h-4 w-4 mr-2" />
                Benchmarks
              </TabsTrigger>
            </TabsList>

            {/* Real-Time Synchronization */}
            <TabsContent value="realtime" className="space-y-8">
              <RealTimeCareerCommandCenter />
            </TabsContent>

            {/* Detailed Analytics */}
            <TabsContent value="CareerAnalytics" className="space-y-8">
              <CareerCareerAnalytics userId={user.id} />
            </TabsContent>

            {/* Intelligence Insights */}
            <TabsContent value="insights" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl overflow-hidden border">
                  <CardHeader className="p-10 bg-slate-50 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy text-slate-950">
                      <Brain className="h-7 w-7 text-blue-600" />
                      Intelligence Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="space-y-6">
                      {loading ? (
                        <div className="text-center py-16">
                          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-slate-500 font-apple-medium">Synchronizing Intelligence...</p>
                        </div>
                      ) : careerScore < 70 ? (
                        <div className="p-8 border border-blue-100 rounded-[32px] bg-blue-50/50 hover:shadow-xl transition-all">
                          <h3 className="text-lg font-apple-heavy text-blue-950 mb-3 flex items-center gap-2">
                            <Target className="h-5 w-5" /> Score Calibration
                          </h3>
                          <p className="text-base font-apple-medium text-blue-800 leading-relaxed">
                            Your Performance Score is currently {careerScore}/100. Initialize capability assessments and optimize your professional identity to accelerate your status.
                          </p>
                          <Button className="mt-6 h-12 px-8 rounded-xl bg-blue-600 text-white font-apple-heavy text-xs shadow-lg">Calibrate Now</Button>
                        </div>
                      ) : null}
                      
                      {loading ? null : growthRate < 10 ? (
                        <div className="p-8 border border-emerald-100 rounded-[32px] bg-emerald-50/50 hover:shadow-xl transition-all">
                          <h3 className="text-lg font-apple-heavy text-emerald-950 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" /> Evolution Acceleration
                          </h3>
                          <p className="text-base font-apple-medium text-emerald-800 leading-relaxed">
                            Your evolution rate is currently below market velocity. Consider strategic upskilling or ecosystem expansion.
                          </p>
                          <Button className="mt-6 h-12 px-8 rounded-xl bg-emerald-600 text-white font-apple-heavy text-xs shadow-lg">Accelerate Growth</Button>
                        </div>
                      ) : null}
                      
                      {loading ? null : (
                        <div className="p-8 border border-slate-100 rounded-[32px] bg-slate-50/50 hover:shadow-xl transition-all">
                          <h3 className="text-lg font-apple-heavy text-slate-950 mb-3 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" /> Great Synchronization!
                          </h3>
                          <p className="text-base font-apple-medium text-slate-600 leading-relaxed">
                            You've successfully indexed {totalPoints} professional points and {achievements.length} verified credentials.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[40px] border-slate-200 bg-white shadow-xl overflow-hidden border">
                  <CardHeader className="p-10 bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-xl font-apple-heavy text-slate-950">Market Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="space-y-8">
                      <div className="flex justify-between items-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-base font-apple-heavy text-emerald-950 uppercase tracking-widest">Industry Evolution</span>
                        <Badge className="bg-emerald-600 text-white border-0 font-apple-heavy rounded-lg px-4 py-1 text-sm">+18% YoY</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <span className="text-base font-apple-heavy text-blue-950 uppercase tracking-widest">Global Visibility</span>
                        <Badge className="bg-blue-600 text-white border-0 font-apple-heavy rounded-lg px-4 py-1 text-sm">Top 5%</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <span className="text-base font-apple-heavy text-indigo-950 uppercase tracking-widest">Market Value Index</span>
                        <Badge className="bg-indigo-600 text-white border-0 font-apple-heavy rounded-lg px-4 py-1 text-sm">+12% Index</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-base font-apple-heavy text-slate-500 uppercase tracking-widest">Ecosystem Density</span>
                        <Badge className="bg-slate-950 text-white border-0 font-apple-heavy rounded-lg px-4 py-1 text-sm">MODERATE</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Benchmarks */}
            <TabsContent value="benchmarks" className="space-y-8">
              <Card className="rounded-[48px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
                <CardContent className="p-20">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="h-24 w-24 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto mb-10 shadow-inner">
                      <Target className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-apple-heavy text-slate-950 mb-6 tracking-tight">Global Indexing Incoming</h3>
                    <p className="text-xl font-apple-medium text-slate-500 mb-12 leading-relaxed">
                      We're architecting high-fidelity ecosystem comparisons and real-time peer indexing for elite professionals.
                    </p>
                    <Button className="h-16 px-12 rounded-2xl bg-slate-950 text-white font-apple-heavy text-lg shadow-2xl hover:scale-105 transition-all">
                      Request Tier Access
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
          className="mt-20 text-center"
        >
          <p className="text-sm font-apple-bold text-slate-400 uppercase tracking-[0.3em]">
            Index synchronized every {refreshInterval} seconds • TalentXcel Intelligence Protocol v4.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerIntelligenceCommandCenter;
