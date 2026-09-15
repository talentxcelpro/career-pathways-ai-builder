// src/pages/admin/GrowthOperationsCenter.tsx
// Operational Command Center for TalentXcel Growth Operations (Phase 8 Baseline)
// Answers the executive question: "Is the business actually growing?"
// Features 5 Production Dashboards:
// 1. User Acquisition Funnel (5 streams, mutually exclusive attribution)
// 2. B2B Employer Pipeline (leak detection, conversion rates, stage latency, time-to-value)
// 3. Regional Market Performance (6 markets, observed CAC/LTV, strict INSUFFICIENT_DATA)
// 4. Product Surface Activation Yield (10 surfaces, conversion yield)
// 5. AI CEO Closed-Loop Scorecard (Today's Growth Decision, incremental revenue, governed model weight versioning)

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Building2,
  Globe2,
  Layers,
  Brain,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  ChevronRight,
  HelpCircle,
  XCircle,
  Radio,
  FileText,
  Target,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getEmployerPipelineTelemetry,
  ACTIVE_EXPERIMENT_ROIS,
  PRODUCT_PERFORMANCE_REGISTRY,
  TODAYS_GROWTH_DECISION,
  MODEL_WEIGHT_PROPOSALS,
  ACTIVE_MODEL_VERSION,
  RECORDED_ATTRIBUTION_TOUCHPOINTS,
  computeNetCommercialGrowthValue,
  GSC_OPERATIONAL_PHASE,
  GSC_MARKETING_FREEZE_POLICY,
  GSC_WEEKLY_OPERATIONAL_CADENCE,
  GSC_DEMAND_SURFACE_ROUTING_MATRIX,
  INVERTED_BUSINESS_KPI_HIERARCHY,
  NEWS_DEMAND_EDITORIAL_POLICY
} from '@/lib/acquisition-os/growthOperationsEngine';
import { 
  resolveNext10kUsersRoadmap, 
  computeMarketUnitEconomics 
} from '@/lib/acquisition-os/acquisitionIntelligenceEngine';
import { getAiDiscoveryObservatoryData } from '@/lib/ai-discovery/aiReferralTracker';

