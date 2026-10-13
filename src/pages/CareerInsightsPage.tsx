import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Briefcase, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUpRight, 
  LineChart, 
  PieChart, 
  Compass,
  FileCheck2,
  CheckCircle2,
  Layers,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Target,
  Award,
  Globe,
  Sliders,
  ChevronRight,
  ExternalLink,
  Cpu,
  Shield,
  Cloud,
  Code2,
  Database,
  Building2,
  Activity,
  Check,
  MapPin,
  Plane,
  Coins,
  Scale,
  Laptop,
  Search,
  X,
  FileText,
  Filter,
  Flame,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatCanonicalUrl } from '@/config/domainArchitecture';
import {
  RegionCode,
  REGIONAL_PROFILES,
  CATEGORY_SPECS,
  IndustryCategory,
  ComputedRegionalIndustry,
  queryRegionalIndustries
} from '@/data/regionalIndustriesData';
import CareerIntelligenceDashboard from '@/pages/CareerIntelligenceDashboard';

// ==========================================
// SIMULATOR PRODUCTION CAPABILITIES
// ==========================================
interface SimulatorSkill {
  id: string;
  name: string;
  points: number;
  tag: string;
  description: string;
}

const SIMULATOR_SKILLS: SimulatorSkill[] = [
  { id: 'dist_sys', name: 'Distributed Systems & Raft Consensus', points: 6, tag: 'Architecture', description: 'Fault-tolerant replicas, state machines and consensus engines' },
  { id: 'perf_rust', name: 'Rust & Low-Latency Systems', points: 7, tag: 'Systems', description: 'Zero-cost abstractions, memory safety and microsecond latency' },
  { id: 'k8s_mesh', name: 'Kubernetes Multi-Cluster & Service Mesh', points: 5, tag: 'Infra', description: 'Istio/Cilium, cross-region failover and GitOps automation' },
  { id: 'llm_rag', name: 'LLM Fine-Tuning & Quantized RAG', points: 8, tag: 'Generative AI', description: 'LoRA adapters, vector search and context-aware agents' },
  { id: 'gpu_cuda', name: 'PyTorch CUDA & Kernel Optimization', points: 7, tag: 'Deep Learning', description: 'Triton kernels, GPU parallelism and latency quantization' },
  { id: 'sys_design', name: '100K+ QPS System Design', points: 6, tag: 'Scale', description: 'Partitioning, multi-level caches and event storm mitigation' },
  { id: 'kafka_stream', name: 'Kafka & Real-Time Event Streams', points: 5, tag: 'Streaming', description: 'Exactly-once semantics, Flink SQL and event hub design' },
  { id: 'db_shard', name: 'CockroachDB & Sharded Postgres', points: 5, tag: 'Data Tier', description: 'Global ACID transactions, Geo-partitioning and schema tuning' },
  { id: 'zero_trust', name: 'Zero-Trust IAM & eBPF Security', points: 6, tag: 'Security', description: 'Kernel observability, mTLS attestation and least-privilege IAM' },
  { id: 'tech_lead', name: 'Cross-Functional Engineering Leadership', points: 6, tag: 'Leadership', description: 'Team execution, technical RFC reviews and executive stakeholder alignment' },
  { id: 'finops', name: 'FinOps & Cloud Unit Economics', points: 5, tag: 'Strategy', description: 'Infrastructure cost models, gross margin scaling and compute tiering' },
  { id: 'appsec_audit', name: 'AI Safety & Threat Auditing', points: 6, tag: 'Trust', description: 'Prompt injection defense, adversarial robustness and privacy safeguards' }
];

// ==========================================
// 5-STAGE CAREER PROGRESSION LADDER
// ==========================================
interface CareerLadderStage {
  id: string;
  title: string;
  yoe: string;
  levelTag: string;
  focus: string;
  keyDeliverable: string;
  typicalTimeInLevel: string;
  salaryMultipliers: Record<RegionCode, string>;
}

