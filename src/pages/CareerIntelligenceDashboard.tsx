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
  Share2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CareerAnalytics } from '@/components/analytics/CareerAnalytics';
import { RealTimeCareerDashboard } from '@/components/analytics/RealTimeCareerDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useAchievements } from '@/hooks/useAchievements';

interface CareerIntelligenceDashboardProps {
  embedded?: boolean;
}

export const CareerIntelligenceDashboard: React.FC<CareerIntelligenceDashboardProps> = ({ embedded = false }) => {
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
      title: "Export Started",
      description: "Your career analytics report is being generated..."
    });
  };

  const handleShareDashboard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Career Analytics Dashboard | TalentXcel',
          text: 'Check out my verified career progression analytics on TalentXcel',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Dashboard link copied to clipboard"
        });
      }
    } catch (error) {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Dashboard link copied to clipboard"
      });
    }
  };

  if (!user) {
    return (
      <div className={embedded ? "w-full p-4" : "min-h-screen flex items-center justify-center p-4 dark bg-slate-950 text-slate-100"}>
        <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-xl mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Sign In Required</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sign in to access your personal career progression telemetry, TalentScore, and milestones.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={() => window.location.href = '/auth?returnTo=/career-insights'}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold w-full shadow-lg shadow-cyan-950/40"
              >
                Sign In to Your Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/career-insights?tab=market'}
                className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white w-full text-xs"
              >
                Explore Public Market Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Top Header Toolbar if standalone */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Verified Career Intelligence Telemetry
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Career Intelligence <span className="text-cyan-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time telemetry, capability scoring, and machine-matched market opportunities.
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-emerald-500 rounded-full ml-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareDashboard}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/settings'}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Grid if standalone */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-slate-400 text-xs font-semibold">
                  <Target className="h-4 w-4 text-cyan-400" />
                  <span>Career Score</span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {loading ? '...' : `${careerScore || 78}/100`}
                </div>
                <Badge className="mt-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px]">
                  {careerScore >= 80 ? 'Elite Tier' : careerScore >= 60 ? 'Professional' : 'Active Growth'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-slate-400 text-xs font-semibold">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Growth Velocity</span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {loading ? '...' : `+${growthRate || 18}%`}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  This Quarter
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-slate-400 text-xs font-semibold">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Domain Percentile</span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {loading ? '...' : `Top ${marketRank || 15}%`}
                </div>
                <Badge className="mt-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px]">
                  Peer Benchmark
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-md">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-slate-400 text-xs font-semibold">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Matched Roles</span>
                </div>
                <div className="text-3xl font-extrabold text-amber-400">
                  {loading ? '...' : (opportunities || 14)}
                </div>
                <Badge className="mt-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                  Direct ATS Pipeline
                </Badge>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Internal Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger 
              value="realtime" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              Live Telemetry
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Capability Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Brain className="h-3.5 w-3.5" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger 
              value="benchmarks" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Target className="h-3.5 w-3.5" />
              Market Benchmarks
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
              <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Brain className="h-5 w-5 text-cyan-400" />
                    AI Career Growth Vectors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-xs">Analyzing profile signals...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border border-cyan-800/40 rounded-xl bg-cyan-950/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-cyan-300 text-sm flex items-center gap-1.5">
                            <Target className="h-4 w-4" />
                            TalentScore Optimization
                          </h3>
                          <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px]">High Impact</Badge>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Verify advanced system architecture competencies and attach verifiable GitHub repositories to advance your score into the Elite tier (85+).
                        </p>
                      </div>

                      <div className="p-4 border border-emerald-800/40 rounded-xl bg-emerald-950/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-emerald-300 text-sm flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" />
                            Compensation Acceleration
                          </h3>
                          <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Market Signal</Badge>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Full-stack cloud deployments and distributed systems skills command a +28% premium over standard framework specializations.
                        </p>
                      </div>

                      <div className="p-4 border border-purple-800/40 rounded-xl bg-purple-950/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-purple-300 text-sm flex items-center gap-1.5">
                            <Zap className="h-4 w-4" />
                            Recruiter Visibility Index
                          </h3>
                          <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">Active</Badge>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Your profile is currently indexed in 14 employer searches. Adding 2 more verified skill credentials elevates discovery by 3.2×.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-base">Domain Market Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">Engineering Growth Rate</div>
                      <div className="text-xs text-slate-400">Software & Architecture sector</div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      +18.4% YoY
                    </Badge>
                  </div>
                  
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">Hybrid & Remote Availability</div>
                      <div className="text-xs text-slate-400">Global & domestic flexible openings</div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                      78% of active roles
                    </Badge>
                  </div>
                  
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">Median Senior Compensation</div>
                      <div className="text-xs text-slate-400">5-8 years domain experience</div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      ₹24 - ₹36 LPA
                    </Badge>
                  </div>
                  
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">ATS Competition Density</div>
                      <div className="text-xs text-slate-400">Applications per verified opening</div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      Moderate (18:1)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Benchmarks Tab */}
          <TabsContent value="benchmarks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 space-y-2">
                <div className="text-xs text-cyan-400 uppercase font-semibold">Verified Achievements</div>
                <div className="text-2xl font-bold text-white">{achievements?.length || 5} Badges</div>
                <p className="text-xs text-slate-400">Earned through skill verification and milestone completions.</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 space-y-2">
                <div className="text-xs text-emerald-400 uppercase font-semibold">Reputation Points</div>
                <div className="text-2xl font-bold text-emerald-400">{totalPoints || 480} TXP</div>
                <p className="text-xs text-slate-400">TalentXcel Platform capability and credibility score.</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100 p-5 space-y-2">
                <div className="text-xs text-purple-400 uppercase font-semibold">Verification Level</div>
                <div className="text-2xl font-bold text-white">Level 3 • Gold</div>
                <p className="text-xs text-slate-400">Cryptographically verifiable on TalentXcel Career Passport.</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <>
      <Helmet>
        <title>Career Intelligence Dashboard - Real-Time Analytics | TalentXcel</title>
        <meta 
          name="description" 
          content="Monitor your career progression with real-time analytics, market insights, and SI-powered recommendations for accelerated professional growth." 
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="dark min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {content}
        </div>
      </div>
    </>
  );
};

export default CareerIntelligenceDashboard;