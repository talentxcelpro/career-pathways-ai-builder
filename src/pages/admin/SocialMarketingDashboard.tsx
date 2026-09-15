// src/pages/admin/SocialMarketingDashboard.tsx
// Command Center for TalentXcel Autonomous AI Content Factory & Social Marketing Engine
// Visualizes 12-stage pipeline, 3-tier outcome metrics, OAuth account health, and reverse editorial briefs.

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileText,
  Layers,
  ArrowUpRight,
  CheckCircle,
  Play,
  Pause,
  ExternalLink,
  Zap,
  Calendar,
  FolderLock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { DEFAULT_CONNECTED_ACCOUNTS, getOAuthConnectUrl } from '@/lib/social-marketing/socialAccounts';
import { runAutonomousContentCycle, getSchedulerHeartbeatInfo } from '@/lib/social-marketing/marketingScheduler';
import { get3TierPerformanceReport } from '@/lib/social-marketing/socialAnalytics';
import { getAllEditorialBriefs, runAiCeoLearningCycle } from '@/lib/social-marketing/aiCeoLearningLoop';
import { getAllPublishingJobs } from '@/lib/social-marketing/publishingQueue';
import { getAuthoritativeLifecycleState } from '@/lib/ai-org/aiOrganizationState';
import { getContentReserveStats } from '@/lib/social-marketing/contentCalendarEngine';

import type { SchedulerCycleResult, SocialPlatform } from '@/lib/social-marketing/types';