const CAREER_LADDER_STAGES: CareerLadderStage[] = [
  {
    id: 'l1',
    title: 'Associate Engineer',
    yoe: '0 - 2 YOE',
    levelTag: 'IC 1-2',
    focus: 'Feature delivery, clean code, unit test coverage, and mastering toolchains.',
    keyDeliverable: 'Independently ship well-tested features within defined task boundaries.',
    typicalTimeInLevel: '1.5 - 2 Years',
    salaryMultipliers: {
      GLOBAL: '$75k - $110k',
      US: '$95k - $135k',
      UAE: 'AED 180k - 260k',
      IN: '₹8 - 14 LPA',
      EU: '€55k - 80k',
      SG: 'S$85k - 125k',
      CA: 'C$80k - 115k',
      AU: 'A$90k - 130k'
    }
  },
  {
    id: 'l2',
    title: 'Mid-Level Specialist',
    yoe: '3 - 5 YOE',
    levelTag: 'IC 3',
    focus: 'End-to-end service ownership, schema designs, queue processors, and production ops.',
    keyDeliverable: 'Own medium-to-large service modules with zero-downtime deployment pipelines.',
    typicalTimeInLevel: '2 - 3 Years',
    salaryMultipliers: {
      GLOBAL: '$120k - $165k',
      US: '$145k - $195k',
      UAE: 'AED 280k - 420k',
      IN: '₹16 - 28 LPA',
      EU: '€85k - 120k',
      SG: 'S$130k - 180k',
      CA: 'C$120k - 165k',
      AU: 'A$135k - 185k'
    }
  },
  {
    id: 'l3',
    title: 'Senior Specialist / Tech Lead',
    yoe: '5 - 8 YOE',
    levelTag: 'IC 4 / TL',
    focus: 'Cross-service architecture, SLA resilience, engineering mentorship, and code standards.',
    keyDeliverable: 'Lead technical RFCs, eliminate architectural debt, and mentor 4-8 engineers.',
    typicalTimeInLevel: '3 - 4 Years',
    salaryMultipliers: {
      GLOBAL: '$165k - $240k',
      US: '$195k - $290k',
      UAE: 'AED 420k - 620k',
      IN: '₹28 - 48 LPA',
      EU: '€120k - 170k',
      SG: 'S$185k - 260k',
      CA: 'C$165k - 235k',
      AU: 'A$180k - 255k'
    }
  },
  {
    id: 'l4',
    title: 'Staff / Principal Architect',
    yoe: '8 - 12+ YOE',
    levelTag: 'IC 5-6 / Principal',
    focus: 'Multi-year architectural roadmap, cross-department platforms, and executive alignment.',
    keyDeliverable: 'Drive organization-wide technical strategy impacting business revenue and platform scale.',
    typicalTimeInLevel: '4+ Years',
    salaryMultipliers: {
      GLOBAL: '$240k - $420k+',
      US: '$310k - $550k+',
      UAE: 'AED 620k - 950k+',
      IN: '₹50 - 1.1 Cr+',
      EU: '€175k - 300k+',
      SG: 'S$270k - 450k+',
      CA: 'C$240k - 380k+',
      AU: 'A$260k - 420k+'
    }
  },
  {
    id: 'l5',
    title: 'VP / Engineering Fellow',
    yoe: '12 - 15+ YOE',
    levelTag: 'Executive / Fellow',
    focus: 'Global engineering culture, intellectual property, enterprise P&L, and industry influence.',
    keyDeliverable: 'Sponsor next-generation technological bets and steer global engineering organizations.',
    typicalTimeInLevel: 'Executive Tenure',
    salaryMultipliers: {
      GLOBAL: '$450k - $800k+',
      US: '$550k - $1M+',
      UAE: 'AED 950k - 1.6M+',
      IN: '₹1.2 - 2.5 Cr+',
      EU: '€280k - 500k+',
      SG: 'S$420k - 750k+',
      CA: 'C$360k - 600k+',
      AU: 'A$400k - 700k+'
    }
  }
];

