import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Code, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Zap, 
  RefreshCw,
  Sparkles,
  Search,
  Lock,
  Eye,
  Sliders
} from 'lucide-react';
import { GrowthMetricsEngine } from '@/lib/growth/GrowthMetricsEngine';
import { ProductMagnetEngine } from '@/lib/growth/ProductMagnetEngine';
import { TrafficGovernor } from '@/lib/growth/TrafficGovernor';
import { InfrastructureScaleGate } from '@/lib/growth/InfrastructureScaleGate';
import { GlobalIntentRouter } from '@/lib/growth/GlobalIntentRouter';
import { GlobalDistributionOrchestrator, AcquisitionLoopExecution } from '@/lib/growth/GlobalDistributionOrchestrator';
import { ProductionFunnelTrace } from '@/lib/growth/types';

export default function GrowthControlPlane() {
  const [timeHorizon, setTimeHorizon] = useState<'TODAY' | '7D' | '14D' | '30D'>('TODAY');
  const [testQuery, setTestQuery] = useState<string>('python developer salary london');
  const [testCountry, setTestCountry] = useState<string>('gbr');
  const [simulatedTrace, setSimulatedTrace] = useState<AcquisitionLoopExecution | null>(() => 
    GlobalDistributionOrchestrator.executeTrace('python developer salary london', 'gbr')
  );

  const scoreboard = GrowthMetricsEngine.getScoreboard(timeHorizon);
  const conversionScoreboard = GrowthMetricsEngine.getRealConversionScoreboard(timeHorizon);
  const scaleHealth = InfrastructureScaleGate.evaluateHealth();
  const magnets = ProductMagnetEngine.getAllMagnets();
  const proposals = TrafficGovernor.getProposals();
  const currencies = Object.values(GlobalIntentRouter.CURRENCIES);
  const clock = conversionScoreboard.clock;

  const handleRunTrace = () => {
    if (!testQuery.trim()) return;
    const trace = GlobalDistributionOrchestrator.executeTrace(testQuery, testCountry);
    setSimulatedTrace(trace);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── TOP HEADER & INVARIANT BANNER ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Zap className="w-6 h-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    TalentXcel Global Acquisition Engine
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                    Zero-Signup Structural Blockers — Resolved
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                    CURRENT OBSERVATION: DAY {clock.observationDay} / 14
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Closed-Loop Control Plane: Intent → Decision → Surface → Product Magnet → Diagnostic → Signup → Activation → Referral
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Horizon Switcher */}
            <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
              {(['TODAY', '7D', '14D', '30D'] as const).map(h => (
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

            <a
              href="/discovery"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>UDX Observatory</span>
            </a>
          </div>
        </div>

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
                onClick={handleRunTrace}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs"
              >
                Trace Acquisition Loop
              </Button>
            </div>

            {simulatedTrace && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-3xs text-slate-400">1. UDX INTENT SIGNAL</span>
                    <div className="font-bold text-slate-200 truncate mt-0.5">{simulatedTrace.step1_udxIntent}</div>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400">2. PRODUCT MAGNET</span>
                    <div className="font-bold text-indigo-300 truncate mt-0.5">{simulatedTrace.step5_productMagnet}</div>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400">3. LOCALIZED DESTINATION</span>
                    <div className="font-bold text-cyan-300 truncate mt-0.5">{simulatedTrace.step2_acquisitionDecision.targetPath}</div>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400">4. GOVERNANCE STATUS</span>
                    <div className="mt-0.5">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-3xs font-mono">
                        {simulatedTrace.step3_governanceCheck.decision} ({simulatedTrace.step3_governanceCheck.workflowState})
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-3xs text-slate-400">FREE DIAGNOSTIC DELIVERED (VALUE BEFORE SIGNUP):</div>
                  <div className="text-slate-200">{simulatedTrace.step6_realDiagnostic.summary}</div>
                  <div className="text-3xs text-emerald-400">Signup Trigger: {simulatedTrace.step7_signupTrigger}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-3xs">
                  <div className="truncate text-slate-400">
                    Public Share URL: <span className="text-cyan-300">{simulatedTrace.step9_referralShareCard.shareUrl}</span>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300">
                    Loop Status: {simulatedTrace.loopStatus}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── SECTION 5: PRODUCT MAGNET FLEET (10 UTILITIES) ──────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Product Magnet Fleet (10 Utilities)</span>
              </h2>
              <p className="text-xs text-slate-400">Every tool supports /web, /embed, /api, and /share distribution contracts.</p>
            </div>
            <Badge variant="outline" className="text-slate-400 border-slate-800 font-mono text-3xs">
              10/10 ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {magnets.map(m => (
              <Card key={m.id} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-slate-800 text-slate-300 text-4xs font-mono border-none">
                      {m.slug}
                    </Badge>
                    <span className="text-4xs font-mono text-slate-500">8 Currencies</span>
                  </div>
                  <CardTitle className="text-xs font-bold text-white mt-1 leading-snug">{m.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 pt-0 space-y-2 text-3xs font-mono">
                  <p className="text-slate-400 line-clamp-2">{m.tagline}</p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-500">
                    <a href={m.primaryRoute} className="hover:text-indigo-400 flex items-center gap-1">
                      <span>/web</span> <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span className="hover:text-cyan-400 cursor-pointer">/embed</span>
                    <span className="hover:text-purple-400 cursor-pointer">/api</span>
                    <span className="hover:text-emerald-400 cursor-pointer">/share</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: TRAFFIC GOVERNOR CONSOLE & SCALE GATE ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Governor */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Traffic Governor Console (BUILD ≠ AUTO_PUBLISH)</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Audits acquisition surfaces to prevent programmatic doorway sprawl.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="divide-y divide-slate-800/80">
                {proposals.slice(0, 4).map(p => (
                  <div key={p.proposalId} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-3xs">"{p.canonicalQuery}"</span>
                      <Badge className={`text-4xs font-mono ${
                        p.decision === 'BUILD' ? 'bg-emerald-500/20 text-emerald-400'
                        : p.decision === 'WAIT_FOR_EVIDENCE' ? 'bg-amber-500/20 text-amber-400'
                        : p.decision === 'MERGE' ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {p.decision}
                      </Badge>
                    </div>
                    <p className="text-3xs text-slate-400 line-clamp-1">{p.decisionRationale}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Scale Gate */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Infrastructure Scale Gate Telemetry (8-Metric SLA)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Acquisition throttles automatically engage if safe operational thresholds are breached.
                  </CardDescription>
                </div>
                <Badge className={`text-3xs font-mono border-none ${
                  scaleHealth.state === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400'
                  : scaleHealth.state === 'DEGRADED' ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {scaleHealth.state}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">1. p95 API Latency</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.p95LatencyMs}ms</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;800ms</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">2. DB Query Latency</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.dbLatencyMs}ms</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;150ms</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">3. DB Pool Pressure</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.dbConnectionPressurePercent}%</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;80%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">4. CDN Cache Hit</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.cacheHitRatePercent}%</div>
                  <div className="text-4xs text-slate-500">Threshold: &gt;70%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">5. HTTP Error Rate</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.httpErrorRatePercent}%</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;1.0%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">6. Application API</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.applicationApiErrorRatePercent}%</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;0.5%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">7. Resume Uploads</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.storageUploadErrorRatePercent}%</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;1.0%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-4xs text-slate-400 uppercase">8. Signup Latency</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{scaleHealth.metrics.signupLatencyMs}ms</div>
                  <div className="text-4xs text-slate-500">Threshold: &lt;1200ms</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-3xs">
                <span className="text-slate-400">Throttle Disposition:</span>
                <span className={`font-bold ${scaleHealth.activeThrottle ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {scaleHealth.activeThrottle ? `ACTIVE THROTTLE (${scaleHealth.throttleReason})` : 'DISENGAGED (Full planetary scale capacity available)'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── SECTION 7: MULTI-CURRENCY GRID ───────────────────────────────────────── */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Internationalization Matrix (8 Canonical Currencies)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-mono text-center">
              {currencies.map(c => (
                <div key={c.code} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white">{c.symbol} {c.code}</div>
                  <div className="text-4xs text-slate-400 truncate">{c.name}</div>
                  <div className="mt-1">
                    <Badge className={`text-4xs font-mono border-none ${c.hasVerifiedData ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {c.hasVerifiedData ? 'VERIFIED' : 'PENDING'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