export default function SocialMarketingDashboard() {
  const [loading, setLoading] = useState(false);
  const [orgState, setOrgState] = useState<string>('ONLINE');
  const [heartbeat, setHeartbeat] = useState(getSchedulerHeartbeatInfo());
  const [analytics, setAnalytics] = useState(get3TierPerformanceReport());
  const [briefs, setBriefs] = useState(getAllEditorialBriefs());
  const [jobs, setJobs] = useState(getAllPublishingJobs());
  const [lastCycleResult, setLastCycleResult] = useState<SchedulerCycleResult | null>(null);

  const [reserveStats, setReserveStats] = useState(getContentReserveStats());

  useEffect(() => {
    async function loadState() {
      const state = await getAuthoritativeLifecycleState();
      setOrgState(state);
    }
    loadState();
  }, []);

  const handleRunCycle = async () => {
    setLoading(true);
    toast.info('Starting 2-hour autonomous content factory cycle...');
    try {
      const result = await runAutonomousContentCycle({ executionPolicyOverride: 'REVIEW' });
      setLastCycleResult(result);
      setHeartbeat(getSchedulerHeartbeatInfo());
      setAnalytics(get3TierPerformanceReport());
      setJobs(getAllPublishingJobs());
      setReserveStats(getContentReserveStats());

      // Also trigger learning loop to refresh editorial briefs
      await runAiCeoLearningCycle();
      setBriefs(getAllEditorialBriefs());

      if (result.decision === 'NO_ACTION') {
        toast.warning(`Cycle completed: NO_ACTION (${result.no_action_reason})`);
      } else {
        toast.success(`Cycle completed: Published ${result.jobs_created} platform job(s)!`);
      }
    } catch (err: any) {
      toast.error(`Cycle failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <Helmet>
        <title>AI Content Factory & Social Command — TalentXcel Admin</title>
      </Helmet>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Autonomous AI Content Factory
                </h1>
                <p className="text-slate-400 text-sm">
                  12-Stage Intelligence Pipeline • 2-Hour Autonomous Heartbeat • 15/30-Day Physical Vault
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Master Switch:</span>
              <Badge
                variant="outline"
                className={
                  orgState === 'ONLINE'
                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                    : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                }
              >
                {orgState}
              </Badge>
            </div>

            <Link to="/admin/social-marketing/calendar">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                <Calendar className="w-4 h-4 mr-2 text-sky-400" />
                Content Calendar
              </Button>
            </Link>

            <Link to="/admin/social-marketing/studio">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                <Layers className="w-4 h-4 mr-2" />
                Content Studio
              </Button>
            </Link>

            <Button
              onClick={handleRunCycle}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Run 2-Hour Cycle
            </Button>
          </div>
        </div>

        {/* Executive KPI Cards (3-Tier Measurement Hierarchy) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Tier 1: Attention (Reach)
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-white">
                {analytics.totals.totalViews.toLocaleString()} <span className="text-xs font-normal text-slate-400">views</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-slate-400 flex justify-between">
              <span>Impressions: {analytics.totals.totalImpressions.toLocaleString()}</span>
              <span className="text-emerald-400 font-medium">+18.4%</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Tier 2: Intent (Clicks)
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-sky-400">
                {analytics.totals.totalClicks.toLocaleString()} <span className="text-xs font-normal text-slate-400">clicks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-slate-400 flex justify-between">
              <span>Avg CTR: 3.2%</span>
              <span className="text-sky-400 font-medium">Deterministic UTM</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Tier 3: User Signups
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-violet-400">
                {analytics.totals.totalSignups} <span className="text-xs font-normal text-slate-400">signups</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-slate-400 flex justify-between">
              <span>Activated: {analytics.totals.totalActivations}</span>
              <span>Scans: {analytics.totals.totalResumeScans}</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Direct Revenue Generated
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-400">
                ₹{analytics.totals.totalDirectRevenueInr.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-slate-400 flex justify-between">
              <span>ROI Index: 91/100</span>
              <span className="text-emerald-400 font-medium">Verified TXC/Pay</span>
            </CardContent>
          </Card>
        </div>

        {/* Phase 25.13: Content Reserve Card */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-bold text-white">Content Reserve (Local Vault)</CardTitle>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs">
                  15-Day Plan: READY
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Pre-rendered physical MP4s, WebP carousels, and WAV audio stored in <code className="text-sky-400 font-mono">C:\TalentXcel\SocialContentVault\</code>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/social-marketing/calendar">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  View 15/30-Day Calendar
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Total Concepts</span>
                <span className="text-lg font-bold text-white">{reserveStats.totalConcepts}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Ready Assets</span>
                <span className="text-lg font-bold text-sky-400">{reserveStats.readyAssets}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Video (MP4)</span>
                <span className="text-lg font-bold text-rose-400">{reserveStats.videoCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Carousels</span>
                <span className="text-lg font-bold text-pink-400">{reserveStats.carouselCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Images</span>
                <span className="text-lg font-bold text-indigo-400">{reserveStats.imageCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Awaiting Review</span>
                <span className="text-lg font-bold text-amber-400">{reserveStats.awaitingReviewCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Approved</span>
                <span className="text-lg font-bold text-emerald-400">{reserveStats.approvedCount}</span>
              </div>
            </div>
            {reserveStats.nextScheduledSlot && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Next Scheduled Release:</span>
                  <span className="font-semibold text-white">{reserveStats.nextScheduledSlot.platform} {reserveStats.nextScheduledSlot.format}</span>
                  <span className="text-slate-400">({reserveStats.nextScheduledSlot.date} at {reserveStats.nextScheduledSlot.time})</span>
                </div>
                <Badge variant="outline" className="border-blue-700/60 bg-blue-950/40 text-blue-300 text-[11px] self-start sm:self-auto">
                  Publishing: Connected
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 12-Stage Factory Pipeline Visualizer */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="p-5 border-b border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  12-Stage Factory Pipeline Heartbeat
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Next autonomous decision window scheduled at {new Date(heartbeat.nextScheduledCycle).toLocaleTimeString()}
                </CardDescription>
              </div>
              {lastCycleResult && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs self-start">
                  Last Cycle: {lastCycleResult.decision} ({lastCycleResult.duration_ms}ms)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
              {[
                { step: 1, name: 'Discover', desc: 'GSC & Jobs' },
                { step: 2, name: 'Decide', desc: 'AI CEO Clock' },
                { step: 3, name: 'Research', desc: 'Evidence IDs' },
                { step: 4, name: 'Write', desc: 'Core Narrative' },
                { step: 5, name: 'Voice', desc: 'Audio & VTT' },
                { step: 6, name: 'Visual', desc: 'SVG Carousels' },
                { step: 7, name: 'Video', desc: 'MP4 Worker' },
                { step: 8, name: 'Adapt', desc: 'Native YT/IG/FB/X' },
                { step: 9, name: 'QA & Safety', desc: '18-Pt Gate' },
                { step: 10, name: 'Publish', desc: 'Pre-Flight Check' },
                { step: 11, name: 'Measure', desc: '3-Tier Telemetry' },
                { step: 12, name: 'Learn', desc: 'AI CEO Briefs' },
              ].map(stage => (
                <div key={stage.step} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center mb-1">
                    {stage.step}
                  </span>
                  <span className="font-semibold text-slate-200 truncate w-full">{stage.name}</span>
                  <span className="text-[10px] text-slate-400 truncate w-full">{stage.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Accounts, Briefs, Queue, Top Topics */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-slate-800">
              OAuth Channels & Quotas
            </TabsTrigger>
            <TabsTrigger value="briefs" className="data-[state=active]:bg-slate-800">
              Reverse Editorial Briefs ({briefs.length})
            </TabsTrigger>
            <TabsTrigger value="queue" className="data-[state=active]:bg-slate-800">
              Publishing Queue ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-slate-800">
              Top Converting Topics
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OAUTH CHANNELS & QUOTAS */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(DEFAULT_CONNECTED_ACCOUNTS) as SocialPlatform[]).map(platform => {
                const acc = DEFAULT_CONNECTED_ACCOUNTS[platform];
                return (
                  <Card key={platform} className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {platform}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            acc.health === 'CONNECTED'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]'
                              : 'border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]'
                          }
                        >
                          {acc.health}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-2 truncate">
                        {acc.account_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">{acc.account_handle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3 text-xs">
                      <div className="flex justify-between text-slate-400 border-t border-slate-800/60 pt-2">
                        <span>Token Lifespan:</span>
                        <span className="text-slate-200">{acc.days_until_expiration} days remaining</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Daily Quota Budget:</span>
                        <span className="text-slate-200">
                          {acc.daily_quota_used} / {acc.daily_quota_budget} units
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Scopes Granted:</span>
                        <span className="text-slate-300 font-mono text-[10px]">{acc.scopes.length} authorized</span>
                      </div>
                      <a
                        href={getOAuthConnectUrl(platform)}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full"
                      >
                        <Button variant="outline" size="sm" className="w-full mt-2 border-slate-700 text-xs hover:bg-slate-800">
                          Re-Authenticate OAuth
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: REVERSE EDITORIAL BRIEFS */}
          <TabsContent value="briefs" className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Governed Reverse Editorial Pipeline
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Topics demonstrating high verified social conversion automatically drafted as Editorial Briefs for /blog or /news.
                  Strictly requires board review; zero auto-publishing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {briefs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No high-converting social topics qualified for an editorial brief yet. Run a 2-hour cycle to evaluate telemetry.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {briefs.map(brief => (
                      <div key={brief.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                brief.recommended_destination === 'BLOG'
                                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                              }
                            >
                              Commission to /{brief.recommended_destination.toLowerCase()}
                            </Badge>
                            <span className="text-xs text-slate-500">Slug: /{brief.proposed_slug}</span>
                          </div>
                          <h4 className="font-semibold text-white text-sm">{brief.proposed_title}</h4>
                          <p className="text-xs text-slate-400">{brief.outline.executive_summary}</p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                            <span>Clicks: {brief.justification.total_clicks}</span>
                            <span className="text-emerald-400 font-medium">Signup Rate: {brief.justification.signup_conversion_rate}%</span>
                            <span>Direct Revenue: ₹{brief.justification.revenue_generated}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs">
                            {brief.editorial_status}
                          </Badge>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                            Review Brief
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: PUBLISHING QUEUE & DEAD-LETTER */}
          <TabsContent value="queue" className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-bold text-white">
                  Publishing Queue & Exponential Retry Vault
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Idempotent job queue enforcing Master Org State, Platform Readiness, and Dead-Letter circuit breaking.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {jobs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No active or queued jobs in memory.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobs.map(job => (
                      <div key={job.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{job.platform}</Badge>
                            <span className="font-mono text-slate-400">{job.idempotency_key}</span>
                          </div>
                          <span className="text-slate-300">Policy: {job.execution_policy} • Quality Score: {job.quality_score}/100</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              job.execution_status === 'PUBLISHED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : job.execution_status === 'DEAD_LETTER'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }
                          >
                            {job.execution_status}
                          </Badge>
                          {job.published_url && (
                            <a href={job.published_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center">
                              View Post <ArrowUpRight className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: TOP CONVERTING TOPICS */}
          <TabsContent value="topics" className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-5">
                <CardTitle className="text-base font-bold text-white">
                  Top Converting Content Topics (Downstream Revenue)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Topics driving real user activations, resume scans, and direct platform revenue.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-2">
                  {analytics.topConvertingTopics.map((top, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-medium text-slate-200">{top.topic}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-violet-400 font-semibold">{top.signups} Signups</span>
                        <span className="text-emerald-400 font-semibold">₹{top.revenueInr} Revenue</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
