// src/pages/company-os/Marketing.tsx
// Unified Claim #1 Autonomous Marketing & Growth Agent Dashboard

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { claim1MarketingService } from '@/services/claim1MarketingService';
import { formatCurrency } from '@/services/claim1Service';
import { toast } from 'sonner';
import {
  Target,
  TrendingUp,
  Users,
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  Flame,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Layers,
  Filter,
} from 'lucide-react';
import type { ProspectState } from '@/types/claim1Marketing';

const STATE_BADGE_COLORS: Record<ProspectState, string> = {
  DISCOVERED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  QUALIFIED:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  CONTACTED:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  OPENED:     'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300',
  CLAIMED:    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  BIDDED:     'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300',
  OUTBID:     'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
  RECLAIMED:  'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
  REFERRING:  'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
};

export default function Marketing() {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<ProspectState | 'ALL'>('ALL');

  // 1. Fetch live growth analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['claim1-growth-analytics'],
    queryFn: claim1MarketingService.getGrowthAnalytics,
    refetchInterval: 15_000,
  });

  // 2. Fetch prospects pipeline
  const { data: prospects = [], isLoading: prospectsLoading } = useQuery({
    queryKey: ['claim1-prospects', selectedState],
    queryFn: () => claim1MarketingService.getProspects(selectedState === 'ALL' ? undefined : selectedState),
  });

  // 3. Fetch active campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['claim1-marketing-campaigns'],
    queryFn: claim1MarketingService.getCampaigns,
  });

  // 4. Campaign Execution Mutation
  const executeCampaignMutation = useMutation({
    mutationFn: (campaignId: string) => claim1MarketingService.executeCampaign(campaignId),
    onSuccess: (res) => {
      toast.success(`Campaign dispatched: ${res.contactedCount} founder outreach messages sent.`);
      queryClient.invalidateQueries({ queryKey: ['claim1-growth-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['claim1-prospects'] });
      queryClient.invalidateQueries({ queryKey: ['claim1-marketing-campaigns'] });
    },
    onError: () => {
      toast.error('Failed to execute campaign.');
    },
  });

  // 5. State Transition Mutation
  const transitionStateMutation = useMutation({
    mutationFn: ({ id, nextState }: { id: string; nextState: ProspectState }) =>
      claim1MarketingService.updateProspectState(id, nextState),
    onSuccess: () => {
      toast.success('Prospect state updated.');
      queryClient.invalidateQueries({ queryKey: ['claim1-prospects'] });
      queryClient.invalidateQueries({ queryKey: ['claim1-growth-analytics'] });
    },
  });

  const activeCampaign = campaigns[0];
  const progressPct = Math.min(
    100,
    Math.round(((analytics?.profiles_claimed || 0) / (analytics?.target_goal || 100)) * 100)
  );

  const copyOutreach = (prospectSlug: string, id: string) => {
    const text = `We have opened the verified category leaderboards on TalentXcel Claim #1. Your product is a top candidate for the category. The first 100 claimed profiles lock a permanent 5% platform fee for life.\n\nClaim your profile: https://talentxcel.in/company/${prospectSlug}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Professional outreach copy copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Claim #1 Marketing Agent
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
              Autonomous Growth Engine
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Closed-loop company acquisition, competitive bidding orchestration, and revenue maximization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="default"
            disabled={executeCampaignMutation.isPending || !activeCampaign}
            onClick={() => activeCampaign && executeCampaignMutation.mutate(activeCampaign.id)}
            className="gap-2 font-semibold shadow-sm"
          >
            <Send className="w-4 h-4" />
            {executeCampaignMutation.isPending ? 'Executing Outreach...' : 'Execute Campaign'}
          </Button>
        </div>
      </div>

      {/* Main Mission & North-Star Progress */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Current Mission Objective
              </p>
              <h2 className="text-xl font-bold text-foreground mt-0.5">
                Acquire the First 100 Legitimate Companies
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-primary">
                {analytics?.profiles_claimed || 0}
              </span>
              <span className="text-sm text-muted-foreground font-semibold"> / {analytics?.target_goal || 100} Claimed</span>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progressPct} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Cohort Target: 100 Founding Entities</span>
              <span>{progressPct}% Completed</span>
            </div>
          </div>

          {/* Primary Funnel Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t">
            <div className="p-3 bg-muted/30 rounded-xl border">
              <p className="text-xs text-muted-foreground font-medium">Companies Contacted</p>
              <p className="text-xl font-bold text-foreground mt-1">{analytics?.total_contacted || 0}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border">
              <p className="text-xs text-muted-foreground font-medium">Profiles Claimed</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{analytics?.profiles_claimed || 0}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border">
              <p className="text-xs text-muted-foreground font-medium">First Bids Placed</p>
              <p className="text-xl font-bold text-primary mt-1">{analytics?.first_bids || 0}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border">
              <p className="text-xs text-muted-foreground font-medium">Active Battles</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">{analytics?.competitive_battles || 0}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border">
              <p className="text-xs text-muted-foreground font-medium">Reclaims Won</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{analytics?.reclaims || 0}</p>
            </div>
          </div>

          {/* Conversion & Unit Economics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Platform Revenue</p>
              <p className="text-base font-bold text-foreground mt-0.5">{formatCurrency(analytics?.total_revenue_inr || 0, 'INR')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Claim Conversion</p>
              <p className="text-base font-bold text-foreground mt-0.5">{analytics?.claim_conversion_pct || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bid Conversion</p>
              <p className="text-base font-bold text-foreground mt-0.5">{analytics?.bid_conversion_pct || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reclaim Velocity</p>
              <p className="text-base font-bold text-foreground mt-0.5">{analytics?.reclaim_rate_pct || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Recommended Action Banner */}
      <Card className="border border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Agent Intelligence Insight</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {analytics?.next_recommended_action || 'Contact 25 high-priority AI Productivity founders to secure Founding 100 slots.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span>Top Channel: <strong>{analytics?.best_channel || 'Founder Outreach'}</strong></span>
              <span>•</span>
              <span>Top Converting Category: <strong>{analytics?.best_category || 'AI Productivity'}</strong></span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => activeCampaign && executeCampaignMutation.mutate(activeCampaign.id)}
            disabled={executeCampaignMutation.isPending || !activeCampaign}
            className="gap-1.5"
          >
            Execute Recommended Action <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Tabs & Prospect Funnel */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="pipeline">Prospect Pipeline</TabsTrigger>
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="playbook">Outreach Templates</TabsTrigger>
        </TabsList>

        {/* Tab 1: Prospect Pipeline Table */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by State:
              </span>
              {(['ALL', 'QUALIFIED', 'CONTACTED', 'CLAIMED', 'BIDDED'] as const).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={selectedState === st ? 'default' : 'outline'}
                  onClick={() => setSelectedState(st)}
                  className="h-7 text-xs px-2.5"
                >
                  {st}
                </Button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground">
              {prospects.length} Prospect{prospects.length === 1 ? '' : 's'} in Queue
            </span>
          </div>

          <Card className="overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Company / Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Founder / Lead</th>
                    <th className="py-3 px-4">Funnel State</th>
                    <th className="py-3 px-4">Contacts</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {prospects.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{p.name}</div>
                        {p.website_url && (
                          <a
                            href={p.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                          >
                            {p.website_url.replace('https://', '')} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-xs font-medium">
                          {p.category_slug}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-foreground font-medium">{p.founder_name || 'Founder'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={`text-[11px] font-semibold ${STATE_BADGE_COLORS[p.state] || 'bg-muted'}`}>
                          {p.state}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {p.contact_count} / {p.max_contacts}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyOutreach(p.slug, p.id)}
                            className="h-8 text-xs gap-1"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === p.id ? 'Copied' : 'Copy Pitch'}
                          </Button>
                          {p.state === 'QUALIFIED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => transitionStateMutation.mutate({ id: p.id, nextState: 'CONTACTED' })}
                              className="h-8 text-xs"
                            >
                              Mark Contacted
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map((camp) => (
            <Card key={camp.id} className="p-6 border space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">{camp.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{camp.objective}</p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                  {camp.status}
                </Badge>
              </div>

              <div className="p-3.5 bg-muted/40 rounded-xl border text-xs font-mono text-foreground/90 whitespace-pre-line">
                {camp.copy_template}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <span>Target: {camp.target_prospect_count} Founders</span>
                <span>Goal: {camp.kpi_target_claims} Claims</span>
                <Button
                  size="sm"
                  onClick={() => executeCampaignMutation.mutate(camp.id)}
                  disabled={executeCampaignMutation.isPending}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Execute
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 3: Outreach Templates (Clean, Professional, Zero-Hype) */}
        <TabsContent value="playbook" className="space-y-4">
          <Card className="p-6 border space-y-3">
            <h3 className="text-base font-bold text-foreground">Founder Direct Outreach (Founding 100 Invite)</h3>
            <p className="text-xs text-muted-foreground">Standard, professional pitch copy formatted with zero hype and direct link.</p>
            <pre className="p-4 bg-muted/50 rounded-xl text-xs font-mono border whitespace-pre-line text-foreground">
{`We have opened the verified category leaderboards on TalentXcel Claim #1.

Your product is a top candidate for the category. The first 100 claimed profiles lock a permanent 5% platform fee for life.

Claim your profile: https://talentxcel.in/company/[slug]`}
            </pre>
          </Card>

          <Card className="p-6 border space-y-3">
            <h3 className="text-base font-bold text-foreground">Outbid Notification & Reclaim Trigger</h3>
            <p className="text-xs text-muted-foreground">Automated alert triggered when a competitor outbids a standing rank.</p>
            <pre className="p-4 bg-muted/50 rounded-xl text-xs font-mono border whitespace-pre-line text-foreground">
{`Your position on the [Scope Name] Leaderboard has changed.

[Competitor Name] currently holds #[Rank]. You can reclaim #[Rank] with a bid of ₹[Reclaim Price].

Reclaim your position: https://talentxcel.in/claim1/bid/[listing_id]`}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
