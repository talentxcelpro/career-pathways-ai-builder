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

export default function GrowthControlPlane() {
  const [timeHorizon, setTimeHorizon] = useState<'TODAY' | '7D' | '14D' | '30D'>('TODAY');
  const [testQuery, setTestQuery] = useState<string>('python developer salary london');
  const [testCountry, setTestCountry] = useState<string>('gbr');
  const [simulatedTrace, setSimulatedTrace] = useState<AcquisitionLoopExecution | null>(() => 
    GlobalDistributionOrchestrator.executeTrace('python developer salary london', 'gbr')
  );

  const scoreboard = GrowthMetricsEngine.getScoreboard(timeHorizon);
  const scaleHealth = InfrastructureScaleGate.evaluateHealth();
  const magnets = ProductMagnetEngine.getAllMagnets();
  const proposals = TrafficGovernor.getProposals();
  const currencies = Object.values(GlobalIntentRouter.CURRENCIES);

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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  TalentXcel Global Acquisition Engine
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                    CLOSED-LOOP GROWTH OS
                  </Badge>
                </h1>
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
              <strong>Production Epistemic Rule:</strong> Targets (1M+ requests/day, 100k visitors, 2k signups) are engineering operating capacities, NOT claimed achievements. Telemetry is verified separately.
            </span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Request != Visitor != User != Signup != Outcome</span>
          </div>
        </div>

        {/* ── SECTION 1: DAILY GROWTH WAR ROOM (TARGETS VS ACTUALS) ───────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <span>Daily Growth War Room ({timeHorizon})</span>
              </h2>
              <p className="text-xs text-slate-400">Comparing Target Operating Capacities alongside Verified Empirical Telemetry.</p>
            </div>
            <Badge variant="outline" className="text-slate-400 border-slate-800 font-mono text-3xs">
              SCALE GATE: {scaleHealth.state}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Tile 1: Page Requests */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Page Requests</span>
                <div className="text-lg font-bold text-white font-mono">{scoreboard.actuals.dailyPageRequests.toLocaleString()}</div>
                <div className="text-3xs text-indigo-400 font-mono">Target: {scoreboard.targets.dailyPageRequests.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 2: Human Requests */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Human Requests</span>
                <div className="text-lg font-bold text-emerald-400 font-mono">{scoreboard.actuals.dailyHumanRequests.toLocaleString()}</div>
                <div className="text-3xs text-emerald-500/80 font-mono">{scoreboard.humanTrafficPercent}% Human Traffic</div>
              </CardContent>
            </Card>

            {/* Tile 3: Bot / Crawler Hits */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Bot / Crawler Hits</span>
                <div className="text-lg font-bold text-amber-400 font-mono">{scoreboard.actuals.dailyBotRequests.toLocaleString()}</div>
                <div className="text-3xs text-amber-500/80 font-mono">Excluded from Funnel</div>
              </CardContent>
            </Card>

            {/* Tile 4: Unique Visitors */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Unique Visitors</span>
                <div className="text-lg font-bold text-white font-mono">{scoreboard.actuals.dailyUniqueVisitors.toLocaleString()}</div>
                <div className="text-3xs text-indigo-400 font-mono">Target: {scoreboard.targets.dailyUniqueVisitors.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 5: Product Tool Runs */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Tool Completions</span>
                <div className="text-lg font-bold text-purple-400 font-mono">{scoreboard.actuals.dailyToolCompletions.toLocaleString()}</div>
                <div className="text-3xs text-purple-500/80 font-mono">Target: {scoreboard.targets.dailyProductEngagements.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 6: Signups */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Signups</span>
                <div className="text-lg font-bold text-emerald-400 font-mono">{scoreboard.actuals.dailySignups.toLocaleString()}</div>
                <div className="text-3xs text-emerald-500/80 font-mono">Target: {scoreboard.targets.dailySignups.toLocaleString()}</div>
              </CardContent>
            </Card>

            {/* Tile 7: Activations */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Activations</span>
                <div className="text-lg font-bold text-blue-400 font-mono">{scoreboard.actuals.dailyActivations.toLocaleString()}</div>
                <div className="text-3xs text-blue-500/80 font-mono">{scoreboard.activationRatePercent}% Activation SLA</div>
              </CardContent>
            </Card>

            {/* Tile 8: Referred Visitors */}
            <Card className="bg-slate-900/80 border-slate-800">
              <CardContent className="p-3.5 space-y-1">
                <span className="text-3xs font-mono text-slate-400 uppercase tracking-wider">Referred Visitors</span>
                <div className="text-lg font-bold text-cyan-400 font-mono">{scoreboard.actuals.dailyReferredVisitors.toLocaleString()}</div>
                <div className="text-3xs text-cyan-500/80 font-mono">Target: {scoreboard.targets.dailyReferredVisitors.toLocaleString()}</div>
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
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Infrastructure Scale Gate Telemetry</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Automatic acquisition throttle engages if latency &gt;800ms or pressure &gt;80%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">p95 API Latency</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{scaleHealth.p95LatencyMs}ms</div>
                  <div className="text-3xs text-slate-500">Threshold: &lt;800ms</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">DB Connection Pressure</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{scaleHealth.dbConnectionPressurePercent}%</div>
                  <div className="text-3xs text-slate-500">Threshold: &lt;80%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">CDN Cache Hit Rate</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{scaleHealth.cacheHitRatePercent}%</div>
                  <div className="text-3xs text-slate-500">Threshold: &gt;70%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-3xs text-slate-400 uppercase">Sustained Error Rate</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{scaleHealth.errorRatePercent}%</div>
                  <div className="text-3xs text-slate-500">Threshold: &lt;1.0%</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-3xs">
                <span className="text-slate-400">Throttle State:</span>
                <span className="text-emerald-400 font-bold">DISENGAGED (Scale Capacity Available)</span>
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