export default function CareerInsightsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state for region
  const requestedRegion = (searchParams.get('region')?.toUpperCase() as RegionCode) || 'GLOBAL';
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(
    REGIONAL_PROFILES[requestedRegion] ? requestedRegion : 'GLOBAL'
  );

  // Industry encyclopedia search & filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'growth' | 'vacancies' | 'salary'>('growth');
  const [inspectingIndustry, setInspectingIndustry] = useState<ComputedRegionalIndustry | null>(null);

  // Career ladder active stage
  const [activeLadderStageId, setActiveLadderStageId] = useState<string>('l3');

  // Capability simulator state
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['dist_sys', 'sys_design', 'perf_rust']);

  // Timestamp and refreshing state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Personal metrics from hooks
  const { careerScore, growthRate } = useCareerMetrics();

  // Lookups
  const activeProfile = REGIONAL_PROFILES[selectedRegion];
  const activeLadderStage = CAREER_LADDER_STAGES.find((s) => s.id === activeLadderStageId) || CAREER_LADDER_STAGES[2];

  // Synchronize region change with URL
  const handleRegionChange = (newRegion: RegionCode) => {
    setSelectedRegion(newRegion);
    setSearchParams({ region: newRegion.toLowerCase() });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      toast({
        title: `${activeProfile.label} Telemetry Synchronized`,
        description: `Verified compensation bands, vacancies, and 245+ industries updated for ${activeProfile.label}.`
      });
    }, 500);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `TalentXcel Career Intelligence | ${activeProfile.label}`,
          text: `Explore verified tech compensation and industry research for ${activeProfile.label} across 245+ sectors.`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Terminal URL Copied",
          description: "Snapshot link copied to clipboard."
        });
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Terminal URL Copied",
        description: "Snapshot link copied to clipboard."
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Generating Regional Dossier",
      description: `Exporting executive intelligence dossier for ${activeProfile.label} across all sectors.`
    });
  };

  // Toggle skills in interactive simulator
  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => 
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  // Compute interactive simulator score
  const computedSkillBonus = useMemo(() => {
    return selectedSkillIds.reduce((sum, id) => {
      const found = SIMULATOR_SKILLS.find((s) => s.id === id);
      return sum + (found ? found.points : 0);
    }, 0);
  }, [selectedSkillIds]);

  const dynamicTalentScore = useMemo(() => {
    if (user && careerScore > 0) return careerScore;
    const raw = 78 + Math.round(computedSkillBonus * 1.1);
    return Math.min(99, Math.max(50, raw));
  }, [user, careerScore, computedSkillBonus]);

  const dynamicPercentile = useMemo(() => {
    return Math.min(99, Math.max(25, Math.round(50 + (dynamicTalentScore - 60) * 1.25)));
  }, [dynamicTalentScore]);

  const dynamicUplift = useMemo(() => {
    const pct = Math.max(12, Math.round(computedSkillBonus * 2.1));
    return `+${pct}%`;
  }, [computedSkillBonus]);

  // Query 245+ industries for the selected region and filter criteria
  const computedIndustries = useMemo(() => {
    return queryRegionalIndustries(searchQuery, selectedCategory, selectedRegion, sortBy);
  }, [searchQuery, selectedCategory, selectedRegion, sortBy]);

  return (
    <>
      <SEOHead
        title={`AI Career Operating System & Career Insights | ${activeProfile.label} Tech Telemetry | TalentXcel`}
        description={`The AI Career Operating System: Regional career intelligence, progression algorithms, compensation bands, and 245+ industry research profiles for ${activeProfile.label}.`}
        canonical={formatCanonicalUrl(`/career-insights${selectedRegion !== 'IN' ? `?region=${selectedRegion.toLowerCase()}` : ''}`, 'talentxcel.in')}
        type="website"
      />

      <div className="dark min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans">
        
        {/* Subtle Ambient High-End Radial Glows & Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute -top-32 left-1/3 w-[700px] h-[380px] bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-48 -right-20 w-[600px] h-[400px] bg-gradient-to-bl from-purple-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-40 -left-20 w-[500px] h-[350px] bg-gradient-to-tr from-emerald-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

        {/* Global Live Ticker Strip */}
        <div className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl px-4 py-2 text-xs text-slate-400 relative z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
                <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                Live Telemetry Feed:
              </span>
              <span className="text-slate-300">
                🇦🇪 <strong className="text-white">Dubai Hub:</strong> 0% Personal Income Tax Corridor • +38.5% YoY surge in sovereign AI &amp; fintech roles
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇺🇸 <strong className="text-white">United States:</strong> Frontier AI pre-training compensation bands averaging $225k+ base
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇮🇳 <strong className="text-white">India Tier-1:</strong> Median specialist architecture compensation up +28.2% across 38,500+ active roles
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇪🇺 <strong className="text-white">Europe &amp; UK:</strong> Zurich &amp; London systems engineering bands commanding €140k - €180k
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Regional Index</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10 relative z-10">

          {/* TOP HERO & COMMAND BAR */}
          <div className="space-y-6">
            
            {/* Top Sub-Bar: Status & Sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  AI Career Operating System • Regional Industry Terminal
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Synced: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  Share
                </Button>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  Export
                </Button>

                <Button
                  onClick={() => navigate('/career-map')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-cyan-950/40"
                >
                  <Compass className="h-3.5 w-3.5 mr-1.5" />
                  AI Career Map
                </Button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {activeProfile.flag} {activeProfile.label}{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Career &amp; Industry Terminal
                </span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Comprehensive regional salary indices, verified compensation bands, tax arbitrage telemetry, and in-depth research across <strong className="text-white">245+ verified industry sectors</strong> calibrated specifically for <strong className="text-white">{activeProfile.label}</strong>.
              </p>
            </div>

            {/* UNIFIED PROMINENT REGIONAL SELECTOR BAR */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  Select Target Region &amp; Economic Corridor:
                </span>
                <span className="text-cyan-400 font-medium normal-case">
                  Active Currency: <strong className="text-white">{activeProfile.currency} ({activeProfile.symbol})</strong>
                </span>
              </div>

              {/* 8 Country Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                {(Object.keys(REGIONAL_PROFILES) as RegionCode[]).map((rCode) => {
                  const reg = REGIONAL_PROFILES[rCode];
                  const isSelected = selectedRegion === rCode;
                  return (
                    <button
                      key={rCode}
                      onClick={() => handleRegionChange(rCode)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                          : 'bg-slate-950/60 border-white/[0.04] text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{reg.flag}</span>
                      <span className="truncate">{reg.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 1: REGIONAL COMMAND STATS (4 HIGH-FIDELITY CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Regional Median Compensation */}
            <Card className="bg-slate-900/70 border-white/[0.08] hover:border-cyan-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    Median Tech Compensation
                  </span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                    {activeProfile.currency}
                  </Badge>
                </div>

                <div className="space-y-0.5">
                  <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {activeProfile.avgTechSalary}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Senior Architect Band: <strong className="text-slate-200">{activeProfile.seniorBand}</strong>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                  <span>Live Benchmark</span>
                  <Link to="/salary" className="text-cyan-400 hover:underline font-semibold flex items-center">
                    Analyze Offer <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Capability TalentScore */}
            <Card className="bg-slate-900/70 border-white/[0.08] hover:border-blue-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-blue-400" />
                    Capability TalentScore
                  </span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-bold">
                    {dynamicTalentScore >= 88 ? 'Elite Tier' : 'Senior Specialist'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        {dynamicTalentScore}
                      </span>
                      <span className="text-slate-400 font-semibold text-sm">/ 100</span>
                    </div>
                    <div className="text-[11px] text-blue-400 font-medium mt-1">
                      Peer Top {dynamicPercentile}% in {activeProfile.label}
                    </div>
                  </div>

                  {/* Circular Mini Dial */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-cyan-400 transition-all duration-1000 ease-out"
                        strokeDasharray={`${dynamicTalentScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-white">{dynamicTalentScore}%</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                  <span>Verified Capability Matrix</span>
                  <span className="text-cyan-400 font-medium">Calibrated</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Growth Velocity */}
            <Card className="bg-slate-900/70 border-white/[0.08] hover:border-emerald-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Growth Velocity
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    YoY Expansion
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
                    {activeProfile.growthVelocity}
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">YoY</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Promotion readiness index calibrated to regional enterprise demand.
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                  <span>Market Expansion</span>
                  <span className="text-emerald-400 font-medium">Accelerating</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Active Verified Opportunities */}
            <Card className="bg-slate-900/70 border-white/[0.08] hover:border-amber-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-amber-400" />
                    Verified Opportunities
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-bold">
                    Direct ATS
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight">
                    {activeProfile.totalRoles}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Across <strong className="text-slate-200">{activeProfile.activeCompanies} verified hiring organizations</strong> with 1-click apply.
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                  <span>Direct Search</span>
                  <Link to="/jobs" className="text-cyan-400 hover:underline font-semibold flex items-center">
                    Browse Jobs <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 2: REGIONAL STRATEGIC POLICY & TAX ARBITRAGE STRIP */}
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 border border-white/[0.08] p-5 md:p-6 rounded-3xl backdrop-blur-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
              
              {/* Strategic Policy */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  National Tech Policy &amp; Economic Initiatives:
                </span>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {activeProfile.strategicPolicy}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Primary Regulatory Body: <strong className="text-slate-300">{activeProfile.keyRegulatoryBody}</strong>
                </div>
              </div>

              {/* Tax & Living Cost */}
              <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-white/[0.06] pt-3 md:pt-0 md:pl-6">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  Tax &amp; Cost of Living:
                </span>
                <div className="text-base font-extrabold text-white">
                  {activeProfile.effectiveTaxPct === 0 ? (
                    <span className="text-emerald-400 font-bold">0% Personal Income Tax</span>
                  ) : (
                    <span>~{activeProfile.effectiveTaxPct}% Effective Tax</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Living cost benchmark: <strong className="text-slate-200">{activeProfile.livingCostIndex} / 100</strong> (US baseline).
                </p>
              </div>

              {/* Visa & Mobility */}
              <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-white/[0.06] pt-3 md:pt-0 md:pl-6">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plane className="h-3.5 w-3.5" />
                  Mobility &amp; Visas:
                </span>
                <div className="text-base font-extrabold text-white">
                  {activeProfile.mobilityRating}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {activeProfile.visaNotes}
                </p>
              </div>
            </div>
          </Card>

          {/* SECTION 3: REGIONAL KEY TECH HUBS & CLUSTERS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-400" />
                  Key Tech Hubs &amp; Compensation Clusters ({activeProfile.label})
                </h3>
                <p className="text-xs text-slate-400">
                  Regional technology clusters indexed by median compensation, growth velocity, and active vacancies.
                </p>
              </div>
              <Link
                to="/jobs"
                className="text-xs text-cyan-400 hover:underline flex items-center font-medium whitespace-nowrap"
              >
                Browse regional job listings <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {activeProfile.hubs.map((hub) => (
                <div
                  key={hub.city}
                  className="p-4 bg-slate-900/60 border border-white/[0.06] rounded-2xl text-center hover:border-cyan-500/40 transition-all backdrop-blur-xl"
                >
                  <div className="font-bold text-white text-xs sm:text-sm mb-1 truncate">{hub.city}</div>
                  <div className="text-xs text-cyan-300 font-extrabold mb-1">{hub.salary}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mb-1">{hub.growth} growth</div>
                  <div className="text-[11px] text-slate-400">{hub.jobs} jobs</div>
                  <Badge className="mt-2 text-[10px] bg-slate-950 text-slate-300 border border-slate-800 truncate max-w-full">
                    {hub.badge}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: 245+ REGIONAL INDUSTRY RESEARCH ENCYCLOPEDIA (CORE REQUEST) */}
          <div className="space-y-6 pt-4 border-t border-white/[0.06]">
            
            {/* Header & Description */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs px-3 py-0.5">
                    245+ Verified Sectors
                  </Badge>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-xs">Indexed for {activeProfile.label}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Regional Industry Encyclopedia &amp; Research Dossiers
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  Deep-dive research profiles, market size benchmarks, in-demand technical capabilities, and verified regional employers for 245+ technology and engineering sectors in <strong className="text-white">{activeProfile.label}</strong>.
                </p>
              </div>

              {/* Sorting Control */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Sort By:</span>
                <div className="flex items-center bg-slate-900 border border-white/[0.08] p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setSortBy('growth')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      sortBy === 'growth' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CAGR Growth
                  </button>
                  <button
                    onClick={() => setSortBy('vacancies')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      sortBy === 'vacancies' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vacancies
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      sortBy === 'name' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    A-Z
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search across 245+ verified industries, skills, or roles in ${activeProfile.label} (e.g. LLM, Quantum, Fintech, Battery, Autonomous)...`}
                className="pl-12 pr-10 py-3.5 bg-slate-900/80 border-white/[0.08] focus:border-cyan-500/50 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 shadow-xl backdrop-blur-2xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Vertical Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === 'ALL'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900/70 border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                All Verticals (245)
              </button>
              {(Object.keys(CATEGORY_SPECS) as IndustryCategory[]).map((catKey) => {
                const spec = CATEGORY_SPECS[catKey];
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/70 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{spec.shortName}</span>
                    <span className="text-[10px] opacity-75">({spec.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Results Count Banner */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing <strong className="text-white">{computedIndustries.length}</strong> Industry Profiles in <strong className="text-cyan-400">{activeProfile.label}</strong>
              </span>
              {searchQuery && (
                <span className="text-slate-400">
                  Filtered by query: <strong className="text-white">&ldquo;{searchQuery}&rdquo;</strong>
                </span>
              )}
            </div>

            {/* 245+ Industry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {computedIndustries.slice(0, 48).map((ind) => (
                <Card
                  key={ind.id}
                  className="bg-slate-900/60 border-white/[0.08] hover:border-cyan-500/50 text-slate-100 p-5 rounded-2xl backdrop-blur-2xl shadow-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-cyan-950/30"
                >
                  <div className="space-y-3">
                    
                    {/* Category & Growth Header */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-semibold truncate">
                        {ind.categoryLabel.split('&')[0]}
                      </Badge>
                      <span className="text-emerald-400 text-xs font-extrabold flex items-center shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                        {ind.cagr} CAGR
                      </span>
                    </div>

                    {/* Title & Short Description */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {ind.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {ind.shortDesc}
                      </p>
                    </div>

                    {/* Regional Metrics Box */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Regional Tech Salary:</span>
                        <span className="text-cyan-300 font-extrabold">{ind.regionalSalary}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Senior Architect:</span>
                        <span className="text-white font-bold">{ind.regionalSeniorSalary}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Vacancies:</span>
                        <span className="text-emerald-400 font-semibold">{ind.regionalVacancies}</span>
                      </div>
                    </div>

                    {/* Top Regional Employers */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Top Regional Employers:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ind.topEmployers.slice(0, 3).map((emp) => (
                          <span
                            key={emp}
                            className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md text-slate-300 border border-white/[0.04] truncate max-w-[150px]"
                          >
                            {emp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Market: {ind.globalMarketSize}
                    </span>
                    <button
                      onClick={() => setInspectingIndustry(ind)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group-hover:underline"
                    >
                      Inspect Research &rarr;
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination / Total count indicator if more than 48 */}
            {computedIndustries.length > 48 && (
              <div className="text-center py-4 text-xs text-slate-400">
                Displaying first 48 of {computedIndustries.length} matching industries. Use the search bar above to narrow down specific niches.
              </div>
            )}
          </div>

          {/* SECTION 5: REGIONAL CAREER PROGRESSION LADDER & CAPABILITY SIMULATOR */}
          <div className="space-y-6 pt-4 border-t border-white/[0.06]">
            
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                Regional Career Progression Ladder &amp; Capability Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Calibrated progression tiers, competency deliverables, and live skill delta calculation for <strong className="text-white">{activeProfile.label}</strong>.
              </p>
            </div>

            {/* 5-Stage Ladder Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CAREER_LADDER_STAGES.map((stage) => {
                const isSelected = activeLadderStageId === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveLadderStageId(stage.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/60 border-white/[0.04] text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{stage.levelTag}</div>
                    <div className="text-xs font-bold text-white mt-0.5 truncate">{stage.title}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      {stage.salaryMultipliers[selectedRegion]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Stage Detail Card */}
            <Card className="bg-slate-900/70 border-white/[0.08] p-5 rounded-2xl backdrop-blur-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{activeLadderStage.levelTag} Standard</span>
                  <h4 className="text-lg font-extrabold text-white">{activeLadderStage.title} ({activeLadderStage.yoe})</h4>
                </div>
                <Badge className="w-fit bg-slate-950 text-cyan-300 border border-cyan-500/30 text-sm font-bold px-3 py-1">
                  Expected: {activeLadderStage.salaryMultipliers[selectedRegion]}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Strategic Focus:</span>
                  <p className="text-slate-300 leading-relaxed">{activeLadderStage.focus}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Production Deliverable:</span>
                  <p className="text-slate-300 leading-relaxed">{activeLadderStage.keyDeliverable}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time in Level:</span>
                  <p className="text-emerald-400 font-semibold">{activeLadderStage.typicalTimeInLevel}</p>
                  <Link to="/career-map" className="text-cyan-400 hover:underline inline-flex items-center pt-2">
                    Map Promotion Route &rarr;
                  </Link>
                </div>
              </div>
            </Card>

            {/* Interactive Capability Check Bench */}
            <Card className="bg-slate-900/60 border-white/[0.08] p-5 rounded-2xl backdrop-blur-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">Interactive Production Capability Bench</h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Toggle capabilities you practice in production to simulate your dynamic TalentScore and compensation uplift in {activeProfile.label}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-1">
                    Simulated Boost: {dynamicUplift}
                  </Badge>
                  <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-2.5 py-1">
                    {selectedSkillIds.length} of {SIMULATOR_SKILLS.length} Active
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {SIMULATOR_SKILLS.map((skill) => {
                  const isChecked = selectedSkillIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all duration-200 flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-sm'
                          : 'bg-slate-950/40 border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate text-slate-200">{skill.name}</div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span className="text-cyan-400 font-mono">+{skill.points} pts</span>
                          <span className="text-slate-500">{skill.tag}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* SECTION 6: INTEGRATED AI CAREER TOOLS */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div className="space-y-0.5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400" />
                Integrated Career Pathways &amp; Tools Suite
              </h3>
              <p className="text-xs text-slate-400">
                Execute actionable career pivots, optimize your resume for ATS systems, and establish your verified credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Tool 1: AI Roadmap Builder */}
              <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-4 backdrop-blur-2xl hover:border-cyan-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
                    <Compass className="h-6 w-6" />
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    Interactive Graph
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">AI Career Roadmap Builder</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Generate step-by-step technical roadmaps tailored to reach principal and leadership roles in {activeProfile.label}.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/career-map/ai-roadmap-builder')}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2 rounded-xl shadow-lg"
                >
                  Launch Roadmap Builder &rarr;
                </Button>
              </Card>

              {/* Tool 2: ATS Resume Optimizer */}
              <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-4 backdrop-blur-2xl hover:border-blue-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                    Parser Match
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">ATS Resume Optimizer</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Optimize keywords and formatting against regional tech recruiter ATS systems with high match fidelity.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/resume')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-xl shadow-lg"
                >
                  Open Resume Studio &rarr;
                </Button>
              </Card>

              {/* Tool 3: Verified Career Passport */}
              <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-4 backdrop-blur-2xl hover:border-purple-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    Cryptographic ID
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Verified Career Passport</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Consolidate verified skills, code repos, and benchmarks into a cryptographically signed global passport.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/passport')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 rounded-xl shadow-lg"
                >
                  Explore Passport &rarr;
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* DEEP RESEARCH INSPECTION MODAL */}
        <Dialog open={!!inspectingIndustry} onOpenChange={(open) => !open && setInspectingIndustry(null)}>
          <DialogContent className="max-w-2xl bg-slate-950 border border-white/[0.1] text-slate-100 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            {inspectingIndustry && (
              <div className="space-y-5">
                <DialogHeader className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs">
                      {inspectingIndustry.categoryLabel}
                    </Badge>
                    <Badge className="bg-slate-900 text-emerald-400 border-slate-800 text-xs">
                      {inspectingIndustry.marketMaturity}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-extrabold text-white">
                    {inspectingIndustry.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300 text-xs leading-relaxed">
                    {inspectingIndustry.shortDesc}
                  </DialogDescription>
                </DialogHeader>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900/80 border border-white/[0.06] rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Global Market:</span>
                    <div className="text-sm font-bold text-white">{inspectingIndustry.globalMarketSize}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">5-Yr CAGR:</span>
                    <div className="text-sm font-bold text-emerald-400">{inspectingIndustry.cagr}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Regional Pay:</span>
                    <div className="text-sm font-bold text-cyan-300">{inspectingIndustry.regionalSalary}</div>
                  </div>
                </div>

                {/* Strategic Research Report */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Strategic Regional Market Analysis ({inspectingIndustry.regionLabel}):
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04]">
                    {inspectingIndustry.strategicResearchReport}
                  </p>
                </div>

                {/* Regulatory Context */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Regional Regulatory &amp; Compliance Context:
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04]">
                    {inspectingIndustry.regulatoryContext}
                  </p>
                </div>

                {/* Key Roles & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Key In-Demand Roles:
                    </span>
                    <ul className="space-y-1 text-slate-200">
                      {inspectingIndustry.keyRoles.map((role) => (
                        <li key={role} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-cyan-400" />
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Core Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inspectingIndustry.keySkills.map((sk) => (
                        <span key={sk} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-cyan-300 border border-white/[0.06]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Employers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Verified Hiring Employers in {inspectingIndustry.regionLabel}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingIndustry.topEmployers.map((emp) => (
                      <Badge key={emp} className="bg-slate-900 text-slate-200 border-slate-700 text-xs">
                        {emp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setInspectingIndustry(null)}
                    className="border-slate-800 bg-slate-950 text-slate-300 text-xs rounded-xl"
                  >
                    Close Dossier
                  </Button>
                  <Button
                    onClick={() => {
                      setInspectingIndustry(null);
                      navigate('/jobs');
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg"
                  >
                    Browse Verified Jobs &rarr;
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
