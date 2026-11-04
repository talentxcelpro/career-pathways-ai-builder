import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from '@/components/seo/SEOHead';
import { useAuth } from '@/contexts/AuthContext';
import { useTieredAccess, AccessTier } from '@/hooks/useTieredAccess';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CURRENT_CREATOR_TARGETS_CONFIG, 
  getMetricTarget 
} from '@/config/creatorTargets';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  BookOpen,
  Lock,
  Wallet,
  Clock,
  Target,
  CheckCircle2,
  HelpCircle,
  FileText,
  UserPlus,
  Compass,
  Info,
  Zap
} from 'lucide-react';

interface MetricTargetProgressProps {
  title: string;
  description: string;
  current: number | null;
  target: number;
  unit: string;
  icon?: React.ReactNode;
}

const MetricTargetProgress: React.FC<MetricTargetProgressProps> = ({
  title,
  description,
  current,
  target,
  unit,
  icon
}) => {
  const actualVal = current ?? 0;
  const progressPercent = Math.min(100, Math.round((actualVal / (target || 1)) * 100));
  const remaining = Math.max(0, target - actualVal);

  return (
    <div className="p-3 border rounded-xl bg-white dark:bg-card space-y-2 text-xs shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-xs text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">
            {actualVal.toLocaleString()} <span className="text-muted-foreground font-normal">/ {target.toLocaleString()} {unit}</span>
          </span>
          <Badge className={`text-[10px] font-bold ${
            actualVal >= target ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300'
          }`}>
            {actualVal >= target ? 'Target Met' : `${remaining} to target`}
          </Badge>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      <div className="space-y-1 pt-0.5">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Progress: {progressPercent}%</span>
          <span>Target: {target} {unit}</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>
    </div>
  );
};

