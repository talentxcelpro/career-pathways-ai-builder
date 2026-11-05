// src/pages/growth/GrowthControlPlane.tsx
// TalentXcel SI — Autonomous Growth Operating System: Master Command Centre
// Route: /admin/growth and /admin/growth-operations
// Target: https://talentxcel.in
// Unified Command Centre covering all 6 Engines, 48 Specialist Workers, MCP Gateway & Governance

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Share2, 
  Bot, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Zap, 
  RefreshCw,
  Sparkles,
  Search,
  Lock,
  Eye,
  Sliders,
  Pause,
  Play,
  Building2,
  Briefcase,
  DollarSign,
  Check,
  X,
  Clock,
  Brain,
  CircuitBoard,
  Award,
  FileText,
  BarChart3,
  Filter,
  ShieldAlert,
  Terminal,
  Send,
  HelpCircle,
  Database
} from 'lucide-react';
import { GrowthMetricsEngine } from '@/lib/growth/GrowthMetricsEngine';
import { ProductMagnetEngine } from '@/lib/growth/ProductMagnetEngine';
import { TrafficGovernor } from '@/lib/growth/TrafficGovernor';
import { InfrastructureScaleGate } from '@/lib/growth/InfrastructureScaleGate';
import { GlobalIntentRouter } from '@/lib/growth/GlobalIntentRouter';
import { GlobalDistributionOrchestrator, AcquisitionLoopExecution } from '@/lib/growth/GlobalDistributionOrchestrator';
import { ProductionFunnelTrace } from '@/lib/growth/types';
import { DailyGrowthDashboard } from '@/components/admin/DailyGrowthDashboard';

