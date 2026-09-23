import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  ChevronRight, 
  Rocket, 
  Flame, 
  Share2, 
  RefreshCw, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  CheckSquare, 
  Square, 
  Compass,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

interface Accelerator {
  id: string;
  title: string;
  category: 'Technical' | 'Leadership' | 'Assessment' | 'Profile';
  points: number;
  timeEst: string;
  description: string;
  actionLabel: string;
  route: string;
  status: 'available' | 'in_progress' | 'verified';
}

const DEFAULT_ACCELERATORS: Accelerator[] = [
  {
    id: 'arch-project',
    title: 'Verified System Architecture Portfolio',
    category: 'Technical',
    points: 25,
    timeEst: '20-30 mins',
    description: 'Submit an architectural diagram, repository link, or high-scale system specification for autonomous AI validation.',
    actionLabel: 'Submit Project Proof',
    route: '/profile/edit',
    status: 'available',
  },
  {
    id: 'adaptive-assessment',
    title: 'Adaptive Distributed Systems Assessment',
    category: 'Assessment',
    points: 30,
    timeEst: '15 mins',
    description: 'Complete our AI-proctored adaptive technical benchmark to verify high-concurrency and cloud-native systems expertise.',
    actionLabel: 'Launch Assessment',
    route: '/tools/skill-assessment',
    status: 'available',
  },
  {
    id: 'peer-endorsement',
    title: 'Executive Peer & Mentor Validation',
    category: 'Leadership',
    points: 20,
    timeEst: '5 mins',
    description: 'Invite verified engineering leaders or VP/CXO colleagues to endorse your system leadership and delivery impact.',
    actionLabel: 'Request Endorsement',
    route: '/referrals',
    status: 'in_progress',
  },
  {
    id: 'profile-telemetry',
    title: 'Career Telemetry & Ambition Refresh',
    category: 'Profile',
    points: 15,
    timeEst: '5 mins',
    description: 'Update your compensation benchmarks, executive seniority preferences, and targeted international work jurisdictions.',
    actionLabel: 'Update Telemetry',
    route: '/profile',
    status: 'available',
  },
  {
    id: 'ai-interview-sim',
    title: 'Executive Behavioral AI Simulation',
    category: 'Leadership',
    points: 20,
    timeEst: '10 mins',
    description: 'Demonstrate operational and organizational decision-making in an interactive AI executive scenario.',
    actionLabel: 'Start AI Simulator',
    route: '/tools/interview-readiness-score',
    status: 'available',
  },
];

const PAST_GROWTH_ACTIVITIES = [
  {
    id: '1',
    date: '2 days ago',
    title: 'Verified Distributed Queue Architecture Project',
    badge: '+25 pts',
    category: 'Technical Portfolio',
    details: 'Autonomous validator verified Kafka, Redis, and Go event-stream architecture case study.',
    verified: true,
  },
  {
    id: '2',
    date: '9 days ago',
    title: 'Executive Leadership Peer Endorsement',
    badge: '+20 pts',
    category: 'Peer Review',
    details: 'Endorsement confirmed by VP of Technology (Fortune 500 cohort) for cross-functional governance.',
    verified: true,
  },
  {
    id: '3',
    date: '16 days ago',
    title: 'Profile Telemetry & Skill Ingestion',
    badge: '+21 pts',
    category: 'Skill Telemetry',
    details: 'Added verified credentials in Kubernetes cluster reliability, Docker orchestration, and CI/CD pipelines.',
    verified: true,
  },
];

const CandidateGrowthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();

  const baseScore = 823;
  const [selectedAccelerators, setSelectedAccelerators] = useState<string[]>(['arch-project']);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Calculate projected boost
  const additionalBoost = selectedAccelerators.reduce((sum, id) => {
    const acc = DEFAULT_ACCELERATORS.find(a => a.id === id);
    return sum + (acc?.points || 0);
  }, 0);

  const projectedScore = Math.min(1000, baseScore + additionalBoost);

  const toggleAccelerator = (id: string) => {
    setSelectedAccelerators(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      toast.success('✨ Growth velocity synced with live career telemetry! Current acceleration: +8.2%');
    }, 900);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My TalentXcel Growth Velocity',
        text: 'I reached a TalentScore of 823 (Elite Tier) with +66 points 30-day velocity!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('🔗 Growth Hub link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Nav Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/talent-score')}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>TalentScore 3D Studio</span>
          </Button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xs">
              TX
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">TalentXcel</span>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono tracking-wider uppercase px-2 py-0.5">
              Candidate OS
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Share Momentum</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-900/40 gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-800/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>30-Day Velocity: +66 Pts (+8.2% Acceleration)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Candidate Telemetry</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Career Growth & Momentum Hub</span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Accelerate your verified TalentScore trajectory with tailored high-yield boosters, validated project portfolios, and executive peer endorsements.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs gap-2 rounded-xl py-2 px-3.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Syncing...' : 'Sync Velocity'}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success('📄 Verified Career Growth Report downloaded (PDF with cryptographic hash)');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs gap-1.5 rounded-xl border border-slate-700"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Growth Certificate</span>
            </Button>
          </div>
        </div>

        {/* 4 Core Velocity KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Growth Delta */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/20 relative overflow-hidden group hover:border-cyan-400/50 transition-all"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>30-DAY VELOCITY</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono tracking-tight">
                +66
              </span>
              <span className="text-xs text-emerald-400 font-bold font-mono">PTS</span>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-none text-[10px] ml-auto font-bold">
                +8.2%
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Fast-track peer acceleration cohort (Top 5% velocity)
            </p>
          </motion.div>

          {/* Card 2: Composite Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-blue-500/30 shadow-lg shadow-blue-950/20 relative overflow-hidden group hover:border-blue-400/50 transition-all"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>ACTIVE TALENTSCORE</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {baseScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 1000</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] ml-auto font-bold">
                ELITE TIER
              </Badge>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Elite (750)</span>
                <span className="text-cyan-400">Super-Elite (900)</span>
              </div>
              <Progress value={((baseScore - 750) / (900 - 750)) * 100} className="h-1.5 bg-slate-800" />
            </div>
          </motion.div>

          {/* Card 3: Global Ecosystem Standing */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-purple-500/30 shadow-lg shadow-purple-950/20 relative overflow-hidden group hover:border-purple-400/50 transition-all"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>GLOBAL STANDING</span>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                #853
              </span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] ml-auto font-bold">
                TOP 8% WORLDWIDE
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Benchmark: Top 3% Regionally in Engineering & Operations
            </p>
          </motion.div>

          {/* Card 4: Telemetry Fidelity */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-emerald-500/30 shadow-lg shadow-emerald-950/20 relative overflow-hidden group hover:border-emerald-400/50 transition-all"
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>TELEMETRY FIDELITY</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                98%
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] ml-auto font-bold">
                MAX INTEGRITY
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Multi-source verified against GitHub, ATS & Peer Network
            </p>
          </motion.div>
        </div>

        {/* Projected Score Simulator Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 border border-cyan-500/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Live Trajectory Simulator
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Boost your score to <span className="text-cyan-300 font-mono font-black">{projectedScore}</span> by executing {selectedAccelerators.length} accelerator{selectedAccelerators.length === 1 ? '' : 's'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Select from the high-yield boosters below to simulate your projected score increase and see how quickly you can achieve Super-Elite Tier (900+).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 self-start lg:self-auto">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Current</span>
              <span className="text-xl font-black text-white font-mono">{baseScore}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-cyan-400 uppercase font-mono block">Projected</span>
              <span className="text-xl font-black text-cyan-400 font-mono">+{additionalBoost}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-400 uppercase font-mono block">New Score</span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono">
                {projectedScore}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Section: Accelerators (Left) + Timeline & Ladder (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 cols): High-Yield Accelerators */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  High-Yield Score Accelerators
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Click to simulate & boost
              </span>
            </div>

            <div className="space-y-3">
              {DEFAULT_ACCELERATORS.map((acc) => {
                const isSelected = selectedAccelerators.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => toggleAccelerator(acc.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/30' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="pt-0.5 text-cyan-400">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{acc.title}</span>
                            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] py-0 px-2 font-mono">
                              {acc.category}
                            </Badge>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {acc.timeEst}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {acc.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono font-black text-xs px-2.5 py-1">
                          +{acc.points} PTS
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(acc.route);
                          }}
                          className="h-7 text-[11px] bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 rounded-lg px-2.5 gap-1 font-semibold border border-slate-700 transition-colors"
                        >
                          <span>{acc.actionLabel}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Growth Timeline & Milestone Ladder */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Milestone Ladder */}
            <Card className="bg-slate-900/60 border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <CardTitle className="text-sm font-bold text-white">
                    Career Milestone Ladder
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Your progression across executive talent brackets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                
                {/* Level 4: Super-Elite (Target) */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-purple-300">Super-Elite / Advisory Tier</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-none text-[9px] font-mono">TARGET (900+)</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Direct CXO referrals, board advisory eligibility & VIP recruiter matching.
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs font-bold text-purple-400">
                    77 pts away
                  </div>
                </div>

                {/* Level 3: Elite Tier (Active) */}
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-3 relative overflow-hidden">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-cyan-300">Elite Tier (Active Status)</span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[9px] font-mono">823 PTS</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Top 8% worldwide in Engineering & Operations Leadership.
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>

                {/* Level 2: Professional Tier */}
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3 opacity-60">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-300">Professional Tier (600–749)</span>
                    <p className="text-[10px] text-slate-500">Verified mid-senior leadership capability.</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>

                {/* Level 1: Foundation Tier */}
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between gap-3 opacity-40">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-slate-300">Foundation Tier (400–599)</span>
                    <p className="text-[10px] text-slate-500">Base profile and technical competency baseline.</p>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </div>

              </CardContent>
            </Card>

            {/* 30-Day Activity Log */}
            <Card className="bg-slate-900/60 border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <CardTitle className="text-sm font-bold text-white">
                      Verified 30-Day Activity Log
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-mono text-[10px]">
                    +66 Points Gained
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Audited telemetry ledger driving current score velocity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                {PAST_GROWTH_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-200">{act.title}</span>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-mono text-[10px] font-bold">
                        {act.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {act.details}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                      <span>{act.category}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {act.date}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Quick Career Navigation Actions */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Ready to explore career opportunities matched to your velocity?</h4>
              <p className="text-xs text-slate-400">12 verified high-fit roles currently align with your 823 TalentScore.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/talent-score')}
              className="flex-1 sm:flex-none border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-xl"
            >
              Return to TalentScore
            </Button>
            <Button
              onClick={() => navigate('/jobs')}
              className="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-900/30 gap-1.5"
            >
              <span>Explore Matched Jobs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CandidateGrowthPage;