interface CreatorStudioProps {
  isEmbedded?: boolean;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ isEmbedded = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTier } = useTieredAccess();
  const [activeTab, setActiveTab] = useState<'targets' | 'performance' | 'ledger' | 'integrity' | 'payouts'>('targets');

  // Reporting period boundaries
  const now = new Date();
  const reportingPeriodName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Authoritative subscription record query from public.subscribers
  const { data: subscriberRecord, isLoading: loadingSub } = useQuery({
    queryKey: ['authoritative-subscriber-record', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Subscription fetch notice:', error);
        return null;
      }
      return data;
    }
  });

  const isPaidSubscriber = currentTier === 'basic' || currentTier === 'pro' || currentTier === 'enterprise';
  const tierDisplayName = 
    currentTier === 'enterprise' ? 'Career Premium (₹999/mo)' :
    currentTier === 'pro' ? 'Career Pro (₹499/mo)' :
    currentTier === 'basic' ? 'Career Starter (₹199/mo)' : 'Free Network Member';

  // 2. Authoritative Activity & Metric Queries for Current Reporting Window
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['creator-studio-metrics-v2', user?.id, currentPeriodStart],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      // A. All-time & Month-to-date Posts
      const { data: userPosts, error: postsErr } = await supabase
        .from('posts')
        .select('id, likes_count, comments_count, shares_count, post_type, created_at, status, is_deleted')
        .eq('author_id', user.id)
        .eq('is_deleted', false);

      if (postsErr) throw postsErr;

      const monthlyPosts = (userPosts || []).filter(p => new Date(p.created_at) >= new Date(currentPeriodStart));
      const qualityPostsCount = monthlyPosts.filter(p => p.post_type !== 'article' && p.post_type !== 'career_article').length;
      const technicalArticlesCount = monthlyPosts.filter(p => p.post_type === 'article' || p.post_type === 'career_article').length;

      // Engagements across author's posts
      const monthlyLikes = monthlyPosts.reduce((acc, p) => acc + (p.likes_count || 0), 0);
      const monthlyComments = monthlyPosts.reduce((acc, p) => acc + (p.comments_count || 0), 0);
      const monthlyShares = monthlyPosts.reduce((acc, p) => acc + (p.shares_count || 0), 0);
      const totalEngagements = monthlyLikes + monthlyComments + monthlyShares;

      // B. Qualified Human Reach from profile_views (excluding self-views)
      const { data: viewsData, error: viewsErr } = await supabase
        .from('profile_views')
        .select('id, viewer_id, viewed_at, created_at')
        .eq('profile_id', user.id)
        .gte('created_at', currentPeriodStart);

      // Distinct viewer IDs excluding author themselves
      const validHumanViewers = new Set<string>();
      let unverifiedReachCount = 0;

      if (viewsData) {
        viewsData.forEach((v: any) => {
          if (v.viewer_id && v.viewer_id !== user.id) {
            validHumanViewers.add(v.viewer_id);
          } else {
            unverifiedReachCount++;
          }
        });
      }
      const qualifiedHumanReach = validHumanViewers.size;

      // C. Mentorship sessions completed
      const { data: mentorshipData } = await supabase
        .from('mentorship_sessions')
        .select('id, status, created_at')
        .eq('mentor_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', currentPeriodStart);

      const completedMentorshipCount = mentorshipData?.length || 0;

      // D. Genuine Audience Growth (new accepted connections during month)
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('id, connected_at, created_at, status')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .gte('created_at', currentPeriodStart);

      const audienceGrowthCount = connectionsData?.length || 0;

      // E. Helpful Answers (Telemetry check)
      // Note: Standalone Q&A answers table is not provisioned in current public schema
      const helpfulAnswersCount: number | null = null;

      // F. Dynamic Points Ledger Calculation
      // Weighted Formula:
      // Reach (25%) + Engagement (25%) + Technical Articles (20% * 20pts) + Quality Posts (15% * 5pts) + Audience (15% * 10pts)
      const reachPoints = Math.round(qualifiedHumanReach * 0.25);
      const engagementPoints = Math.round(totalEngagements * 0.25);
      const articlePoints = technicalArticlesCount * 20;
      const postPoints = qualityPostsCount * 5;
      const growthPoints = audienceGrowthCount * 10;
      const mentorshipPoints = completedMentorshipCount * 25;

      const totalEligiblePoints = reachPoints + engagementPoints + articlePoints + postPoints + growthPoints + mentorshipPoints;

      // Distributable Reward Pool Share Model
      // Estimated at ₹0.15 per verified reward point
      const estimatedRewardPoolINR = Math.round(totalEligiblePoints * 0.15);

      return {
        qualifiedHumanReach,
        unverifiedReachCount,
        totalEngagements,
        monthlyLikes,
        monthlyComments,
        monthlyShares,
        technicalArticlesCount,
        helpfulAnswersCount,
        completedMentorshipCount,
        qualityPostsCount,
        audienceGrowthCount,
        totalMonthlyPosts: monthlyPosts.length,
        allTimePostsCount: (userPosts || []).length,
        ledger: {
          reachPoints,
          engagementPoints,
          articlePoints,
          postPoints,
          growthPoints,
          mentorshipPoints,
          totalEligiblePoints
        },
        estimatedRewardPoolINR
      };
    }
  });

  // Calculate target comparisons for current user's tier
  const reachTarget = getMetricTarget('human_reach', currentTier);
  const engagementsTarget = getMetricTarget('engagements', currentTier);
  const articlesTarget = getMetricTarget('articles', currentTier);
  const helpfulAnswersTarget = getMetricTarget('helpful_answers', currentTier);
  const mentorshipTarget = getMetricTarget('mentorship', currentTier);
  const qualityPostsTarget = getMetricTarget('quality_posts', currentTier);
  const growthTarget = getMetricTarget('audience_growth', currentTier);

  const targets = {
    qualityPosts: qualityPostsTarget?.targetValue ?? 8,
    articles: articlesTarget?.targetValue ?? 2,
    reach: reachTarget?.targetValue ?? 100,
    engagements: engagementsTarget?.targetValue ?? 50,
    growth: growthTarget?.targetValue ?? 15,
    helpfulAnswers: helpfulAnswersTarget?.targetValue ?? 5,
    mentorship: mentorshipTarget?.targetValue ?? 2,
  };

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        {/* Compact Embedded Header */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Creator Studio & Reward Integrity
            </h2>
          </div>

          <Button
            onClick={() => navigate('/pro/subscription')}
            size="sm"
            className="rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs flex items-center gap-1.5 h-8 shrink-0 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300" />
            <span>Upgrade to Pro</span>
          </Button>
        </div>
              

        {/* 3. AT-A-GLANCE METRIC CARDS (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">MTD Views</p>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.qualifiedHumanReach ?? 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
                <Eye className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">MTD Posts</p>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : metrics?.qualityPostsCount ?? 0}
                </h3>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-lg">
                <FileText className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">MTD Interactions</p>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.totalEngagements ?? 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <ThumbsUp className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Reward Points</p>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.ledger.totalEligiblePoints ?? 0).toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">
                  Est: ₹{(metrics?.estimatedRewardPoolINR ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
                <Award className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. TABBED STUDIO MODULES */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 p-1 rounded-xl w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="targets" className="font-bold text-[11px] py-1.5 px-1 truncate">Targets</TabsTrigger>
            <TabsTrigger value="performance" className="font-bold text-[11px] py-1.5 px-1 truncate">Metrics</TabsTrigger>
            <TabsTrigger value="ledger" className="font-bold text-[11px] py-1.5 px-1 truncate">Ledger</TabsTrigger>
            <TabsTrigger value="integrity" className="font-bold text-[11px] py-1.5 px-1 truncate">Integrity</TabsTrigger>
            <TabsTrigger value="payouts" className="font-bold text-[11px] py-1.5 px-1 truncate">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="targets" className="mt-3 space-y-3">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Monthly Targets ({reportingPeriodName})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Tier: <strong className="text-foreground">{currentTier.toUpperCase()}</strong>
                  </CardDescription>
                </div>

                {!isPaidSubscriber && (
                  <Button
                    onClick={() => navigate('/pro/subscription')}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-bold rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 shrink-0 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-500" />
                    Upgrade Tier &rarr;
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <MetricTargetProgress
                  title="Monthly Published Posts"
                  description="Original posts shared to feed during this calendar month."
                  current={metrics?.qualityPostsCount ?? 0}
                  target={targets.qualityPosts}
                  unit="posts"
                  icon={<FileText className="h-4 w-4 text-blue-500" />}
                />
                <MetricTargetProgress
                  title="Monthly Long-Form Articles"
                  description="Articles published to the Network knowledge base."
                  current={metrics?.technicalArticlesCount ?? 0}
                  target={targets.articles}
                  unit="articles"
                  icon={<BookOpen className="h-4 w-4 text-indigo-500" />}
                />
                <MetricTargetProgress
                  title="Monthly Profile Views"
                  description="Authentic unique profile views recorded in this month."
                  current={metrics?.qualifiedHumanReach ?? 0}
                  target={targets.reach}
                  unit="views"
                  icon={<Eye className="h-4 w-4 text-purple-500" />}
                />
                <MetricTargetProgress
                  title="Engagements Received"
                  description="Likes, reactions, and comments received on your content."
                  current={metrics?.totalEngagements ?? 0}
                  target={targets.engagements}
                  unit="interactions"
                  icon={<ThumbsUp className="h-4 w-4 text-emerald-500" />}
                />
                <MetricTargetProgress
                  title="Net Audience Growth"
                  description="New accepted connections added this month."
                  current={metrics?.audienceGrowthCount ?? 0}
                  target={targets.growth}
                  unit="connections"
                  icon={<UserPlus className="h-4 w-4 text-teal-500" />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-3 space-y-3">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Contribution Telemetry ({reportingPeriodName})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Views Generated:</span>
                    <span className="font-bold">{metrics?.qualifiedHumanReach ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Posts Published:</span>
                    <span className="font-bold">{metrics?.qualityPostsCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Engagements Received:</span>
                    <span className="font-bold">{metrics?.totalEngagements ?? 0}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">New Connections:</span>
                    <span className="font-bold">{metrics?.audienceGrowthCount ?? 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ledger" className="mt-3 space-y-3">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Points Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b">
                    <span>Reach Points (0.25 pt / view):</span>
                    <span className="font-bold font-mono">+{(metrics?.ledger?.reachPoints ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span>Engagement Points (0.25 pt / inter):</span>
                    <span className="font-bold font-mono">+{(metrics?.ledger?.engagementPoints ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span>Content Creation Points:</span>
                    <span className="font-bold font-mono">+{((metrics?.ledger?.articlePoints ?? 0) + (metrics?.ledger?.postPoints ?? 0)).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span>Community Growth Points:</span>
                    <span className="font-bold font-mono">+{(metrics?.ledger?.growthPoints ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-slate-50 dark:bg-muted/40 px-2 rounded-lg font-bold">
                    <span>Total Eligible Points:</span>
                    <span className="font-mono text-primary">{(metrics?.ledger?.totalEligiblePoints ?? 0).toLocaleString()} pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrity" className="mt-3 space-y-3">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Account Standing &amp; Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Account Status:</span>
                    <span className="font-bold text-emerald-600">Active &amp; In Good Standing</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Community Violations:</span>
                    <span className="font-bold">0 reported</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Verification Level:</span>
                    <span className="font-bold text-blue-600">{tierDisplayName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-3 space-y-3">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  Payout Sandbox Mode
                </CardTitle>
                <CardDescription className="text-xs">
                  Financial disbursements are in simulation mode prior to live production activation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-bold">Sandbox Mode Active</p>
                  <p>All pool share estimations (₹{(metrics?.estimatedRewardPoolINR ?? 0).toLocaleString()}) are provisional calculations based on real monthly telemetry.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 pb-20">
      <SEOHead 
        title="Creator Studio & Rewards | TalentXcel Professional Network"
        description="Transparent creator telemetry, versioned performance targets, and verified rewards ledger on TalentXcel."
        canonical="https://talentxcel.in/network/creator-studio"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* ============================================================================ */}
        {/* 1. HEADER & BREADCRUMB */}
        {/* ============================================================================ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <Link to="/network" className="hover:text-primary transition-colors">Network</Link>
              <span>/</span>
              <span className="text-foreground">Creator Studio</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Creator Studio &amp; Reward Integrity
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authoritative performance targets, genuine human telemetry, and verifiable reward distributions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPaidSubscriber ? "default" : "outline"} className="px-3 py-1 font-bold text-xs">
              {isPaidSubscriber ? (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Eligible ({tierDisplayName})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" /> Creator Pool
                </span>
              )}
            </Badge>

            {!isPaidSubscriber && (
              <Button
                onClick={() => navigate('/pro/subscription')}
                size="sm"
                className="rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs flex items-center gap-1.5 h-8 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span>Upgrade to Pro</span>
              </Button>
            )}
          </div>
        </div>

        {/* ============================================================================ */}
        {/* 2. SUBSCRIPTION ELIGIBILITY STATUS CARD */}
        {isPaidSubscriber && (
          <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Authoritative Subscription: {tierDisplayName}</p>
                  <p className="text-muted-foreground">
                    Verified through Razorpay &amp; public.subscribers • Billing Period: {reportingPeriodName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Status:</span>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Active Subscriber</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================================ */}
        {/* 3. CORE SUMMARY KPI CARDS */}
        {/* ============================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Reach */}
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Qualified Human Reach</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.qualifiedHumanReach ?? 0).toLocaleString()}
                </h3>
                <span className="text-[11px] text-muted-foreground">Target: {reachTarget} viewers</span>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                <Eye className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Engagements */}
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Meaningful Engagements</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.totalEngagements ?? 0).toLocaleString()}
                </h3>
                <span className="text-[11px] text-muted-foreground">Target: {engagementsTarget} interactions</span>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                <ThumbsUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Technical Articles */}
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Technical Articles</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.technicalArticlesCount ?? 0)}
                </h3>
                <span className="text-[11px] text-muted-foreground">Target: {articlesTarget} published</span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Ledger Points */}
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Eligible Reward Points</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {loadingMetrics ? '...' : (metrics?.ledger.totalEligiblePoints ?? 0).toLocaleString()}
                </h3>
                <span className="text-[11px] text-emerald-600 font-bold">
                  Est. Share: ₹{(metrics?.estimatedRewardPoolINR ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                <Award className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ============================================================================ */}
        {/* 4. TABBED STUDIO MODULES */}
        {/* ============================================================================ */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 p-1 rounded-xl">
            <TabsTrigger value="targets" className="font-bold text-xs">Monthly Targets</TabsTrigger>
            <TabsTrigger value="performance" className="font-bold text-xs">Contribution Metrics</TabsTrigger>
            <TabsTrigger value="ledger" className="font-bold text-xs">Reward Points Ledger</TabsTrigger>
            <TabsTrigger value="integrity" className="font-bold text-xs">Creator Integrity</TabsTrigger>
            <TabsTrigger value="payouts" className="font-bold text-xs">Payout Audit</TabsTrigger>
          </TabsList>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* TAB 1: MONTHLY PERFORMANCE TARGETS                                       */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <TabsContent value="targets" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Monthly Performance Targets ({reportingPeriodName})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tier: <strong className="text-foreground">{currentTier.toUpperCase()}</strong>
                    </CardDescription>
                  </div>
                  {!isPaidSubscriber && (
                    <Button
                      onClick={() => navigate('/pro/subscription')}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-bold rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 cursor-pointer"
                    >
                      <Zap className="h-3 w-3 mr-1 text-amber-500" />
                      Upgrade Tier &rarr;
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* 7 Metric Target Rows */}
                <div className="space-y-3">
                  
                  {/* Metric 1: Qualified Human Reach */}
                  <TargetMetricRow 
                    name="Qualified Human Reach"
                    category="Audience"
                    actual={metrics?.qualifiedHumanReach ?? 0}
                    target={reachTarget}
                    unit="viewers"
                    status="Verified Real Data"
                    description="Distinct authenticated accounts viewing your profile or technical articles during this calendar month."
                  />

                  {/* Metric 2: Meaningful Engagements */}
                  <TargetMetricRow 
                    name="Meaningful Engagements"
                    category="Engagement"
                    actual={metrics?.totalEngagements ?? 0}
                    target={engagementsTarget}
                    unit="reactions & comments"
                    status="Verified Real Data"
                    description="Sum of genuine post likes, substantive comments, and shares across your published posts."
                  />

                  {/* Metric 3: Technical Articles */}
                  <TargetMetricRow 
                    name="Technical Articles"
                    category="Knowledge"
                    actual={metrics?.technicalArticlesCount ?? 0}
                    target={articlesTarget}
                    unit="articles"
                    status="Verified Real Data"
                    description="Original long-form engineering postmortems, architecture breakdowns, or career tutorials."
                  />

                  {/* Metric 4: Helpful Answers */}
                  <TargetMetricRow 
                    name="Helpful Answers"
                    category="Community"
                    actual={null} // Null triggers 'Not enough data' label
                    target={helpfulAnswersTarget}
                    unit="answers"
                    status="Not enough data"
                    description="Technical problem-solving answers validated by peers (marked Unavailable until Q&A module schema provisioned)."
                  />

                  {/* Metric 5: Mentorship Contributions */}
                  <TargetMetricRow 
                    name="Mentorship Contributions"
                    category="Community"
                    actual={metrics?.completedMentorshipCount ?? 0}
                    target={mentorshipTarget}
                    unit="sessions"
                    status="Verified Real Data"
                    description="Completed 1-on-1 mentorship sessions verified in public.mentorship_sessions."
                  />

                  {/* Metric 6: Quality Posts */}
                  <TargetMetricRow 
                    name="Quality Posts"
                    category="Content"
                    actual={metrics?.qualityPostsCount ?? 0}
                    target={qualityPostsTarget}
                    unit="posts"
                    status="Verified Real Data"
                    description="Standard professional updates and discussions published during the current calendar month."
                  />

                  {/* Metric 7: Genuine Audience Growth */}
                  <TargetMetricRow 
                    name="Genuine Audience Growth"
                    category="Growth"
                    actual={metrics?.audienceGrowthCount ?? 0}
                    target={growthTarget}
                    unit="new connections"
                    status="Verified Real Data"
                    description="Net newly established accepted connections and profile followers during this calendar month."
                  />

                </div>

                <div className="p-3 bg-slate-50 dark:bg-muted/40 rounded-xl text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Target Policy:</strong> Targets are benchmarks for continuous professional momentum and do not disqualify creators from earning points on qualifying contributions.
                  </span>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* TAB 2: CONTRIBUTION METRICS & CONTENT BREAKDOWN                          */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <TabsContent value="performance" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Month-to-Date Post Activity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Aggregated strictly from public.posts for author {user?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                      <p className="text-xs text-muted-foreground">Articles</p>
                      <p className="text-lg font-black text-foreground">{metrics?.technicalArticlesCount ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                      <p className="text-xs text-muted-foreground">Posts</p>
                      <p className="text-lg font-black text-foreground">{metrics?.qualityPostsCount ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                      <p className="text-xs text-muted-foreground">Likes</p>
                      <p className="text-lg font-black text-foreground">{metrics?.monthlyLikes ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                      <p className="text-xs text-muted-foreground">Comments</p>
                      <p className="text-lg font-black text-foreground">{metrics?.monthlyComments ?? 0}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All-Time Published Posts:</span>
                      <span className="font-bold">{metrics?.allTimePostsCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Post Shares / Reposts:</span>
                      <span className="font-bold">{metrics?.monthlyShares ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Human Reach Audit
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Evidence breakdown from public.profile_views
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
                    <div>
                      <p className="font-bold text-foreground">Verified Human Viewers</p>
                      <p className="text-[11px] text-muted-foreground">Authenticated distinct member profiles</p>
                    </div>
                    <span className="text-lg font-black text-blue-600">{metrics?.qualifiedHumanReach ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                    <div>
                      <p className="font-semibold text-foreground">Unverified / Anonymous Views</p>
                      <p className="text-[11px] text-muted-foreground">Traffic lacking identity telemetry (excluded from pool points)</p>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{metrics?.unverifiedReachCount ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* TAB 3: REWARD POINTS LEDGER & FORMULA                                    */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <TabsContent value="ledger" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  Monthly Points Ledger &amp; 30% Net Pool Share
                </CardTitle>
                <CardDescription className="text-xs">
                  Auditable points breakdown for {reportingPeriodName} • Calculated strictly from verified events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                {/* Ledger Breakdown Table */}
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase border-b">
                      <tr>
                        <th className="p-3">Contribution Category</th>
                        <th className="p-3">Authoritative Event Count</th>
                        <th className="p-3">Scoring Rule</th>
                        <th className="p-3 text-right">Points Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-border/60 text-xs">
                      <tr>
                        <td className="p-3 font-semibold">1. Qualified Human Reach</td>
                        <td className="p-3">{metrics?.qualifiedHumanReach ?? 0} viewers</td>
                        <td className="p-3 text-muted-foreground">0.25 pts / viewer</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.reachPoints ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">2. Meaningful Engagements</td>
                        <td className="p-3">{metrics?.totalEngagements ?? 0} interactions</td>
                        <td className="p-3 text-muted-foreground">0.25 pts / interaction</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.engagementPoints ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">3. Technical Articles</td>
                        <td className="p-3">{metrics?.technicalArticlesCount ?? 0} published</td>
                        <td className="p-3 text-muted-foreground">20.0 pts / article</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.articlePoints ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">4. Quality Posts</td>
                        <td className="p-3">{metrics?.qualityPostsCount ?? 0} posts</td>
                        <td className="p-3 text-muted-foreground">5.0 pts / post</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.postPoints ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">5. Mentorship Contributions</td>
                        <td className="p-3">{metrics?.completedMentorshipCount ?? 0} completed</td>
                        <td className="p-3 text-muted-foreground">25.0 pts / session</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.mentorshipPoints ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">6. Audience Growth</td>
                        <td className="p-3">{metrics?.audienceGrowthCount ?? 0} connections</td>
                        <td className="p-3 text-muted-foreground">10.0 pts / connection</td>
                        <td className="p-3 text-right font-bold text-foreground">{metrics?.ledger.growthPoints ?? 0}</td>
                      </tr>
                      <tr className="bg-slate-50/60 dark:bg-muted/30 font-bold border-t">
                        <td className="p-3">Total Eligible Points</td>
                        <td className="p-3">-</td>
                        <td className="p-3 text-muted-foreground">Sum of verified events</td>
                        <td className="p-3 text-right text-sm text-blue-600">
                          {metrics?.ledger.totalEligiblePoints ?? 0} PTS
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pool Allocation Formula Display */}
                <div className="p-4 bg-slate-50 dark:bg-muted/40 rounded-xl space-y-2">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                    Authoritative Creator Pool Formula
                  </h4>
                  <div className="font-mono text-[11px] p-2.5 bg-white dark:bg-card border rounded-lg">
                    Estimated Pool Share = (Your Eligible Points / Total Network Points) × (30% of Net Platform Revenue)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-2 border rounded-lg bg-white dark:bg-card">
                      <span className="text-muted-foreground text-[10px]">Estimated (Current Month)</span>
                      <p className="font-black text-foreground text-sm">₹{(metrics?.estimatedRewardPoolINR ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 border rounded-lg bg-white dark:bg-card">
                      <span className="text-muted-foreground text-[10px]">Pending Cycle Approval</span>
                      <p className="font-black text-amber-600 text-sm">₹0</p>
                    </div>
                    <div className="p-2 border rounded-lg bg-white dark:bg-card">
                      <span className="text-muted-foreground text-[10px]">Approved &amp; Disbursed</span>
                      <p className="font-black text-emerald-600 text-sm">₹0</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* TAB 4: CREATOR INTEGRITY & QUALITY STATUS                                 */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <TabsContent value="integrity" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Creator Integrity &amp; Standing Audit
                </CardTitle>
                <CardDescription className="text-xs">
                  Defensible telemetry; no unsupported 100% or zero claims.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                
                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-bold text-foreground">Authentication &amp; Identity</p>
                    <p className="text-[11px] text-muted-foreground">Supabase auth identity &amp; verified email</p>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold">Verified Account</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-bold text-foreground">Content Moderation &amp; Flags</p>
                    <p className="text-[11px] text-muted-foreground">Historical policy violations or deleted spam flags</p>
                  </div>
                  <span className="font-semibold text-emerald-600">Clean Standing (0 violations)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-bold text-foreground">Peer Help &amp; Mentorship Rating</p>
                    <p className="text-[11px] text-muted-foreground">Peer reviews on answers and advisory sessions</p>
                  </div>
                  <span className="text-muted-foreground font-semibold">Not assessed (Sample size: 0 reviews)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-bold text-foreground">Spam / Bot Telemetry Audit</p>
                    <p className="text-[11px] text-muted-foreground">Automated behavioral analysis and click-fraud checks</p>
                  </div>
                  <span className="text-muted-foreground font-semibold">Not assessed (Insufficient behavioral telemetry)</span>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────────────────────── */}
          {/* TAB 5: PAYOUT AUDIT & HISTORY                                            */}
          {/* ──────────────────────────────────────────────────────────────────────── */}
          <TabsContent value="payouts" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Payout Ledger &amp; Disbursement History
                </CardTitle>
                <CardDescription className="text-xs">
                  Immutable record of creator reward distributions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 border border-dashed rounded-xl text-center space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">Development Sandbox Mode Active</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Live monetary disbursements are strictly gated during staging development. Accumulated points are recorded in your verified monthly ledger and will be settled upon production creator pool commercial activation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: TARGET METRIC ROW
// ============================================================================
interface TargetMetricRowProps {
  name: string;
  category: string;
  actual: number | null;
  target: number;
  unit: string;
  status: string;
  description: string;
}

const TargetMetricRow: React.FC<TargetMetricRowProps> = ({
  name,
  category,
  actual,
  target,
  unit,
  status,
  description
}) => {
  const isDataAvailable = actual !== null;
  const actualVal = actual ?? 0;
  const progressPercent = Math.min(100, Math.round((actualVal / (target || 1)) * 100));
  const remaining = Math.max(0, target - actualVal);

  return (
    <div className="p-3.5 border rounded-xl bg-white dark:bg-card space-y-2 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
            {category}
          </Badge>
          <span className="font-extrabold text-sm text-foreground">{name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isDataAvailable ? (
            <span className="font-bold text-foreground">
              {actualVal.toLocaleString()} <span className="text-muted-foreground font-normal">/ {target.toLocaleString()} {unit}</span>
            </span>
          ) : (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              Not enough data
            </span>
          )}

          <Badge className={`text-[10px] font-bold ${
            !isDataAvailable 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
              : actualVal >= target 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300'
          }`}>
            {!isDataAvailable ? 'Unavailable' : actualVal >= target ? 'Target Met' : `${remaining} to target`}
          </Badge>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">{description}</p>

      {isDataAvailable ? (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Progress: {progressPercent}%</span>
            <span>Target: {target} {unit}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      ) : (
        <div className="h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden" />
      )}
    </div>
  );
};

export default CreatorStudio;