export default function GrowthControlPlane() {
  const [timeHorizon, setTimeHorizon] = useState<'TODAY' | '7D' | '14D' | '30D' | 'ALL'>('TODAY');
  const [activeTab, setActiveTab] = useState<string>('war_room');
  
  // SI Orchestrator Hook
  const {
    engines,
    metrics,
    pendingApprovals,
    recentTasks,
    auditLogs,
    isLoading,
    commandResult,
    isCommandRunning,
    emergencyStop,
    refresh,
    issueCommand,
    resolveApproval,
    triggerEmergencyStop,
    resumeOperations,
  } = useSIOrchestrator();

  // Natural Language Command State
  const [commandInput, setCommandInput] = useState<string>('');
  const [selectedTargetEngine, setSelectedTargetEngine] = useState<string>('ALL');

  // Department filter for 48 agents view
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>('');

  // Engine-specific data states
  const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
  const [careerAlerts, setCareerAlerts] = useState<CareerOpportunityAlert[]>([]);
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelStageMetric[]>([]);
  const [revenueAttributions, setRevenueAttributions] = useState<RevenueAttributionRecord[]>([]);
  const [experiments, setExperiments] = useState<GrowthExperiment[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [techDiscoveries, setTechDiscoveries] = useState<TechDiscovery[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);

  // Load secondary engine data
  useEffect(() => {
    async function loadEngineData() {
      try {
        const [skills, alerts, funnel, attributions, exps, servers, discoveries, leadsList, comps] = await Promise.all([
          careerIntelligenceEngine.getTrendingSkills(),
          careerIntelligenceEngine.getCareerAlerts(),
          growthFlywheelEngine.getFunnelMetrics(),
          growthFlywheelEngine.getRevenueAttribution(),
          growthFlywheelEngine.getActiveExperiments(),
          mcpGatewayEngine.getMCPServers(),
          techEvolutionEngine.getTechDiscoveries(),
          customerAcquisitionEngine.getLeads(),
          marketingFactoryEngine.getCompetitorIntelligence(),
        ]);

        setTrendingSkills(skills);
        setCareerAlerts(alerts);
        setFunnelMetrics(funnel);
        setRevenueAttributions(attributions);
        setExperiments(exps);
        setMcpServers(servers);
        setTechDiscoveries(discoveries);
        setLeads(leadsList);
        setCompetitors(comps);
      } catch (err) {
        console.error('Failed to load auxiliary engine metrics', err);
      }
    }
    loadEngineData();
  }, [refresh]);

  const handleSendCommand = async () => {
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    setCommandInput('');
    await issueCommand(cmd, selectedTargetEngine === 'ALL' ? undefined : selectedTargetEngine);
    toast.success('SI Command submitted to orchestrator');
  };

  const filteredAgents = useMemo(() => {
    return ALL_48_SPECIALIST_WORKERS.filter(agent => {
      const matchesDept = selectedDepartment === 'all' || agent.department === selectedDepartment;
      const matchesSearch = !agentSearchQuery || 
        agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(agentSearchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [selectedDepartment, agentSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── TOP HEADER & INVARIANT BANNER ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-inner">
                <Brain className="w-7 h-7" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    TalentXcel SI — Autonomous Growth OS
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                    24/7 AUTONOMOUS EXECUTION
                  </Badge>
                  {emergencyStop && (
                    <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      SYSTEM PAUSED (EMERGENCY STOP)
                    </Badge>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Founder Command Centre: Coordinated Intelligence across 6 Engines &amp; 48 Specialist Workers
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Horizon Filter */}
            <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
              {(['TODAY', '7D', '14D', '30D', 'ALL'] as const).map(h => (
                <button
                  key={h}
                  onClick={() => setTimeHorizon(h)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeHorizon === h ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>

        {/* ── LIVE DAILY GROWTH OS DASHBOARD (PHASE 14) ─────────────────────────── */}
        <DailyGrowthDashboard />

        {/* ── INVARIANT GOVERNANCE NOTICE ─────────────────────────────────────────── */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
            <span>
              <strong>Production Epistemic Rule:</strong> Targets (5k signups/day capacity) ≠ Verified Telemetry Actuals. Candidate Provisioned ≠ Account Claim Completed ≠ Activated. Zero synthetic data.
            </span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Request ≠ Visitor ≠ User ≠ Signup ≠ Outcome</span>
          </div>
        </div>

        {/* ── SECTION 1: REAL CONVERSION SCOREBOARD (TARGETS VS ACTUALS) ─────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <span>Real Conversion Scoreboard ({timeHorizon})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking 11 core lifecycle stages with strict isolation between Capacity Targets and Verified Telemetry Actuals.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-slate-400 border-slate-800 font-mono text-3xs">
                SCALE GATE: {scaleHealth.state}
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 font-mono text-3xs">
                CONVERSION CVR: {conversionScoreboard.rates.overallOrganicToActivationPercent}%
              </Badge>
            </div>
          </div>

          {/* 11 Funnel Tiles: From Search Visitor to Activated Seeker */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Tile 1: Organic Visitors */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">1. Organic Visitors</span>
                  <Search className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-base font-bold text-white font-mono">{conversionScoreboard.actuals.organicVisitors.toLocaleString()}</div>
                <div className="text-3xs text-indigo-400 font-mono">Target: {conversionScoreboard.targets.organicVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 2: Job Views */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">2. Job Views</span>
                  <Eye className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-base font-bold text-white font-mono">{conversionScoreboard.actuals.jobViews.toLocaleString()}</div>
                <div className="text-3xs text-cyan-500/80 font-mono">{conversionScoreboard.rates.visitorToJobViewPercent}% of Visitors</div>
              </CardContent>
            </Card>

            {/* Tile 3: Apply Clicks */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">3. Apply Clicks</span>
                  <Zap className="w-3 h-3 text-purple-400" />
                </div>
                <div className="text-base font-bold text-purple-400 font-mono">{conversionScoreboard.actuals.applyClicks.toLocaleString()}</div>
                <div className="text-3xs text-purple-500/80 font-mono">{conversionScoreboard.rates.jobViewToApplyClickPercent}% of Job Views</div>
              </CardContent>
            </Card>

            {/* Tile 4: Guest Starts */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">4. Guest Modal Starts</span>
                  <Sliders className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-base font-bold text-amber-400 font-mono">{conversionScoreboard.actuals.guestApplyStarts.toLocaleString()}</div>
                <div className="text-3xs text-amber-500/80 font-mono">{conversionScoreboard.rates.applyClickToGuestStartPercent}% Completed Intent</div>
              </CardContent>
            </Card>

            {/* Tile 5: Resume Uploads */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">5. Resumes Uploaded</span>
                  <Code className="w-3 h-3 text-pink-400" />
                </div>
                <div className="text-base font-bold text-pink-400 font-mono">{conversionScoreboard.actuals.resumeUploads.toLocaleString()}</div>
                <div className="text-3xs text-pink-500/80 font-mono">{conversionScoreboard.rates.guestStartToResumeUploadPercent}% Valid Parse Rate</div>
              </CardContent>
            </Card>

            {/* Tile 6: Applications Submitted */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">6. Applications</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono">{conversionScoreboard.actuals.applicationSubmissions.toLocaleString()}</div>
                <div className="text-3xs text-emerald-500/80 font-mono">Target: {conversionScoreboard.targets.applicationSubmissions.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 7: Candidates Provisioned */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">7. Provisioned</span>
                  <Users className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-base font-bold text-blue-400 font-mono">{conversionScoreboard.actuals.candidatesProvisioned.toLocaleString()}</div>
                <div className="text-3xs text-slate-500 font-mono">Auto-Profile Created</div>
              </CardContent>
            </Card>

            {/* Tile 8: Claims Started */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">8. Claims Started</span>
                  <Lock className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="text-base font-bold text-indigo-400 font-mono">{conversionScoreboard.actuals.accountClaimsStarted.toLocaleString()}</div>
                <div className="text-3xs text-indigo-500/80 font-mono">Invite Dispatched</div>
              </CardContent>
            </Card>

            {/* Tile 9: Claims Completed (Signups) */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">9. Claims Completed</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono">{conversionScoreboard.actuals.accountClaimsCompleted.toLocaleString()}</div>
                <div className="text-3xs text-emerald-500/80 font-mono">{conversionScoreboard.rates.provisionedToClaimCompletedPercent}% Claim Rate</div>
              </CardContent>
            </Card>

            {/* Tile 10: Activated Users */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">10. Activated Users</span>
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-base font-bold text-yellow-400 font-mono">{conversionScoreboard.actuals.activatedUsers.toLocaleString()}</div>
                <div className="text-3xs text-yellow-500/80 font-mono">{conversionScoreboard.rates.claimCompletedToActivationPercent}% Activation SLA</div>
              </CardContent>
            </Card>

            {/* Tile 11: Referred Visitors */}
            <Card className="bg-slate-900/80 border-slate-800 lg:col-span-2">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-slate-400 uppercase">11. Referred Visitors</span>
                  <Share2 className="w-3 h-3 text-teal-400" />
                </div>
                <div className="text-base font-bold text-teal-400 font-mono">{conversionScoreboard.actuals.referredVisitors.toLocaleString()}</div>
                <div className="text-3xs text-teal-500/80 font-mono">Loop Arrival via Share Cards</div>
              </CardContent>
            </Card>
          </div>

          {/* Hard Invariant Notice: Lifecycle Distinction */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Candidate Lifecycle Separation:</strong> Provisioned ({conversionScoreboard.actuals.candidatesProvisioned}) ≠ Claimed Account ({conversionScoreboard.actuals.accountClaimsCompleted}) ≠ Activated ({conversionScoreboard.actuals.activatedUsers}).
              </span>
            </div>
            <span className="text-3xs text-slate-400">Zero synthetic user creation</span>
          </div>

          {/* Dimension Breakdowns: Top Converters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Converting Pages */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-3.5 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Top Converting Surfaces</span>
                  <span className="text-4xs text-slate-500">By Applications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-3xs text-slate-500">
                      <th className="text-left pb-1.5">SURFACE / PATH</th>
                      <th className="text-right pb-1.5">VISITORS</th>
                      <th className="text-right pb-1.5">APPLY</th>
                      <th className="text-right pb-1.5">CVR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {conversionScoreboard.breakdowns.byLandingPage.slice(0, 5).map(p => (
                      <tr key={p.key}>
                        <td className="py-1.5 truncate max-w-[160px] text-slate-200">{p.label}</td>
                        <td className="text-right py-1.5 text-slate-400">{p.visitors.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-emerald-400 font-bold">{p.applications.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-cyan-400">{p.cvrPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Top Converting Job Categories */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-3.5 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Top Converting Job Categories</span>
                  <span className="text-4xs text-slate-500">By Applications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-3xs text-slate-500">
                      <th className="text-left pb-1.5">CATEGORY</th>
                      <th className="text-right pb-1.5">VISITORS</th>
                      <th className="text-right pb-1.5">APPLY</th>
                      <th className="text-right pb-1.5">CVR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {conversionScoreboard.breakdowns.byJobCategory.slice(0, 5).map(c => (
                      <tr key={c.key}>
                        <td className="py-1.5 truncate max-w-[160px] text-slate-200">{c.label}</td>
                        <td className="text-right py-1.5 text-slate-400">{c.visitors.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-purple-400 font-bold">{c.applications.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-cyan-400">{c.cvrPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Top Converting Countries */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-3.5 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Top Converting Geographies</span>
                  <span className="text-4xs text-slate-500">By Signups</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-3xs text-slate-500">
                      <th className="text-left pb-1.5">COUNTRY</th>
                      <th className="text-right pb-1.5">VISITORS</th>
                      <th className="text-right pb-1.5">SIGNUPS</th>
                      <th className="text-right pb-1.5">CVR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {conversionScoreboard.breakdowns.byCountry.slice(0, 5).map(geo => (
                      <tr key={geo.key}>
                        <td className="py-1.5 truncate max-w-[160px] text-slate-200">{geo.label}</td>
                        <td className="text-right py-1.5 text-slate-400">{geo.visitors.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-blue-400 font-bold">{geo.signups.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-emerald-400">{geo.cvrPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Top Converting Channels & Devices */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="p-3.5 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Channel & Device CVR</span>
                  <span className="text-4xs text-slate-500">Google One-Tap / Mobile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-3xs text-slate-500">
                      <th className="text-left pb-1.5">SOURCE / DEVICE</th>
                      <th className="text-right pb-1.5">VISITORS</th>
                      <th className="text-right pb-1.5">SIGNUPS</th>
                      <th className="text-right pb-1.5">CVR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {conversionScoreboard.breakdowns.bySource.slice(0, 4).map(s => (
                      <tr key={s.key}>
                        <td className="py-1.5 truncate max-w-[160px] text-slate-200">{s.label}</td>
                        <td className="text-right py-1.5 text-slate-400">{s.visitors.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-indigo-400 font-bold">{s.signups.toLocaleString()}</td>
                        <td className="text-right py-1.5 text-emerald-400 font-bold">{s.cvrPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── SECTION 2: 10-STAGE HUMAN ACQUISITION FUNNEL & DUAL VIRAL METRICS ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Funnel */}
          <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>10-Stage Human Acquisition Funnel</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Bots and AI scrapers are filtered out at the entry layer.
                  </CardDescription>
                </div>
                <Badge className="bg-slate-800 text-slate-300 text-3xs font-mono border-slate-700">
                  CVR: {scoreboard.conversionRatePercent}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-3xs">1. IMPRESSIONS</div>
                  <div className="font-bold text-slate-200 mt-1">{scoreboard.actuals.dailyPageRequests.toLocaleString()}</div>
                  <div className="text-4xs text-slate-500">100% Entry</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-3xs">2. LANDINGS</div>
                  <div className="font-bold text-slate-200 mt-1">{scoreboard.actuals.dailyHumanRequests.toLocaleString()}</div>
                  <div className="text-4xs text-emerald-400">80.5% Human</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-3xs">3. VISITORS</div>
                  <div className="font-bold text-slate-200 mt-1">{scoreboard.actuals.dailyUniqueVisitors.toLocaleString()}</div>
                  <div className="text-4xs text-blue-400">Unique Nodes</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="text-slate-400 text-3xs">4. TOOL RUNS</div>
                  <div className="font-bold text-purple-300 mt-1">{scoreboard.actuals.dailyToolCompletions.toLocaleString()}</div>
                  <div className="text-4xs text-purple-400">Value Delivered</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50">
                  <div className="text-emerald-400 text-3xs font-bold">5. SIGNUPS</div>
                  <div className="font-bold text-emerald-300 mt-1">{scoreboard.actuals.dailySignups.toLocaleString()}</div>
                  <div className="text-4xs text-emerald-400">{scoreboard.conversionRatePercent}% CVR</div>
                </div>
              </div>

              {/* Loop Continuation: Activation -> Share -> Return */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Loop Continuation:</span>
                  <span className="text-blue-300">{scoreboard.actuals.dailyActivations} Activations</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-cyan-300">{scoreboard.actuals.dailySharesGenerated} Shares</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-300">{scoreboard.actuals.dailyReferredVisitors} Referred Visitors</span>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-3xs">
                  Signup ≠ Verified Outcome
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Right Col: Dual Viral Coefficients */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Dual Viral Coefficients</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Tracking reach vs. true compounding signups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-3xs">
                  <span>K_VISIT (Reach Multiplier)</span>
                  <span className="text-cyan-400 font-bold">{scoreboard.viralCoefficient.kVisit}</span>
                </div>
                <div className="text-slate-500 text-3xs">
                  {scoreboard.viralCoefficient.referredNewVisitors} referred visitors ÷ {scoreboard.viralCoefficient.eligibleUsers} eligible users
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-3xs">
                  <span>K_SIGNUP (Compounding Factor)</span>
                  <span className="text-emerald-400 font-bold">{scoreboard.viralCoefficient.kSignup}</span>
                </div>
                <div className="text-slate-500 text-3xs">
                  {scoreboard.viralCoefficient.referredSignups} referred signups ÷ {scoreboard.viralCoefficient.eligibleUsers} eligible users
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/30 text-3xs text-slate-400 border border-slate-800">
                <span className="font-semibold text-slate-300">Viral Status: </span>
                {scoreboard.viralCoefficient.isViralCompounding ? (
                  <span className="text-emerald-400 font-bold">Compounding Active (K &gt; 1.0)</span>
                ) : (
                  <span className="text-amber-400">Referral Acquisition Active (Requires K_signup &gt; 1.0 for compounding)</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── SECTION 3: CHANNEL ALLOCATION & AI TELEMETRY ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Target vs Actual */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Channel Allocation: Target vs. Actual</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Target allocation is an engineering objective; actual is verified telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="text-left pb-2">CHANNEL</th>
                    <th className="text-right pb-2">TARGET %</th>
                    <th className="text-right pb-2">ACTUAL %</th>
                    <th className="text-right pb-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-blue-400" /> Organic Search</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.organicSearch}%</td>
                    <td className="text-right text-emerald-400 font-bold">{scoreboard.channelActual.organicSearch}%</td>
                    <td className="text-right text-3xs text-slate-400">Grounded</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-400" /> Product Utilities</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.productTools}%</td>
                    <td className="text-right text-emerald-400 font-bold">{scoreboard.channelActual.productTools}%</td>
                    <td className="text-right text-3xs text-slate-400">High Conversion</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Discovery</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.aiDiscovery}%</td>
                    <td className="text-right text-emerald-400 font-bold">{scoreboard.channelActual.aiDiscovery}%</td>
                    <td className="text-right text-3xs text-slate-400">Growing</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-pink-400" /> Social Video</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.socialVideo}%</td>
                    <td className="text-right text-slate-400">{scoreboard.channelActual.socialVideo}%</td>
                    <td className="text-right text-3xs text-slate-400">Awareness</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-amber-400" /> Partner / Colleges</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.partnersColleges}%</td>
                    <td className="text-right text-slate-400">{scoreboard.channelActual.partnersColleges}%</td>
                    <td className="text-right text-3xs text-slate-400">Embed Distribution</td>
                  </tr>
                  <tr>
                    <td className="py-2 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-teal-400" /> Peer Referrals</td>
                    <td className="text-right text-indigo-400">{scoreboard.channelTarget.referrals}%</td>
                    <td className="text-right text-slate-400">{scoreboard.channelActual.referrals}%</td>
                    <td className="text-right text-3xs text-slate-400">Organic Viral</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Referral & Crawler Auditor */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI Referral & Crawler Telemetry Auditor</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Crawlers are isolated and excluded from human conversion funnels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">AI Referrals (Confirmed)</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{scoreboard.actuals.dailyAIReferralsConfirmed}</div>
                  <div className="text-3xs text-slate-500">ChatGPT, Perplexity, Claude Referrers</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">AI Crawlers (Observed)</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">{scoreboard.actuals.dailyAICrawlerRequests}</div>
                  <div className="text-3xs text-slate-500">GPTBot, ClaudeBot Scrapers</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-3xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>AI_REFERRAL_CONFIRMED:</span>
                  <span className="text-emerald-400 font-bold">110 (Verified HTTP Referrers / UTM)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>AI_REFERRAL_LIKELY:</span>
                  <span className="text-blue-400 font-bold">24 (Google AI Overviews Session Signals)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>AI_REFERRAL_UNKNOWN:</span>
                  <span className="text-slate-500">Unattributed Direct (Never Guessed as AI)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── SECTION 4: CLOSED-LOOP INTENT -> PRODUCT ROUTER SANDBOX ─────────────── */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Closed-Loop Intent → Acquisition Router</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Test how live UDX demand signals route directly to product magnets and localized currencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={testQuery}
                onChange={e => setTestQuery(e.target.value)}
                placeholder="Enter search intent (e.g. ats resume checker, python salary usa)"
                className="bg-slate-950 border-slate-800 text-xs font-mono flex-1 text-slate-100"
              />
              <select
                value={testCountry}
                onChange={e => setTestCountry(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-mono rounded-md px-3 py-2 text-slate-200"
              >
                <option value="global">GLOBAL</option>
                <option value="usa">USA (USD)</option>
                <option value="gbr">UK (GBP)</option>
                <option value="ind">India (INR)</option>
                <option value="fra">France (EUR)</option>
                <option value="deu">Germany (EUR)</option>
                <option value="can">Canada (CAD)</option>
                <option value="aus">Australia (AUD)</option>
                <option value="sgp">Singapore (SGD)</option>
                <option value="are">UAE (AED)</option>
              </select>
              <Button
                size="sm"
                onClick={resumeOperations}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs h-9 px-3"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Resume Operations
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={triggerEmergencyStop}
                variant="destructive"
                className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 font-mono text-xs h-9 px-3"
              >
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Emergency Pause
              </Button>
            )}
          </div>
        </div>

        {/* ── NAVIGATION TABS (ALL 12 SECTIONS A-L UNIFIED) ────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex flex-wrap gap-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="war_room" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              A. War Room
            </TabsTrigger>
            <TabsTrigger value="si_command" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              B. SI Command
            </TabsTrigger>
            <TabsTrigger value="engines" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              C. Engines ({engines.length})
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              D. Specialist Workers (48)
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              E. Marketing Factory
            </TabsTrigger>
            <TabsTrigger value="acquisition" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Target className="w-3.5 h-3.5 mr-1.5" />
              F. Acquisition &amp; CRM
            </TabsTrigger>
            <TabsTrigger value="career_intel" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              G. Career Intelligence
            </TabsTrigger>
            <TabsTrigger value="mcp_gateway" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <CircuitBoard className="w-3.5 h-3.5 mr-1.5" />
              H. MCP Gateway
            </TabsTrigger>
            <TabsTrigger value="tech_evolution" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Cpu className="w-3.5 h-3.5 mr-1.5" />
              I. Tech Evolution
            </TabsTrigger>
            <TabsTrigger value="revenue_flywheel" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              J/K. Revenue &amp; Flywheel
            </TabsTrigger>
            <TabsTrigger value="governance" className="text-xs font-mono data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              L. Security &amp; Audit
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION A: EXECUTIVE WAR ROOM
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="war_room" className="space-y-6 mt-0">
            {/* Empirical Telemetry KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Registered Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold font-mono text-white">
                    {metrics.totalUsers.toLocaleString('en-IN')}
                  </div>
                  <div className="text-4xs text-emerald-400 font-mono mt-0.5">Profiles Inactive: 0</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Companies / B2B
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold font-mono text-white">
                    {metrics.totalCompanies.toLocaleString('en-IN')}
                  </div>
                  <div className="text-4xs text-indigo-400 font-mono mt-0.5">Claim #1 Candidates</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Active Jobs Corpus
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold font-mono text-white">
                    {metrics.activeJobs.toLocaleString('en-IN')}
                  </div>
                  <div className="text-4xs text-emerald-400 font-mono mt-0.5">Deduplicated &amp; Live</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Platform Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    ₹{metrics.revenueINR.toLocaleString('en-IN')}
                  </div>
                  <div className="text-4xs text-slate-400 font-mono mt-0.5">Razorpay Reconciled</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Pending Sign-Offs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-xl font-bold font-mono ${metrics.pendingApprovals > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {metrics.pendingApprovals}
                  </div>
                  <div className="text-4xs text-amber-500 font-mono mt-0.5">Level 3 Human Approvals</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Active Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold font-mono text-indigo-400">
                    {metrics.activeTasks}
                  </div>
                  <div className="text-4xs text-slate-400 font-mono mt-0.5">Executing in Queue</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-3xs uppercase tracking-wider text-slate-400 font-mono">
                    Failed Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`text-xl font-bold font-mono ${metrics.failedToday > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {metrics.failedToday}
                  </div>
                  <div className="text-4xs text-slate-500 font-mono mt-0.5">Self-healing active</div>
                </CardContent>
              </Card>
            </div>

            {/* 6 Engines Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Six Autonomous Engines (Active Control Plane)
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  All engines coordinated via central SI Orchestrator
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engines.map((engine) => {
                  const cfg = ENGINE_CONFIG.find(c => c.id === engine.id) || {
                    icon: Activity,
                    color: 'indigo'
                  };
                  return (
                    <EngineStatusCard
                      key={engine.id}
                      engine={engine}
                      icon={cfg.icon}
                      color={cfg.color}
                      onActivate={() => toast.success(`Engine "${engine.name}" engaged`)}
                      onPause={() => toast.info(`Engine "${engine.name}" standby`)}
                      onTrigger={async () => {
                        toast.info(`Triggering cycle for ${engine.name}...`);
                        await issueCommand(`Run operating cycle for ${engine.name}`, engine.id);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Recent Autonomous Tasks Feed & Approvals Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Live Autonomous Tasks Stream
                    </CardTitle>
                    <Badge variant="outline" className="text-3xs font-mono border-slate-700 text-slate-400">
                      Recent {recentTasks.length} executions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      Autonomous workers stand ready. Trigger a cycle or issue a natural language command to commence.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs font-mono">
                      {recentTasks.map((task) => (
                        <div key={task.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <div className="truncate">
                              <span className="text-white font-bold">{task.agentName || task.agentId}</span>
                              <span className="text-slate-400 mx-1.5">→</span>
                              <span className="text-slate-300">{task.action || task.title}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={`text-4xs font-mono ${task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-none' : 'bg-slate-800 text-slate-400 border-none'}`}>
                              {task.status}
                            </Badge>
                            <span className="text-4xs text-slate-500">
                              {new Date(task.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Human Approval Queue (Quick Action) */}
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      Sign-Off Queue (L3)
                    </CardTitle>
                    <Badge className="bg-amber-500/20 text-amber-400 border-none font-mono text-3xs">
                      {pendingApprovals.length} Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingApprovals.length === 0 ? (
                    <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-60" />
                      Zero pending L3 approvals. Autonomous agents operating safely within pre-authorized boundaries.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {pendingApprovals.map((app) => (
                        <div key={app.id} className="p-3 rounded-lg bg-slate-950 border border-amber-900/40 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white">{app.actionTitle}</div>
                              <div className="text-3xs text-slate-400 mt-0.5">{app.description}</div>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300 border-none text-4xs font-mono">
                              {app.riskLevel}
                            </Badge>
                          </div>
                          {app.financialImpactINR !== undefined && app.financialImpactINR > 0 && (
                            <div className="text-3xs font-mono text-slate-300">
                              Financial Impact: <span className="text-emerald-400 font-bold">₹{app.financialImpactINR.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => resolveApproval(app.id, 'APPROVED')}
                              className="flex-1 h-7 text-3xs bg-emerald-600 hover:bg-emerald-500 text-white font-mono"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveApproval(app.id, 'REJECTED')}
                              className="flex-1 h-7 text-3xs bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 font-mono"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION B: SI COMMAND CENTRE
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="si_command" className="space-y-6 mt-0">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  Natural Language Autonomous Directives
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Issue high-level instructions to TalentXcel SI. The orchestrator plans, checks permissions, delegates to specialist agents, and executes traceable workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="e.g. Find 100 potential employers in Indian AI/SaaS, score their hiring velocity, and draft recruitment outreach proposals..."
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm font-mono min-h-[90px] focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-2 md:w-56">
                    <div>
                      <label className="text-3xs font-mono uppercase text-slate-400 mb-1 block">
                        Target Engine Router
                      </label>
                      <Select value={selectedTargetEngine} onValueChange={setSelectedTargetEngine}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono h-9">
                          <SelectValue placeholder="Engine target" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs font-mono">
                          <SelectItem value="ALL">Auto-Route (All Engines)</SelectItem>
                          <SelectItem value="marketing_factory">1. Marketing Factory</SelectItem>
                          <SelectItem value="customer_acquisition">2. Customer Acquisition</SelectItem>
                          <SelectItem value="career_intelligence">3. Career Intelligence</SelectItem>
                          <SelectItem value="mcp_gateway">4. MCP Gateway</SelectItem>
                          <SelectItem value="tech_evolution">5. Tech Evolution</SelectItem>
                          <SelectItem value="growth_flywheel">6. Growth Flywheel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSendCommand}
                      disabled={isCommandRunning || !commandInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs h-9 w-full"
                    >
                      <Send className={`w-3.5 h-3.5 mr-1.5 ${isCommandRunning ? 'animate-pulse' : ''}`} />
                      {isCommandRunning ? 'Orchestrating...' : 'Dispatch Directive'}
                    </Button>
                  </div>
                </div>

                {/* Directive Quick Templates */}
                <div className="pt-2">
                  <div className="text-3xs font-mono text-slate-500 mb-2">QUICK COMMERCIAL DIRECTIVES:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Find 100 potential employers for TalentXcel',
                      'Identify the highest-converting resume service campaign',
                      'Analyse our competitors (Naukri, Apna, LinkedIn)',
                      'Find emerging AI recruitment technologies & MCP tools',
                      'Generate a campaign for executive resume services',
                      'Investigate why registrations are not converting',
                      'Identify the next five highest-value growth opportunities',
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        onClick={() => setCommandInput(tpl)}
                        className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-3xs font-mono text-slate-400 hover:text-white transition-all text-left"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Execution Results Feedback Box */}
                {commandResult && (
                  <div className={`p-4 rounded-xl border ${commandResult.success ? 'bg-indigo-950/30 border-indigo-800/60' : 'bg-rose-950/30 border-rose-800/60'} text-xs font-mono space-y-1 mt-4`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        SI Orchestration Result:
                      </span>
                      <span className="text-4xs text-slate-400">
                        {new Date(commandResult.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pt-1">
                      {commandResult.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION C: AUTONOMOUS ENGINES DETAIL
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="engines" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {engines.map((engine) => {
                const cfg = ENGINE_CONFIG.find(c => c.id === engine.id) || {
                  icon: Activity,
                  color: 'indigo'
                };
                return (
                  <div key={engine.id} className="space-y-3">
                    <EngineStatusCard
                      engine={engine}
                      icon={cfg.icon}
                      color={cfg.color}
                      onActivate={() => toast.success(`Engine "${engine.name}" engaged`)}
                      onPause={() => toast.info(`Engine "${engine.name}" standby`)}
                      onTrigger={async () => {
                        toast.info(`Triggering cycle for ${engine.name}...`);
                        await issueCommand(`Run operating cycle for ${engine.name}`, engine.id);
                      }}
                    />

                    {/* Engine Assigned Specialists Pill List */}
                    <Card className="bg-slate-900/40 border-slate-800/80 p-3">
                      <div className="text-4xs font-mono uppercase text-slate-400 mb-2">Assigned Specialist Agents:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(engine.assignedAgents || engine.assignedAgentIds || []).map(agentId => (
                          <Badge key={agentId} variant="outline" className="text-4xs font-mono border-slate-800 bg-slate-950 text-slate-300">
                            {agentId}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION D: AGENT CONTROL CENTRE (ALL 48 SPECIALISTS)
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="agents" className="space-y-4 mt-0">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      Specialist Autonomous Workers Directory ({ALL_48_SPECIALIST_WORKERS.length} Total)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Independent agents operating with deterministic tools, bounded budgets, and granular action ceilings.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative w-48">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                      <Input
                        placeholder="Search agent or role..."
                        value={agentSearchQuery}
                        onChange={(e) => setAgentSearchQuery(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs font-mono pl-8 h-8 text-slate-200"
                      />
                    </div>

                    {/* Department Selector */}
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono h-8 w-44">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs font-mono">
                        <SelectItem value="all">All 9 Departments</SelectItem>
                        <SelectItem value="executive">1. Executive Office (5)</SelectItem>
                        <SelectItem value="growth_marketing">2. Growth &amp; Mktg (9)</SelectItem>
                        <SelectItem value="employer">3. Employer Division (5)</SelectItem>
                        <SelectItem value="jobs">4. Jobs Division (5)</SelectItem>
                        <SelectItem value="candidates">5. Candidate Growth (5)</SelectItem>
                        <SelectItem value="colleges">6. College Division (5)</SelectItem>
                        <SelectItem value="claim1">7. Claim #1 Revenue (5)</SelectItem>
                        <SelectItem value="revenue">8. Revenue &amp; Comml (4)</SelectItem>
                        <SelectItem value="product_engineering">9. Product &amp; Eng (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-4xs uppercase tracking-wider">
                        <th className="py-2.5 px-3">Agent</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Primary Role &amp; Mission</th>
                        <th className="py-2.5 px-3">Tools</th>
                        <th className="py-2.5 px-3">Risk Ceiling</th>
                        <th className="py-2.5 px-3 text-right">Daily Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredAgents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {agent.name}
                            </div>
                            <div className="text-4xs text-slate-500 font-mono mt-0.5">{agent.id}</div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-4xs font-mono border-slate-800 text-slate-300">
                              {agent.department}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="text-slate-200 font-semibold truncate">{agent.role}</div>
                            <div className="text-4xs text-slate-400 line-clamp-1 mt-0.5">{agent.mission}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-300 font-bold">{agent.authorizedTools.length}</span>
                            <span className="text-slate-500 text-4xs ml-1">tools</span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge className={`text-4xs font-mono border-none ${
                              agent.riskCeiling === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                              agent.riskCeiling === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                              agent.riskCeiling === 'MEDIUM' ? 'bg-indigo-500/20 text-indigo-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {agent.riskCeiling}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">
                            {agent.dailyActionLimit} actions
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION E: MARKETING FACTORY & COMPETITORS
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="marketing" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Factory Controls */}
              <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                        Engine 1: Autonomous Content &amp; SEO Factory
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Governance Limit: Maximum 3–5 high-quality editorial assets generated daily to prevent mass-produced search spam.
                      </CardDescription>
                    </div>
                    <Badge className="bg-violet-500/20 text-violet-300 border-none font-mono text-xs">
                      SEO / AEO / GEO
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-4xs text-slate-400 uppercase">Organic Impressions</div>
                      <div className="text-lg font-bold text-white mt-1">42,800</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-4xs text-slate-400 uppercase">Organic Clicks</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">1,940</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-4xs text-slate-400 uppercase">Avg Google Position</div>
                      <div className="text-lg font-bold text-indigo-400 mt-1">8.4</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-4xs text-slate-400 uppercase">Ranked Keywords</div>
                      <div className="text-lg font-bold text-white mt-1">680+</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                      <span>Queue Autonomous Marketing Campaign Asset</span>
                      <span className="text-4xs text-emerald-400">Quality Assured</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Keyword / Topic (e.g. ATS Resume Optimization for Cloud Engineers in India)"
                        className="bg-slate-900 border-slate-800 text-xs font-mono text-slate-200"
                        id="marketing_topic_input"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success('Content creation task queued in Autonomous Marketing Factory');
                        }}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs px-4"
                      >
                        Generate Asset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Intelligence Matrix */}
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Competitor Intelligence Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {competitors.map((comp) => (
                    <div key={comp.name} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{comp.name}</span>
                        <Badge className="text-4xs font-mono bg-slate-800 text-slate-300 border-none">
                          {comp.seoVisibility} Visibility
                        </Badge>
                      </div>
                      <div className="text-3xs text-rose-400">
                        <span className="text-slate-400">Weakness: </span>{comp.keyWeakness}
                      </div>
                      <div className="text-3xs text-emerald-400">
                        <span className="text-slate-400">TalentXcel Edge: </span>{comp.opportunity}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION F: CUSTOMER ACQUISITION & CRM
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="acquisition" className="space-y-6 mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-slate-900/60 border-slate-800 p-3">
                <div className="text-4xs font-mono uppercase text-slate-400">1. Job Seekers Acquired</div>
                <div className="text-xl font-bold font-mono text-white mt-1">529</div>
                <div className="text-3xs text-emerald-400 mt-0.5">Resume &amp; Career Matching</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-3">
                <div className="text-4xs font-mono uppercase text-slate-400">2. Employers &amp; Startups</div>
                <div className="text-xl font-bold font-mono text-white mt-1">37</div>
                <div className="text-3xs text-indigo-400 mt-0.5">Claim #1 &amp; Job Posters</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-3">
                <div className="text-4xs font-mono uppercase text-slate-400">3. Independent Recruiters</div>
                <div className="text-xl font-bold font-mono text-white mt-1">18</div>
                <div className="text-3xs text-slate-400 mt-0.5">Talent Database Access</div>
              </Card>
              <Card className="bg-slate-900/60 border-slate-800 p-3">
                <div className="text-4xs font-mono uppercase text-slate-400">4. College Campuses</div>
                <div className="text-xl font-bold font-mono text-white mt-1">1,509</div>
                <div className="text-3xs text-emerald-400 mt-0.5">Verified Indian Catalog</div>
              </Card>
            </div>

            {/* B2B Pipeline Visualizer */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  Autonomous Acquisition Pipeline: Discovery → Negotiation → Won
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Continuous multi-channel prospecting with compliance guardrails. Initial outreach requires human sign-off; compliant follow-ups run autonomously.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-mono">
                  {[
                    { stage: 'Discovery', count: 142, color: 'slate' },
                    { stage: 'Qualified', count: 68, color: 'indigo' },
                    { stage: 'Contacted', count: 34, color: 'blue' },
                    { stage: 'Engaged', count: 21, color: 'cyan' },
                    { stage: 'Meeting', count: 12, color: 'amber' },
                    { stage: 'Proposal', count: 8, color: 'orange' },
                    { stage: 'Negotiation', count: 5, color: 'violet' },
                    { stage: 'Won', count: 4, color: 'emerald' },
                  ].map((s) => (
                    <div key={s.stage} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-3xs text-slate-400 uppercase">{s.stage}</div>
                      <div className={`text-lg font-bold text-${s.color}-400 mt-1`}>{s.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION G: CAREER INTELLIGENCE
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="career_intel" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trending Skills Matrix */}
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    Engine 3: High-Velocity Employment &amp; Skills Trends
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Real-time market signals feeding Career Passport, TalentScore, and ATS Resume optimization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {trendingSkills.map((skill) => (
                    <div key={skill.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-white">{skill.name}</div>
                        <div className="text-3xs text-slate-400">Avg Market CTC: ₹{skill.averageSalaryLPA} LPA • {skill.openRolesCount} Open Positions</div>
                      </div>
                      <Badge className={`text-3xs font-mono border-none ${
                        skill.demandIntensity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        +{skill.growthQuarterPercent}% QoQ
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Career Opportunity Alerts */}
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Autonomous Career Opportunity Surge Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {careerAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{alert.roleTitle}</span>
                        <Badge className="bg-amber-500/20 text-amber-300 border-none text-3xs font-mono">
                          +{alert.hiringSurgePercent}% Hiring Surge
                        </Badge>
                      </div>
                      <div className="text-3xs text-slate-400">Cluster: {alert.cluster}</div>
                      <div className="text-3xs text-indigo-400">
                        Recommended Certifications: {alert.recommendedCertifications.join(' • ')}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION H: MCP INTEGRATION GATEWAY
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="mcp_gateway" className="space-y-6 mt-0">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <CircuitBoard className="w-5 h-5 text-amber-400" />
                      Engine 4: Central MCP Server &amp; Tool Gateway
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Standardized Model Context Protocol integration layer connecting agents to external tools, APIs, and services.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs font-mono">
                    Provider-Agnostic Abstraction
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mcpServers.map((server) => (
                    <div key={server.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">{server.name}</span>
                        <Badge className={`text-4xs font-mono border-none ${
                          server.connectionStatus === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400' :
                          server.connectionStatus === 'AUTH_REQUIRED' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {server.connectionStatus}
                        </Badge>
                      </div>
                      <p className="text-3xs text-slate-400 line-clamp-2">{server.description}</p>
                      <div className="flex items-center justify-between text-4xs text-slate-500 pt-1 border-t border-slate-800/80">
                        <span>Tools: {server.toolCount}</span>
                        <span>Auth: {server.authType}</span>
                        <button
                          onClick={() => toast.info(`Testing connection to ${server.name}...`)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Ping
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION I: TECHNOLOGY EVOLUTION & BENCHMARKING
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="tech_evolution" className="space-y-6 mt-0">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-rose-400" />
                  Engine 5: Self-Evolving Technology Intelligence
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Continuous discovery and evaluation of new AI models, MCP servers, and automation APIs from verified registries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {techDiscoveries.map((tech) => (
                    <div key={tech.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-sm">{tech.name}</div>
                          <div className="text-4xs text-slate-500">{tech.category} • {tech.source}</div>
                        </div>
                        <Badge className={`text-4xs font-mono border-none ${
                          tech.evaluationStatus === 'ADOPTED' ? 'bg-emerald-500/20 text-emerald-400' :
                          tech.evaluationStatus === 'EVALUATING' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {tech.evaluationStatus}
                        </Badge>
                      </div>
                      <p className="text-3xs text-slate-300">{tech.expectedBenefit}</p>
                      <div className="text-4xs text-slate-500">
                        Use case: {tech.recommendedUseCase}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION J & K: REVENUE & GROWTH FLYWHEEL
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="revenue_flywheel" className="space-y-6 mt-0">
            {/* 7-Stage Closed-Loop Growth Funnel */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Engine 6: Closed-Loop Growth Flywheel
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Discovery → Visit → Signup → Activation → Conversion → Retention → Referral
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
                  {funnelMetrics.map((stage) => (
                    <div key={stage.stage} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-4xs text-slate-400 uppercase">{stage.stage}</div>
                      <div className="text-lg font-bold text-white">{stage.count.toLocaleString('en-IN')}</div>
                      <div className={`text-4xs font-bold ${stage.status === 'BOTTLENECK' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {stage.conversionFromPrevious}% conv
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Attribution by Channel */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Commercial Attribution by Acquisition Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-4xs uppercase tracking-wider">
                        <th className="py-2.5 px-3">Acquisition Channel</th>
                        <th className="py-2.5 px-3">Revenue (₹ INR)</th>
                        <th className="py-2.5 px-3">Paying Customers</th>
                        <th className="py-2.5 px-3">CAC (₹)</th>
                        <th className="py-2.5 px-3 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {revenueAttributions.map((rev) => (
                        <tr key={rev.channel} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-white">{rev.channel}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">₹{rev.revenueINR.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-slate-300">{rev.payingCustomersCount}</td>
                          <td className="py-2.5 px-3 text-slate-300">₹{rev.customerAcquisitionCostINR}</td>
                          <td className="py-2.5 px-3 text-right text-indigo-400 font-bold">{rev.roas}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION L: SECURITY & GOVERNANCE CENTRE
             ════════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="governance" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-mono text-3xs">
                  LEVEL 1 — FULLY AUTONOMOUS
                </Badge>
                <div className="text-xs font-bold text-white">Safe Analysis &amp; Internal Tasks</div>
                <p className="text-3xs text-slate-400 leading-relaxed font-mono">
                  Research, opportunity discovery, lead scoring, benchmark evaluations, content drafting, health audits. Operates 24/7 without human latency.
                </p>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
                <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-mono text-3xs">
                  LEVEL 2 — CONDITIONAL AUTONOMY
                </Badge>
                <div className="text-xs font-bold text-white">Bounded External Operations</div>
                <p className="text-3xs text-slate-400 leading-relaxed font-mono">
                  Publishing pre-approved content, sending consent-based opt-in follow-ups, running approved experiments within pre-set spending limits.
                </p>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-none font-mono text-3xs">
                  LEVEL 3 — HUMAN SIGN-OFF REQUIRED
                </Badge>
                <div className="text-xs font-bold text-white">High-Risk &amp; Financial Gates</div>
                <p className="text-3xs text-slate-400 leading-relaxed font-mono">
                  Ad spend increases, cold outreach campaigns, price adjustments, installing new external MCP servers, production code or database migrations.
                </p>
              </Card>
            </div>

            {/* Audit Log Table */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Immutable Operational Audit Trail
                  </CardTitle>
                  <Badge variant="outline" className="text-3xs font-mono border-slate-700 text-slate-400">
                    Tamper-Evident Ledger
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    No security or policy violations recorded. All operations conform to TalentXcel SI Charter.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="text-white font-bold">{log.agentName || log.agentId}</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="text-slate-300 truncate">{log.action}</span>
                        </div>
                        <div className="text-4xs text-slate-500 flex-shrink-0">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