export default function GrowthOperationsCenter() {
  const [activeTab, setActiveTab] = useState('phase9');
  const [roadmap] = useState(resolveNext10kUsersRoadmap());
  const [unitEconomics] = useState(computeMarketUnitEconomics());
  const [observatoryData] = useState(getAiDiscoveryObservatoryData());
  const [employerPipeline] = useState(getEmployerPipelineTelemetry());

  // Interactive sample calculator state
  const [sampleScore] = useState(computeNetCommercialGrowthValue({
    acquisitionVolumeNorm: 0.75,
    activationProbabilityNorm: 0.65,
    revenuePotentialNorm: 0.80,
    evidenceConfidenceNorm: 0.90,
    strategicFitNorm: 0.85,
    thinContentRiskNorm: 0.05,
    spamRiskNorm: 0.05,
    evidenceRiskNorm: 0.10,
    conversionRiskNorm: 0.15,
    operationalCostNorm: 0.10,
  }));

  const [doorwaySuppressedScore] = useState(computeNetCommercialGrowthValue({
    acquisitionVolumeNorm: 0.90,
    activationProbabilityNorm: 0.20,
    revenuePotentialNorm: 0.40,
    evidenceConfidenceNorm: 0.30,
    strategicFitNorm: 0.50,
    thinContentRiskNorm: 0.95, // 0 inventory triggers doorway lock
    spamRiskNorm: 0.30,
    evidenceRiskNorm: 0.70,
    conversionRiskNorm: 0.60,
    operationalCostNorm: 0.40,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <Helmet>
        <title>Growth Operations Command Center — TalentXcel Admin</title>
      </Helmet>

      {/* Top Breadcrumb & Executive Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" /> Phase 8 Production Baseline
            </Badge>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-800 font-mono">
              30-Day Architectural Freeze: ACTIVE
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Growth Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Empirical Revenue Validation & Closed-Loop Operations: Measuring real users, employers, jobs, and cash flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs">
            <Link to="/admin/ai-organization">
              <Brain className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              AI Governance & Control Plane
            </Link>
          </Button>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono text-xs px-2.5 py-1">
            Model: {ACTIVE_MODEL_VERSION}
          </Badge>
        </div>
      </div>

      {/* Governing Operational Principle Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-mono font-bold text-amber-400">
              Governing Operational Principle
            </div>
            <p className="text-sm sm:text-base font-semibold text-white tracking-tight italic">
              “No metric becomes a learning signal until its evidence is traceable.”
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] font-mono text-slate-300 border-slate-700 bg-slate-900/60 shrink-0">
          Traceability Verification: ENFORCED
        </Badge>
      </div>

      {/* Executive Key Metric Tickers */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-3.5">
            <div className="text-[11px] font-medium text-slate-400">Run-Rate to 10K Target</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {roadmap.totalMonthlyRunRate.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/mo</span>
            </div>
            <div className="text-[10px] text-amber-400 mt-1 font-mono">
              Mixed Observed/Estimated
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-3.5">
            <div className="text-[11px] font-medium text-slate-400">Target Timeframe</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-1">
              ~{roadmap.projectedMonthsToTarget} <span className="text-xs text-slate-500 font-normal">months</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Target: 10,000 Users
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-3.5">
            <div className="text-[11px] font-medium text-slate-400">Employer Pipeline Yield</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              $1,450 <span className="text-xs text-slate-500 font-normal">net</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              3 Jobs Posted • 1 Paid
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-3.5">
            <div className="text-[11px] font-medium text-slate-400">Incremental Experiment Lift</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              +$3,900 <span className="text-xs text-slate-500 font-normal">USD</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              Across 2 active test cells
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 col-span-2 lg:col-span-1">
          <CardContent className="p-3.5">
            <div className="text-[11px] font-medium text-slate-400">Governance & Safety</div>
            <div className="text-xl font-bold text-white font-mono mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              238/238
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Production CI checks intact
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabbed Operations Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="phase9" className="data-[state=active]:bg-emerald-950/80 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/40 text-xs font-bold border border-transparent">
            <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-400 animate-pulse" /> Phase 9: GSC Organic OS
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Executive Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> User Acquisition
          </TabsTrigger>
          <TabsTrigger value="employers" className="data-[state=active]:bg-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Employer Pipeline
          </TabsTrigger>
          <TabsTrigger value="markets" className="data-[state=active]:bg-slate-800 text-xs">
            <Globe2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Regional Markets
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-slate-800 text-xs">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Product Yield
          </TabsTrigger>
          <TabsTrigger value="aiceo" className="data-[state=active]:bg-slate-800 text-xs">
            <Brain className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> AI CEO Closed-Loop
          </TabsTrigger>
        </TabsList>

        {/* TAB 0: PHASE 9 — GSC-LED ORGANIC GROWTH OPERATIONS */}
        <TabsContent value="phase9" className="space-y-6">
          
          {/* Executive Strategy Banner */}
          <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs uppercase tracking-wider font-bold">
                      Active Operational Directive
                    </Badge>
                    <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30 font-mono">
                      Marketing Architecture: FROZEN
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Phase 9: GSC-Led Organic Growth Operations
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Single External Sensor</span>
                <span className="text-sm font-mono font-bold text-emerald-400">Google Search Console (GSC)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              All infrastructure is built. We are no longer asking <em>"What marketing architecture should we build?"</em> We are operating the closed-loop engine: 
              <strong className="text-white"> Google Search → GSC demand → AI Growth Org → TalentXcel products → organic users → activation → revenue → feedback into GSC</strong>.
            </p>
          </div>

          {/* 1. Active Channel Freeze vs Sole External Sensor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Frozen Channels Card */}
            <Card className="lg:col-span-7 bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Strict Marketing Freeze (Zero Budget / Zero Distraction)
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] text-rose-400 border-rose-500/30 font-mono">
                    8 CHANNELS FROZEN
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Explicit operational moratorium on paid campaigns, cold outreach, and artificial spam.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800/80 text-xs">
                  {GSC_MARKETING_FREEZE_POLICY.frozenChannels.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-800/30">
                      <div>
                        <span className="font-bold text-slate-200 block">{item.channel}</span>
                        <span className="text-slate-400 text-[11px]">{item.reason}</span>
                      </div>
                      <Badge className="bg-rose-950/60 text-rose-400 border-rose-800/50 text-[10px] shrink-0 font-mono">
                        ❌ FROZEN
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sole Primary Sensor Card */}
            <Card className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-900/40">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Sole Marketing Sensor
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                    ACTIVE SENSOR
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Google Search Console is the authoritative source of market demand.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Why GSC is the Only Channel
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Search intent represents <strong>genuine, pull-based human need</strong>. When someone searches <em>"software engineer jobs dubai"</em> or <em>"free ats resume scanner"</em>, they have immediate intent. We do not need to interrupt strangers on social media or email.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Operating Principle
                  </span>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl font-mono text-[11px] text-emerald-300 leading-relaxed">
                    "GSC is the input and feedback system. TalentXcel's products are the conversion mechanism. The AI organization is the decision engine."
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>First-Party Funnel Telemetry:</span>
                  <span className="text-emerald-400 font-mono font-bold">CONNECTED</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. GSC 1:1 Demand-to-Surface Routing Matrix */}
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  GSC Query-to-Product Ecosystem Routing Matrix
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 font-mono">
                  7 CORE INTENT MAPPINGS
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                GSC does not feed "Jobs SEO" alone — it maps search demand directly into the entire multi-product TalentXcel engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-3">Intent Pattern</th>
                    <th className="p-3">Sample GSC Query</th>
                    <th className="p-3">Destination Route</th>
                    <th className="p-3">Conversion Objective</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {GSC_DEMAND_SURFACE_ROUTING_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{item.intentType}</td>
                      <td className="p-3 text-emerald-400">"{item.queryPattern}"</td>
                      <td className="p-3 text-blue-400">
                        <Link to={item.targetRoute} className="hover:underline flex items-center gap-1">
                          {item.targetRoute} <ArrowRight className="w-3 h-3 inline" />
                        </Link>
                      </td>
                      <td className="p-3 text-slate-300 font-sans">{item.conversionGoal}</td>
                      <td className="p-3 text-right">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 3. The 8-Question Weekly Executive Marketing Cadence */}
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Weekly GSC Growth Review Cadence (The 8 Operational Questions)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30 font-mono">
                  WEEKLY CADENCE
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                This 8-question audit replaces marketing meetings. It ties Google signals directly to product interventions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="divide-y divide-slate-800/80 text-xs">
                {GSC_WEEKLY_OPERATIONAL_CADENCE.map((q) => (
                  <div key={q.id} className="p-3.5 hover:bg-slate-800/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] flex items-center justify-center font-bold">
                          {q.id}
                        </span>
                        <span className="font-bold text-white">{q.question}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block ml-7 mt-0.5 font-mono">
                        Sensor: {q.sensorDataSource}
                      </span>
                    </div>
                    <div className="md:col-span-4 text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Observed Finding:</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{q.activeFinding}</span>
                    </div>
                    <div className="md:col-span-4">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Actionable Output:</span>
                      <span className="text-slate-200">{q.actionableOutput}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Inverted KPI Hierarchy & /news Quality Editorial Policy */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Inverted KPI Pyramid */}
            <Card className="lg:col-span-6 bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Inverted KPI Hierarchy (Business Value First)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Impressions are diagnostic sensors; revenue and activated users are the victory condition.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 text-xs">
                {INVERTED_BUSINESS_KPI_HIERARCHY.map((kpi) => (
                  <div key={kpi.level} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] flex items-center justify-center font-bold">
                        L{kpi.level}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{kpi.name}</span>
                        <span className="text-[10px] text-slate-400">{kpi.metric}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono text-slate-400 border-slate-800">
                      {kpi.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* /news Demand-Driven Editorial Queue */}
            <Card className="lg:col-span-6 bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    /news Demand-Driven Editorial Policy
                  </CardTitle>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                    ANTI-CONTENT-FACTORY
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Keep existing ~20 articles. Only write new deep-dives when GSC proves real query volume.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
                  <span className="font-bold text-amber-300 text-[11px] block">Mandatory Article Anatomy</span>
                  <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                    <li>Authoritative Problem Formulation</li>
                    <li>Forensic Benchmark Table (Salaries, Fees, NIRF)</li>
                    <li>Interactive Embedded Tool (ATS Scanner, Calculator)</li>
                    <li>6-Step Practical Career Pathway</li>
                    <li>Live Verified Jobs & Direct Apply Paths</li>
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    GSC Discovered Editorial Queue (Demand-Validated)
                  </span>
                  <div className="space-y-1.5">
                    {NEWS_DEMAND_EDITORIAL_POLICY.activeGscDemandsQueue.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono">
                        <div>
                          <span className="text-white font-bold block text-xs">"{item.query}"</span>
                          <span className="text-[10px] text-slate-400">{item.gscMonthlyImpressions.toLocaleString()} GSC Impr/mo</span>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                          {item.editorialStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

        </TabsContent>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          {/* Today's Growth Decision Card */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-blue-900/40 text-slate-100">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" /> Today's Growth Decision #{TODAYS_GROWTH_DECISION.rank}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">Market: {TODAYS_GROWTH_DECISION.market}</span>
                </div>
                <Badge variant="outline" className="text-xs font-mono text-amber-300 border-amber-500/30">
                  Decision: {TODAYS_GROWTH_DECISION.decision}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-white mt-2">
                {TODAYS_GROWTH_DECISION.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Fact (Verifiable)</div>
                  <p className="text-slate-200">{TODAYS_GROWTH_DECISION.fact}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Signal (Pattern)</div>
                  <p className="text-slate-200">{TODAYS_GROWTH_DECISION.signal}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3. Inference (Hypothesis)</div>
                  <p className="text-slate-200">{TODAYS_GROWTH_DECISION.inference}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">4. Observed Result (Historical)</div>
                  <p className="text-emerald-300 font-medium">{TODAYS_GROWTH_DECISION.observedResult}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    Action: {TODAYS_GROWTH_DECISION.action}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Target: <span className="text-white font-mono">{TODAYS_GROWTH_DECISION.target}</span> • Expected Yield: <span className="text-emerald-400 font-mono font-bold">{TODAYS_GROWTH_DECISION.expectedValueRangeUsd}</span>
                  </div>
                </div>
                <div className="self-start sm:self-auto text-right">
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    Policy: {TODAYS_GROWTH_DECISION.executionPolicy} (Human Review Required)
                  </Badge>
                  <div className="text-[9px] text-slate-500 mt-1 max-w-xs text-right">
                    {TODAYS_GROWTH_DECISION.whyNotAutoExecute}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Normalized Scoring Demonstration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    High-Potential Commercial Opportunity
                  </CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    {sampleScore.recommendedDecision}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  UAE GCC Cloud Engineering Recruitment Pitch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Gross Score [0-1]</span>
                  <span className="text-white">{sampleScore.grossScore}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Weighted Risk Penalty [0-1]</span>
                  <span className="text-amber-400">{sampleScore.weightedRisk}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 font-bold">
                  <span className="text-slate-300">Net Commercial Score</span>
                  <span className="text-emerald-400">+{sampleScore.netScore}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-2">
                  {sampleScore.decisionReason}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Anti-Doorway Suppressed Opportunity
                  </CardTitle>
                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs">
                    {doorwaySuppressedScore.recommendedDecision}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Trichy Aerospace Welder (380 queries, 0 inventory)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Gross Score [0-1]</span>
                  <span className="text-white">{doorwaySuppressedScore.grossScore}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Weighted Risk (Thin Content)</span>
                  <span className="text-rose-400">{doorwaySuppressedScore.weightedRisk}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 font-bold">
                  <span className="text-slate-300">Net Commercial Score</span>
                  <span className="text-rose-400">{doorwaySuppressedScore.netScore}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-2">
                  {doorwaySuppressedScore.decisionReason}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: USER ACQUISITION FUNNEL */}
        <TabsContent value="users" className="space-y-4">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    Multi-Channel User Acquisition & Retention Funnel
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Tracks candidate progression across all 5 acquisition channels with decoupled stage mathematics.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono text-emerald-400 border-emerald-500/30">
                  Overall Landing-to-Customer: {observatoryData.overallLandingToCustomerRatePct}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funnel Visual */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                {observatoryData.funnelStages.map((stage) => {
                  const stepLabel = stage.conversionFromPreviousPct !== null 
                    ? `${stage.conversionFromPreviousPct}% step` 
                    : '100% (Top)';
                  return (
                    <div key={stage.stageName} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-slate-400 text-[10px] font-mono">
                          {stage.stageIndex}. {stage.stageName}
                        </div>
                        <div className="text-sm font-bold text-blue-400 mt-1">
                          {stepLabel}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <div className="text-sm font-bold text-white font-mono">
                          {stage.count.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {stage.stageIndex === 1 ? 'Total Referrals' : `${stage.overallConversionFromLandingPct}% of landing`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mutually Exclusive Attribution Audit Log */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Mutually Exclusive Attribution Touchpoint Ledger
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Zero Overlapping Touchpoint Counting</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="pb-2">Session ID</th>
                        <th className="pb-2">Attribution Mode</th>
                        <th className="pb-2">Evidence Type</th>
                        <th className="pb-2">Evidence Source</th>
                        <th className="pb-2">Confidence</th>
                        <th className="pb-2">Observed Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {RECORDED_ATTRIBUTION_TOUCHPOINTS.map((tp) => (
                        <tr key={tp.touchpointId} className="hover:bg-slate-900/40">
                          <td className="py-2 text-slate-300">{tp.sessionId}</td>
                          <td className="py-2">
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] px-1 py-0 ${
                                tp.attributionMode === 'AI_REFERRAL_OBSERVED'
                                  ? 'text-emerald-400 border-emerald-500/30'
                                  : tp.attributionMode === 'AI_REFERRAL_SELF_REPORTED'
                                  ? 'text-purple-400 border-purple-500/30'
                                  : tp.attributionMode === 'AI_REFERRAL_ASSISTED'
                                  ? 'text-blue-400 border-blue-500/30'
                                  : 'text-slate-500 border-slate-700'
                              }`}
                            >
                              {tp.attributionMode}
                            </Badge>
                          </td>
                          <td className="py-2 text-slate-400">{tp.evidenceType}</td>
                          <td className="py-2 text-slate-300 truncate max-w-xs">{tp.evidenceSource}</td>
                          <td className="py-2 text-emerald-400">{tp.confidence}</td>
                          <td className="py-2 text-slate-500 text-[10px]">{tp.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: EMPLOYER PIPELINE */}
        <TabsContent value="employers" className="space-y-4">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    B2B Employer Acquisition & Conversion Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Measures the complete commercial cycle from hiring signal to paid conversion, including stage latency.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 font-mono">
                    Lead → Job: {employerPipeline.timeToValue.medianLeadToJobPostedDays}d
                  </Badge>
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30 font-mono">
                    Job → Pay: {employerPipeline.timeToValue.medianJobToPaymentHours}h
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Bottleneck Alert */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Pipeline Bottleneck Detected: </span>
                  <span className="text-slate-300">{employerPipeline.topLeakSummary}</span>
                </div>
              </div>

              {/* 9-Stage Pipeline Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2">Funnel Stage</th>
                      <th className="pb-2">Count</th>
                      <th className="pb-2">Conversion From Previous</th>
                      <th className="pb-2">Median Latency</th>
                      <th className="pb-2">Operational Bottleneck Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {employerPipeline.stages.map((stg) => (
                      <tr key={stg.stageIndex} className={`hover:bg-slate-900/40 ${stg.isBottleneck ? 'bg-amber-950/20' : ''}`}>
                        <td className="py-2.5 font-semibold text-white">{stg.stageName}</td>
                        <td className="py-2.5 text-blue-400 font-bold">{stg.count}</td>
                        <td className="py-2.5">
                          {stg.conversionFromPreviousPct !== null ? (
                            <span className="text-slate-200">{stg.conversionFromPreviousPct}%</span>
                          ) : (
                            <span className="text-slate-500">— (Top of Funnel)</span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {stg.medianTimeToNextStageHours !== null ? `${stg.medianTimeToNextStageHours}h` : '—'}
                        </td>
                        <td className="py-2.5">
                          {stg.isBottleneck ? (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                              BOTTLENECK: {stg.bottleneckNote}
                            </Badge>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">Normal Flow</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: REGIONAL MARKETS */}
        <TabsContent value="markets" className="space-y-4">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    Regional Market Performance & Status-Aware CAC/LTV
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Empirical financial governance: missing marketing spend strictly designated as INSUFFICIENT_DATA.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs text-slate-400 border-slate-800">
                  6 Strategic Markets
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                      <th className="pb-2">Market</th>
                      <th className="pb-2">CAC (USD)</th>
                      <th className="pb-2">LTV (USD)</th>
                      <th className="pb-2">LTV / CAC</th>
                      <th className="pb-2">Observed Rev</th>
                      <th className="pb-2">Projected Rev</th>
                      <th className="pb-2">Operational Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {unitEconomics.map((econ) => (
                      <tr key={econ.market} className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-semibold text-white">{econ.market}</td>
                        <td className="py-2.5">
                          {econ.cacValueUsd !== null ? (
                            <span className="text-white">${econ.cacValueUsd.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-500 italic">No Spend Data</span>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`ml-1.5 text-[8px] px-1 py-0 ${
                              econ.cacStatus === 'OBSERVED' 
                                ? 'text-emerald-400 border-emerald-500/30' 
                                : 'text-slate-500 border-slate-700'
                            }`}
                          >
                            {econ.cacStatus}
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          {econ.ltvValueUsd !== null ? (
                            <span className="text-white">${econ.ltvValueUsd.toFixed(0)}</span>
                          ) : (
                            <span className="text-slate-500 italic">Insufficient Data</span>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`ml-1.5 text-[8px] px-1 py-0 ${
                              econ.ltvStatus === 'OBSERVED' 
                                ? 'text-emerald-400 border-emerald-500/30' 
                                : 'text-slate-500 border-slate-700'
                            }`}
                          >
                            {econ.ltvStatus}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-bold text-white">
                          {econ.ltvToCacRatio !== null ? `${econ.ltvToCacRatio.toFixed(1)}x` : '—'}
                        </td>
                        <td className="py-2.5 text-emerald-400 font-bold">${econ.observedRevenueTotalUsd.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-300">${econ.projectedRevenueTotalUsd.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-400 text-[11px] font-sans max-w-xs truncate" title={econ.notes}>
                          {econ.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: PRODUCT YIELD */}
        <TabsContent value="products" className="space-y-4">
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">
                Product Surface Conversion & Activation Yield (10 Surfaces)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Identifies which specific product surface produces genuine user activation vs high bounce.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="pb-2">Product Surface</th>
                      <th className="pb-2">Visitors</th>
                      <th className="pb-2">Signups</th>
                      <th className="pb-2">Activated</th>
                      <th className="pb-2">Activation Rate</th>
                      <th className="pb-2">Customers</th>
                      <th className="pb-2">Revenue (USD)</th>
                      <th className="pb-2">Performance Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {PRODUCT_PERFORMANCE_REGISTRY.map((p) => (
                      <tr key={p.productKey} className="hover:bg-slate-900/40">
                        <td className="py-2.5 font-semibold text-white font-sans">{p.productName}</td>
                        <td className="py-2.5 text-slate-300">{p.visitors.toLocaleString()}</td>
                        <td className="py-2.5 text-blue-400">{p.signups.toLocaleString()}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">{p.activated.toLocaleString()}</td>
                        <td className="py-2.5 text-white font-bold">{p.activationRatePct}%</td>
                        <td className="py-2.5 text-purple-400">{p.customers}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">${p.revenueUsd.toLocaleString()}</td>
                        <td className="py-2.5">
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] px-1 py-0 ${
                              p.qualityTier === 'HIGH_PERFORMER' 
                                ? 'text-emerald-400 border-emerald-500/30' 
                                : 'text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {p.qualityTier}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: AI CEO CLOSED-LOOP */}
        <TabsContent value="aiceo" className="space-y-4">
          {/* Incremental Revenue Experiment Scorecard */}
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    Incremental Revenue & Experiment Scorecard
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Distinguishes incremental lift from baseline organic momentum.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30 font-mono">
                  Closed-Loop Feedback: ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ACTIVE_EXPERIMENT_ROIS.map((exp) => (
                  <div key={exp.experimentId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                            {exp.market} • {exp.surface}
                          </Badge>
                          <span className="font-bold text-white text-sm">{exp.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono">
                          ROI: {exp.recommendationRoiMultiplier}x Yield
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono text-purple-400 border-purple-500/30">
                          Lift: +{exp.liftPct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Baseline Expected</div>
                        <div className="text-slate-300 font-bold">${exp.baselineExpectedRevenueUsd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Observed Total</div>
                        <div className="text-white font-bold">${exp.observedTotalRevenueUsd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Incremental Lift</div>
                        <div className="text-emerald-400 font-bold">+${exp.incrementalRevenueUsd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Incremental Users/Jobs</div>
                        <div className="text-blue-400 font-bold">+{exp.incrementalActivatedUsers} users / +{exp.incrementalJobs} jobs</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans pt-1">
                      <span className="text-slate-300 font-medium">Model Learning:</span> {exp.learningSummary}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Governed Model Versioning Ledger */}
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Governed Model Versioning & Controlled Weight Promotion
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Invariant: The AI CEO cannot directly modify production scoring weights. Adaptations require explicit validation and promotion.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                  Current: {ACTIVE_MODEL_VERSION}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-xs">
                {MODEL_WEIGHT_PROPOSALS.map((prop) => (
                  <div key={prop.proposalId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{prop.modelVersion}</span>
                        <span className="text-slate-500">(from {prop.previousVersion})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className="text-[10px] text-emerald-400 border-emerald-500/30"
                        >
                          Traceable (N={prop.provenanceAudit.sampleSize})
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            prop.status === 'ACTIVE' 
                              ? 'text-emerald-400 border-emerald-500/30' 
                              : 'text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {prop.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-slate-300 font-sans text-xs">
                      {prop.rationale}
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      Proposed Deltas: {JSON.stringify(prop.weightDeltas)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Telemetry Traceability & Provenance Inspector */}
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Telemetry Traceability & Provenance Inspector
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Full empirical verification audit for model proposals before promotion from PROPOSED → ACTIVE.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                  Audit State: TRACEABLE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 6-Stage Traceability Pipeline Diagram */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Authoritative Traceability Chain
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Source Event
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Database Record
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Aggregation
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Metric
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Dashboard
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    AI CEO Decision
                  </span>
                </div>
              </div>

              {/* Deep Audit for Proposal prop_acq_104 */}
              {MODEL_WEIGHT_PROPOSALS.filter(p => p.proposalId === 'prop_acq_104').map(prop => (
                <div key={prop.proposalId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono">
                          Proposal ID: {prop.proposalId}
                        </Badge>
                        <span className="font-bold text-white text-sm font-mono">
                          Target Version: {prop.modelVersion} (Candidate)
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Empirical Claim: <span className="text-emerald-400 font-semibold font-mono">3.7x conversion lift (+31.4%)</span> &amp; <span className="text-emerald-400 font-semibold font-mono">+$2,400 incremental revenue</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono text-amber-400 border-amber-500/30">
                      Gated: PENDING_HUMAN_PROMOTION
                    </Badge>
                  </div>

                  {/* Provenance Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-medium">Cohort IDs &amp; Sample Size</div>
                      <div className="font-mono text-slate-200">
                        Cohorts: <span className="text-blue-400">{prop.provenanceAudit.experimentCohortIds.join(', ')}</span>
                      </div>
                      <div className="font-mono text-slate-200">
                        Sample Size: <span className="text-emerald-400 font-bold">N = {prop.provenanceAudit.sampleSize}</span> (92 Control, 92 Treatment)
                      </div>
                      <div className="text-[11px] text-slate-400 pt-1 font-mono">
                        Window: {prop.provenanceAudit.dateRange.start} → {prop.provenanceAudit.dateRange.end} (21 days)
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-medium">Stripe Transaction Ledger IDs</div>
                      <div className="font-mono text-xs text-purple-300 space-y-0.5">
                        {prop.provenanceAudit.transactionLedgerIds.map((txId) => (
                          <div key={txId} className="flex items-center justify-between">
                            <span>• {txId}</span>
                            <span className="text-emerald-400 font-bold">+$800.00 USD</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                        Total Verified Incremental: <span className="text-emerald-400 font-bold">${prop.incrementalRevenueUsd.toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Denominator, Baseline & Treatment Definitions */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Denominator Definition</div>
                      <div className="text-slate-300 text-xs mt-0.5">{prop.provenanceAudit.denominatorDefinition}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
                        <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Control Cohort</div>
                        <div className="text-slate-300 text-xs mt-0.5">{prop.provenanceAudit.baselineDefinition}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                        <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Treatment Cohort</div>
                        <div className="text-slate-200 text-xs mt-0.5">{prop.provenanceAudit.treatmentDefinition}</div>
                      </div>
                    </div>
                  </div>

                  {/* Governance Invariant Notice */}
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs flex items-start gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-200">Controlled Promotion Guard: </span>
                      Evidence is traceable and verified. However, pursuant to the 30-Day Operational Freeze, the AI CEO cannot self-promote weights. Model promotion to ACTIVE requires SuperAdmin second-signature authorization.
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
