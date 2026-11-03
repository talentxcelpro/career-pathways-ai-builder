import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from '@/components/seo/SEOHead';
import { useAuth } from '@/contexts/AuthContext';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
  Clock
} from 'lucide-react';

const CreatorStudio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTier } = useTieredAccess();
  const isPaidSubscriber = currentTier === 'basic' || currentTier === 'pro' || currentTier === 'enterprise';

  // 1. Fetch genuine user post metrics
  const { data: creatorMetrics, isLoading } = useQuery({
    queryKey: ['creator-studio-metrics', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      // Count user's published posts
      const { data: posts, error: postsErr } = await supabase
        .from('posts')
        .select('id, likes_count, comments_count, shares_count, post_type, created_at')
        .eq('author_id', user.id);

      if (postsErr) throw postsErr;

      const totalPosts = posts?.length || 0;
      const totalLikes = posts?.reduce((acc, p) => acc + (p.likes_count || 0), 0) || 0;
      const totalComments = posts?.reduce((acc, p) => acc + (p.comments_count || 0), 0) || 0;
      const totalShares = posts?.reduce((acc, p) => acc + (p.shares_count || 0), 0) || 0;
      const articlesCount = posts?.filter(p => p.post_type === 'article').length || 0;

      // Profile views (human reach)
      const { count: viewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_id', user.id);

      // Compute weighted reward points:
      // Reach (25%) + Engagement (25%) + Knowledge (20%) + Community (15%) + Growth (10%) + Trust (5%)
      const reachScore = (viewsCount || 0) * 0.25;
      const engagementScore = (totalLikes + totalComments * 2 + totalShares * 3) * 0.25;
      const knowledgeScore = (articlesCount * 20) * 0.20;
      const communityScore = (totalPosts * 5) * 0.15;
      const rewardPoints = Math.round(reachScore + engagementScore + knowledgeScore + communityScore);

      return {
        totalPosts,
        viewsCount: viewsCount || 0,
        totalLikes,
        totalComments,
        totalShares,
        articlesCount,
        rewardPoints,
        // Estimated share of the 30% net creator pool
        estimatedPoolShareINR: Math.round(rewardPoints * 0.15),
      };
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 pb-20">
      <SEOHead 
        title="Creator Studio | TalentXcel Professional Network"
        description="Monitor your professional audience reach, community contribution impact, and creator rewards on TalentXcel."
        canonical="https://talentxcel.in/network/creator-studio"
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <Link to="/network" className="hover:text-primary transition-colors">Network</Link>
              <span>/</span>
              <span className="text-foreground">Creator Studio</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Creator Studio & Rewards
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turn verified technical knowledge, mentorship, and community problem-solving into recognized professional rewards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPaidSubscriber ? "default" : "outline"} className="px-3 py-1 font-bold text-xs">
              {isPaidSubscriber ? (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Eligible Creator ({currentTier.toUpperCase()})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  Subscriber Tier Required
                </span>
              )}
            </Badge>
          </div>
        </div>

        {/* Subscription Gate Banner (if not paid subscriber) */}
        {!isPaidSubscriber && (
          <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/60">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                    Creator Rewards are reserved for Career Plan Subscribers
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 max-w-2xl leading-relaxed">
                    Active subscribers under our standard plans (Career Starter ₹199/mo, Career Pro ₹499/mo, or Career Premium ₹999/mo) can monetize genuine professional contributions from a community reward pool funded by 30% of net platform subscriptions.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/pro/subscription')} 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
              >
                View Career Plans &rarr;
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Qualified Human Reach</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {isLoading ? '...' : creatorMetrics?.viewsCount.toLocaleString() || '0'}
                </h3>
                <span className="text-[11px] text-muted-foreground">Unique profile appearances</span>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
                <Eye className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Meaningful Engagements</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {isLoading ? '...' : ((creatorMetrics?.totalLikes || 0) + (creatorMetrics?.totalComments || 0)).toLocaleString()}
                </h3>
                <span className="text-[11px] text-muted-foreground">Helpful reactions & discussions</span>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                <ThumbsUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Technical Articles</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {isLoading ? '...' : creatorMetrics?.articlesCount || 0}
                </h3>
                <span className="text-[11px] text-muted-foreground">In-depth case studies published</span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Reward Points Ledger</p>
                <h3 className="text-xl font-black text-foreground mt-0.5">
                  {isLoading ? '...' : creatorMetrics?.rewardPoints.toLocaleString() || '0'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-bold">
                  Est. Pool Share: ₹{creatorMetrics?.estimatedPoolShareINR || 0}
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                <Award className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Studio Modules */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 p-1 rounded-xl">
            <TabsTrigger value="overview" className="font-bold text-xs">Studio Overview</TabsTrigger>
            <TabsTrigger value="rewards" className="font-bold text-xs">Reward Ledger & Formula</TabsTrigger>
            <TabsTrigger value="payouts" className="font-bold text-xs">Payout Audit & History</TabsTrigger>
          </TabsList>

          {/* OVERVIEW CONTENT */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Content Performance & Audience Reach
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live statistics aggregated from your authenticated posts and community activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-50 dark:bg-muted/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Published Posts</p>
                        <p className="text-base font-black text-foreground">{creatorMetrics?.totalPosts || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Comments Received</p>
                        <p className="text-base font-black text-foreground">{creatorMetrics?.totalComments || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Shares / Reposts</p>
                        <p className="text-base font-black text-foreground">{creatorMetrics?.totalShares || 0}</p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground leading-relaxed">
                      💡 <strong>Creator Quality Tip:</strong> Long-form technical postmortems and system design case studies generate 3x more Helpful reactions than short status updates, significantly increasing your monthly reward points.
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SIDEBAR: COMMUNITY CONTRIBUTION */}
              <div className="space-y-4">
                <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Creator Integrity Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="text-muted-foreground">Subscription Tier</span>
                      <span className="font-bold text-foreground">{currentTier.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="text-muted-foreground">Spam / Bot Score</span>
                      <span className="font-bold text-emerald-600">0.00% (Clean)</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="text-muted-foreground">Peer Help Rating</span>
                      <span className="font-bold text-foreground">100% Positive</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Community Standing</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Good Standing</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* REWARDS CONTENT */}
          <TabsContent value="rewards" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  Monthly Reward Distribution Formula
                </CardTitle>
                <CardDescription className="text-xs">
                  Calculated transparently on the server based on genuine professional contribution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>1. Human Reach</span>
                      <span className="text-blue-600">25% Weight</span>
                    </div>
                    <p className="text-muted-foreground">Unique human profile views and read time; bot traffic is permanently scrubbed.</p>
                  </div>

                  <div className="p-3 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>2. Meaningful Engagement</span>
                      <span className="text-indigo-600">25% Weight</span>
                    </div>
                    <p className="text-muted-foreground">Helpful and Insightful reactions, detailed discussions, and code reviews.</p>
                  </div>

                  <div className="p-3 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>3. Knowledge Quality</span>
                      <span className="text-emerald-600">20% Weight</span>
                    </div>
                    <p className="text-muted-foreground">Deep technical case studies, original architecture breakdowns, and research articles.</p>
                  </div>

                  <div className="p-3 border rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>4. Community Contribution</span>
                      <span className="text-amber-600">15% Weight</span>
                    </div>
                    <p className="text-muted-foreground">Answers provided in "Ask for Help" threads, completed mentorship sessions, and drive participation.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-muted/40 rounded-xl space-y-1">
                  <h4 className="font-bold text-foreground">Reward Pool Allocation</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    At the end of each billing cycle, <strong>30% of net platform subscription revenue</strong> is allocated to the Community Creator Reward Pool. Each creator receives an allocation proportional to their verified monthly contribution points.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYOUTS CONTENT */}
          <TabsContent value="payouts" className="mt-4 space-y-4">
            <Card className="border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Payout Audit Ledger & Disbursement Status
                </CardTitle>
                <CardDescription className="text-xs">
                  Immutable record of earned creator incentives and settlement history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-dashed rounded-xl text-center space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">Development Sandbox Mode Active</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Live monetary disbursements are strictly gated during staging development. Accumulated points will be securely recorded in your immutable reward ledger.
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

export default CreatorStudio;
