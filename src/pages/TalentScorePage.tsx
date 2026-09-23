/**
 * TalentXcel TalentScore Experience — Career Potential in 4D
 * Pixel-perfect 3D cylindrical stage pedestal with engraved "LEARN | GROW | EARN | ACHIEVE"
 * Fully interactive, compact, highly polished cockpit layout.
 */

import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, BarChart3, Zap, Compass, Briefcase, TrendingUp,
  User, Users, BookOpen, GraduationCap, ChevronRight, ArrowRight,
  Sparkles, Check, Share2, Copy, Shield, Layers, Award,
  Flame, Lock, ExternalLink, Trophy, ShieldCheck, CheckCircle2,
  Info, Clock, ArrowUpRight, Star, X, CheckSquare, Square,
  ChevronDown, ChevronUp, PlusCircle, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GamingTalentScoreCard } from '@/components/talent-score/GamingTalentScoreCard';
import { TalentScorePedestal } from '@/components/talent-score/TalentScorePedestal';
import { useTalentScore } from '@/hooks/useTalentScore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TalentScorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Navigation & Tab States
  const [activeMainTab, setActiveMainTab] = useState<'breakdown' | 'benchmark'>('breakdown');
  const [activeSidebarTab, setActiveSidebarTab] = useState('my-score');
  const [activeSubTab, setActiveSubTab] = useState('CORE_DIMENSIONS');
  const [expandedDimension, setExpandedDimension] = useState<string | null>('technical-capability');

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    skills: false,
    github: true,
    assessment: false,
    education: false,
  });

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<{
    type: 'insights' | 'stat-detail' | 'improve' | 'strengths' | null;
    title?: string;
    description?: string;
    content?: React.ReactNode;
  }>({ type: null });

  const { talentScore, isLoading: isTalentScoreLoading } = useTalentScore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['talent-score-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('achievement_score, full_name, username, title, current_company, profile_picture_url, skills')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.warn('TalentScore profile load error:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const baseScore = talentScore?.score ?? profile?.achievement_score ?? 823;
  const isScoreLoading = isLoading || isTalentScoreLoading;

  // Compute live bonus points from interactive checklist
  const bonusPoints =
    (checklist.skills ? 20 : 0) +
    (checklist.github ? 25 : 0) +
    (checklist.assessment ? 30 : 0) +
    (checklist.education ? 15 : 0);
  const score = baseScore + (bonusPoints - 25); // 25 pre-completed for github

  const rawDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    profile?.username ||
    'TalentXcelServices';

  const displayName = rawDisplayName.includes('.')
    ? rawDisplayName.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : rawDisplayName;

  const displayTitle = profile?.title || 'Director Operations at TalentXcel Services';

  // Toggle checklist item
  const toggleChecklistItem = (id: string, pts: number, label: string) => {
    const newState = !checklist[id];
    setChecklist((prev) => ({ ...prev, [id]: newState }));
    if (newState) {
      toast.success(`Action Completed: +${pts} TalentScore points unlocked!`, {
        description: `Verified: ${label}`,
      });
    } else {
      toast.info(`Action removed: -${pts} preview points`);
    }
  };

  // Scroll to content section smoothly
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 5 Dimension Cards Data
  const dimensions = [
    {
      id: 'industry-strength',
      title: 'Industry Strength',
      subtitle: 'Your domain expertise and relevance',
      score: 92,
      benchmark: 72,
      icon: User,
      color: 'from-amber-400 to-orange-500',
      description: 'Quantifies your depth within enterprise operations, organizational scaling, and global market delivery.',
      subMetrics: [
        { label: 'Domain Leadership Depth', value: 95 },
        { label: 'Market Authority Index', value: 91 },
        { label: 'Cross-industry Transferability', value: 90 },
      ],
      recommendation: 'Publish an executive case study on cross-border workforce optimization.',
    },
    {
      id: 'technical-capability',
      title: 'Technical Capability',
      subtitle: 'Your validated technical skills',
      score: 88,
      benchmark: 69,
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      description: 'Evaluates your verified hands-on architecture, engineering practices, and system modernization prowess.',
      subMetrics: [
        { label: 'System Design & Architecture', value: 92 },
        { label: 'Automation & Cloud Telemetry', value: 89 },
        { label: 'Data Governance & Security', value: 83 },
      ],
      recommendation: 'Complete AWS or GCP Certified Solutions Architect endorsement to reach 95+ score.',
    },
    {
      id: 'market-relevance',
      title: 'Market Relevance',
      subtitle: 'Demand alignment with current opportunities',
      score: 78,
      benchmark: 65,
      icon: Briefcase,
      color: 'from-amber-400 to-orange-500',
      description: 'Measures how aggressively hiring organizations and global entities are seeking your capability vector.',
      subMetrics: [
        { label: 'Role Scarcity Ratio', value: 82 },
        { label: 'Executive Demand Velocity', value: 77 },
        { label: 'Compensation Benchmark Fit', value: 75 },
      ],
      recommendation: 'Add AI Operations and Autonomous Agents to your target capabilities.',
    },
    {
      id: 'recognition-influence',
      title: 'Recognition & Influence',
      subtitle: 'Your professional presence and impact',
      score: 76,
      benchmark: 61,
      icon: Users,
      color: 'from-amber-400 to-orange-500',
      description: 'Assesses peer citations, institutional recommendations, and demonstrable leadership footprint.',
      subMetrics: [
        { label: 'Verified Recommendations', value: 80 },
        { label: 'Community Thought Leadership', value: 74 },
        { label: 'Institutional Trust Score', value: 74 },
      ],
      recommendation: 'Request 2 peer endorsements from executive colleagues on TalentXcel Network.',
    },
    {
      id: 'skill-evolution',
      title: 'Skill Evolution',
      subtitle: 'Your learning momentum and adaptability',
      score: 82,
      benchmark: 68,
      icon: BookOpen,
      color: 'from-amber-400 to-orange-500',
      description: 'Tracks velocity of acquiring modern competencies, certifications, and forward-looking capabilities.',
      subMetrics: [
        { label: '30-Day Learning Momentum', value: 88 },
        { label: 'Skill Refresh Frequency', value: 81 },
        { label: 'Emerging Tech Adoption', value: 77 },
      ],
      recommendation: 'Enroll in the Executive AI Orchestration track to accelerate momentum.',
    },
  ];

  // Navigation Items
  const sidebarItems = [
    { id: 'my-score', label: 'My Score', icon: BarChart3 },
    { id: 'skill-analysis', label: 'Skill Analysis', icon: Sparkles },
    { id: 'opportunity-map', label: 'Opportunity Map', icon: Target },
    { id: 'career-path', label: 'Career Path', icon: Compass },
    { id: 'learning-plan', label: 'Learning Plan', icon: BookOpen },
    { id: 'my-badges', label: 'My Badges', icon: Shield },
  ];

  // Interactive Motto Word Click
  const handleMottoClick = (word: 'LEARN' | 'GROW' | 'EARN' | 'ACHIEVE') => {
    if (word === 'LEARN') {
      setActiveSidebarTab('learning-plan');
      scrollToContent();
      toast.success('📚 Exploring your tailored executive learning plan');
    } else if (word === 'GROW') {
      setActiveSidebarTab('skill-analysis');
      scrollToContent();
      toast.success('📈 30-Day Growth Delta: +66 Points (+8.2% acceleration)', {
        action: {
          label: 'Open Growth Hub',
          onClick: () => navigate('/grow'),
        },
      });
    } else if (word === 'EARN') {
      setActiveSidebarTab('opportunity-map');
      scrollToContent();
      toast.success('💼 12 High-Fit Career Opportunities Matched');
    } else if (word === 'ACHIEVE') {
      setActiveSidebarTab('my-badges');
      scrollToContent();
      toast.success('🏆 6 Verifiable Talent Badges Unlocked');
    }
  };

  // Handlers for Stat Box Clicks
  const handleStatClick = (stat: 'rank' | 'growth' | 'sync') => {
    if (stat === 'rank') {
      setActiveModal({
        type: 'stat-detail',
        title: 'Global Ecosystem Standing: #853',
        description: 'Elite Tier — Top 8% worldwide in Engineering & Operations Leadership',
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your composite score places you in the <strong>92nd percentile</strong> among 100,000+ verified professionals worldwide.
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Domain Rank (Operations & Tech):</span>
                <span className="text-blue-600 dark:text-blue-400">#853 Globally</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>National Benchmark:</span>
                <span className="text-blue-600 dark:text-blue-400">Top 3% Regionally</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Verified Peer Cohort:</span>
                <span className="text-blue-600 dark:text-blue-400">Executive Tier (800+)</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setActiveModal({ type: null });
                setActiveMainTab('benchmark');
                scrollToContent();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Explore Full Industry Benchmark
            </Button>
          </div>
        ),
      });
    } else if (stat === 'growth') {
      setActiveModal({
        type: 'stat-detail',
        title: '30-Day Growth Delta: +66 Points',
        description: 'Fast-Track Growth Velocity (+8.2% acceleration this month)',
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your TalentScore accelerated by <strong>+66 points</strong> across the following verified events:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Verified System Architecture Project</span>
                <Badge className="bg-emerald-500 text-white font-bold">+25 pts</Badge>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Executive Leadership Peer Endorsement</span>
                <Badge className="bg-emerald-500 text-white font-bold">+20 pts</Badge>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Profile Telemetry & Skill Refresh</span>
                <Badge className="bg-emerald-500 text-white font-bold">+21 pts</Badge>
              </div>
            </div>
            <Button
              onClick={() => {
                setActiveModal({ type: null });
                navigate('/grow');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              View Full Career Growth Hub & Accelerators
            </Button>
          </div>
        ),
      });
    } else if (stat === 'sync') {
      setActiveModal({
        type: 'stat-detail',
        title: 'Profile Sync Fidelity: 98%',
        description: 'Real-time telemetry and multi-source credibility verification',
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your profile is verified with high-integrity data points across key platforms:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">GitHub Code & Repositories</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Professional Experience (Resume)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Parsed & Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Academic & Certification Records</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 1 Pending Check
                </span>
              </div>
            </div>
            <Button
              onClick={() => {
                setActiveModal({ type: null });
                navigate('/profile/edit');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Update Sync Connectors
            </Button>
          </div>
        ),
      });
    }
  };

  // Quick Action Pill Handlers
  const handleDiscoverStrengths = () => {
    setActiveSidebarTab('my-score');
    setActiveMainTab('breakdown');
    setActiveSubTab('CORE_DIMENSIONS');
    setExpandedDimension('technical-capability');
    scrollToContent();
    toast.success('Showing your verified strengths & capability scores');
  };

  const handleGetInsights = () => {
    setActiveModal({
      type: 'insights',
      title: 'AI Career Signals & Growth Insights',
      description: `Analysis for ${displayName} (${displayTitle})`,
      content: (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Executive High-Growth Vector
            </h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Your profile exhibits rare duality: strong technical systems capability (88) coupled with top-tier operational execution (92). You are strongly positioned for VP of Operations and Chief Technology Officer roles in high-growth ecosystems.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-slate-100">Top 3 High-Impact Recommendations:</h5>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Target Executive Compensation Range:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Top-tier organizations offer $170k–$240k (or ₹45L–₹70L) for leaders with your exact capability matrix.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Unlock the Next +50 Score Points:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Complete the Leadership Assessment and add 2 enterprise references to cross the 870 Super-Elite threshold.</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setActiveModal({ type: null });
              scrollToContent();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Review Detailed Dimensions Below
          </Button>
        </div>
      ),
    });
  };

  const handleUnlockOpportunities = () => {
    setActiveSidebarTab('opportunity-map');
    scrollToContent();
    toast.success('🎯 12 High-Fit Opportunities Matched to Your TalentScore');
  };

  const handleBuildFuture = () => {
    setActiveSidebarTab('career-path');
    scrollToContent();
    toast.success('🚀 Navigating to your Personalized Career Progression Path');
  };

  return (
    <>
      <Helmet>
        <title>TalentScore - Your Career Potential in 4D | TalentXcel</title>
        <meta name="description" content="AI-powered insights. Real opportunities. A smarter you with TalentScore." />
      </Helmet>

      {/* Global Interactive Modal */}
      <Dialog open={activeModal.type !== null} onOpenChange={(open) => !open && setActiveModal({ type: null })}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {activeModal.title}
            </DialogTitle>
            {activeModal.description && (
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {activeModal.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="pt-2">{activeModal.content}</div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-[#f3f7fd] text-slate-900 selection:bg-blue-500/20 overflow-x-hidden">
        {/* ========================================================================= */}
        {/* HERO SECTION: Futuristic 3D Cyber Stage with Glowing Pedestal & Card     */}
        {/* ========================================================================= */}
        <div className="relative w-full bg-gradient-to-b from-[#020717] via-[#040e29] via-50% to-[#f3f7fd] pt-6 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Ambient Cyber Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-6 right-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Micro Grid Overlay for Cyber Polish */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a0a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            {/* 3-Column Hero Layout: Text Left | Pedestal & Card Center | Typography Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Heading & 4 Quick Actions */}
              <div className="lg:col-span-4 space-y-4 text-left z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="tracking-[0.25em] text-[10px] font-bold text-blue-300 uppercase">
                    C A R E E R &nbsp; S I G N A L S
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
                  Your Career<br />
                  Potential in <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]">4D</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300/90 font-medium leading-relaxed max-w-sm">
                  AI-powered insights. Real opportunities.<br />
                  A smarter, verified you.
                </p>

                {/* 4 Feature Pills Row - Fully Clickable */}
                <div className="grid grid-cols-4 gap-2 pt-2 max-w-md">
                  <button
                    onClick={handleDiscoverStrengths}
                    className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 leading-tight group-hover:text-cyan-300 transition-colors">
                      Discover<br />Strengths
                    </span>
                  </button>

                  <button
                    onClick={handleGetInsights}
                    className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 leading-tight group-hover:text-cyan-300 transition-colors">
                      Get<br />Insights
                    </span>
                  </button>

                  <button
                    onClick={handleUnlockOpportunities}
                    className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 leading-tight group-hover:text-cyan-300 transition-colors">
                      Unlock<br />Opportunities
                    </span>
                  </button>

                  <button
                    onClick={handleBuildFuture}
                    className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 leading-tight group-hover:text-cyan-300 transition-colors">
                      Build<br />Your Future
                    </span>
                  </button>
                </div>
              </div>

              {/* Center Column: 3D Stage Pedestal with Compact Gaming Card & Orbiting Badges */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-2 pb-0">
                {/* Orbiting Glass Holographic Badges - Positioned with clean clearance */}
                {/* Left Floating Badge: Growth */}
                <motion.div
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => handleStatClick('growth')}
                  title="Click to view Growth Delta"
                  className="hidden md:flex absolute -left-8 sm:-left-12 lg:-left-14 top-[32%] z-30 p-2.5 px-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_18px_rgba(34,211,238,0.3)] flex-col items-center gap-1 cursor-pointer hover:scale-110 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all group"
                >
                  <Briefcase className="w-4 h-4 text-cyan-300 group-hover:animate-pulse" />
                  <span className="text-[10px] font-bold text-white tracking-wide">Growth</span>
                </motion.div>

                {/* Right Upper Floating Badge: Skills */}
                <motion.div
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    setActiveSidebarTab('skill-analysis');
                    scrollToContent();
                    toast.success('Viewing Verified Skill Analysis');
                  }}
                  title="Click to view Skills Analysis"
                  className="hidden md:flex absolute -right-8 sm:-right-12 lg:-right-14 top-[18%] z-30 p-2.5 px-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_18px_rgba(34,211,238,0.3)] flex-col items-center gap-1 cursor-pointer hover:scale-110 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all group"
                >
                  <TrendingUp className="w-4 h-4 text-cyan-300 group-hover:animate-pulse" />
                  <span className="text-[10px] font-bold text-white tracking-wide">Skills</span>
                </motion.div>

                {/* Right Lower Floating Badge: Opportunities */}
                <motion.div
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    setActiveSidebarTab('opportunity-map');
                    scrollToContent();
                    toast.success('Viewing High-Fit Opportunities');
                  }}
                  title="Click to view Opportunities"
                  className="hidden md:flex absolute -right-8 sm:-right-12 lg:-right-14 bottom-[32%] z-30 p-2.5 px-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_18px_rgba(34,211,238,0.3)] flex-col items-center gap-1 cursor-pointer hover:scale-110 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all group"
                >
                  <User className="w-4 h-4 text-cyan-300 group-hover:animate-pulse" />
                  <span className="text-[10px] font-bold text-white tracking-wide">Opportunities</span>
                </motion.div>

                {/* Vertical Tablet Gaming Card - Mounted in 3D */}
                <div className="relative z-20 w-full max-w-[340px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
                  <GamingTalentScoreCard
                    compact={true}
                    score={score}
                    displayName={isScoreLoading ? '...' : displayName}
                    title={profile?.title || 'Director Operations'}
                    company={profile?.current_company || 'TalentXcel Services'}
                    actionText="View & Earn in Gaming Hub"
                    actionRoute="/gamification"
                    rankOverride="#853"
                    growthDeltaOverride="+66"
                    syncFidelityOverride="98%"
                    onStatClick={handleStatClick}
                    onGaugeClick={handleGetInsights}
                    className="border-blue-400/40 shadow-[0_0_35px_rgba(37,99,235,0.35)]"
                  />
                </div>

                {/* 3D Cylindrical Vector Stage Pedestal with LEARN | GROW | EARN | ACHIEVE */}
                <div className="w-full max-w-[680px] sm:max-w-[720px] md:max-w-[760px] relative -mt-10 sm:-mt-12 z-10">
                  <TalentScorePedestal onMottoClick={handleMottoClick} />
                </div>
              </div>

              {/* Right Column: Stylized Vertical Slogan */}
              <div className="hidden lg:flex lg:col-span-3 flex-col items-end text-right space-y-4 z-20">
                <div className="text-[9.5px] font-bold tracking-[0.32em] text-blue-300/85 uppercase space-y-1">
                  <div>B E T T E R</div>
                  <div>T A L E N T</div>
                  <div>B R I G H T E R</div>
                  <div>T O M O R R O W</div>
                  <div className="w-10 h-0.5 bg-cyan-400 ml-auto mt-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="font-serif italic text-xl text-blue-100/90 leading-snug drop-shadow-sm max-w-[170px]">
                  More Than a Score, A Bigger Future
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIDDLE SECTION: Segmented Toggle Pill Bar (Image 1 Style)                 */}
        {/* ========================================================================= */}
        <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-4 relative z-30 flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-slate-200/90 dark:border-slate-800">
            <button
              onClick={() => setActiveMainTab('breakdown')}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer',
                activeMainTab === 'breakdown'
                  ? 'bg-[#1d63ed] text-white shadow-md shadow-blue-500/40'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <Activity className="w-4 h-4" />
              Your Breakdown
            </button>
            <button
              onClick={() => setActiveMainTab('benchmark')}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer',
                activeMainTab === 'benchmark'
                  ? 'bg-[#1d63ed] text-white shadow-md shadow-blue-500/40'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Industry Benchmark
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 3-Column Layout (Sidebar Left | Dimensions Center | Card Right) */}
        {/* ========================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ── Left Column: Glass Navigation Menu (lg:col-span-3) ────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="rounded-[22px] border border-blue-200/40 bg-gradient-to-b from-[#253e70]/85 via-[#2d4982]/90 to-[#3b5d9e]/95 text-white backdrop-blur-xl shadow-xl overflow-hidden p-2.5 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSidebarTab(item.id);
                      if (activeMainTab === 'benchmark' && item.id === 'my-score') {
                        setActiveMainTab('breakdown');
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      activeSidebarTab === item.id
                        ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-cyan-300" />
                      <span>{item.label}</span>
                    </div>
                    {activeSidebarTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />}
                  </button>
                ))}

                {/* Level Up Promo Card inside sidebar */}
                <div
                  onClick={() => navigate('/career-os')}
                  className="p-3.5 mt-3 rounded-xl bg-gradient-to-br from-slate-900/70 to-blue-950/85 border border-white/15 text-white space-y-1.5 cursor-pointer hover:border-cyan-400/50 hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>Level Up</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-snug">
                    Unlock new executive opportunities with TalentXcel
                  </p>
                </div>
              </Card>
            </div>

            {/* ── Center Column: Dynamic Content (lg:col-span-6) ─────────────────────── */}
            <div className="lg:col-span-6 space-y-4">
              {/* Dynamic View 1: Main Tab is Industry Benchmark */}
              {activeMainTab === 'benchmark' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blue-200 dark:border-blue-900 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        GLOBAL COMPARISON RADAR
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                        Operations & Tech Leadership
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Compared against 14,200+ verified professionals in your tier
                      </p>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-extrabold px-3 py-1 text-xs">
                      +183 pts above median
                    </Badge>
                  </div>

                  {/* Benchmark Dimension Comparative Bars */}
                  <div className="space-y-2.5">
                    {dimensions.map((dim) => (
                      <Card key={dim.id} className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xs">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{dim.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[11px]">Benchmark: {dim.benchmark}</span>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-sm">You: {dim.score}</span>
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
                              +{dim.score - dim.benchmark}
                            </Badge>
                          </div>
                        </div>

                        {/* Comparative Stacked Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            {/* Benchmark Marker Line */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                              style={{ left: `${dim.benchmark}%` }}
                              title={`Benchmark: ${dim.benchmark}`}
                            />
                            {/* User Score Fill */}
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Return to Personal Breakdown CTA */}
                  <Button
                    onClick={() => setActiveMainTab('breakdown')}
                    variant="outline"
                    className="w-full text-xs font-bold gap-2"
                  >
                    ← Return to Personal Breakdown
                  </Button>
                </div>
              ) : activeSidebarTab === 'skill-analysis' ? (
                /* Dynamic View 2: Skill Analysis Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Verified Competencies</h3>
                      <p className="text-[11px] text-slate-500">8 skills validated by real telemetry & projects</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/profile/edit')} className="text-xs gap-1.5 h-8">
                      <PlusCircle className="w-3.5 h-3.5" /> Add Skill
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { name: 'Executive Operations', level: 96, category: 'Leadership' },
                      { name: 'System Architecture', level: 92, category: 'Technical' },
                      { name: 'Cloud Scale & DevOps', level: 88, category: 'Engineering' },
                      { name: 'Cross-functional Scaling', level: 94, category: 'Management' },
                      { name: 'Data Governance', level: 85, category: 'Compliance' },
                      { name: 'AI & Automation Workflow', level: 90, category: 'Innovation' },
                    ].map((s) => (
                      <Card key={s.name} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.name}</h4>
                            <span className="text-[10px] text-slate-400">{s.category}</span>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-extrabold">
                            {s.level}%
                          </Badge>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${s.level}%` }} />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : activeSidebarTab === 'opportunity-map' ? (
                /* Dynamic View 3: Opportunity Map Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Direct TalentScore Matches</h3>
                      <p className="text-[11px] text-slate-500">Roles prioritized for your 823 ELITE score</p>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-bold text-xs">12 Active Matches</Badge>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { role: 'VP of Global Operations', company: 'ApexScale Technologies', match: 96, salary: '$180k - $240k', loc: 'Hybrid / Remote' },
                      { role: 'Director of Systems & Architecture', company: 'CloudEdge Global', match: 92, salary: '$165k - $210k', loc: 'New York / Remote' },
                      { role: 'Head of Enterprise Delivery', company: 'Vanguard Systems', match: 89, salary: '$150k - $195k', loc: 'London / Hybrid' },
                    ].map((job) => (
                      <Card key={job.role} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{job.role}</h4>
                            <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                              {job.match}% Fit
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{job.company} • {job.loc}</p>
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1 inline-block">{job.salary}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate('/jobs')}
                          className="h-8 text-xs font-bold gap-1 shrink-0"
                        >
                          Apply <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : activeSidebarTab === 'career-path' ? (
                /* Dynamic View 4: Career Path Progression Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Executive Progression Ladder</h3>
                    <p className="text-[11px] text-slate-500">Your optimal career velocity towards C-Suite leadership</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { step: 1, role: 'Lead Operations Specialist', status: 'Completed', pts: '700 Score Tier' },
                      { step: 2, role: 'Director Operations', status: 'Current Position (823)', pts: 'Elite Tier' },
                      { step: 3, role: 'VP of Global Operations / COO', status: 'Target Milestone (900+)', pts: 'Next 6-12 Months' },
                    ].map((path) => (
                      <div key={path.step} className={cn(
                        'p-3.5 rounded-xl border flex items-center justify-between',
                        path.step === 2
                          ? 'border-blue-400/60 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95'
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs',
                            path.step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                          )}>
                            {path.step}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{path.role}</h4>
                            <span className="text-[10px] text-slate-500">{path.status}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {path.pts}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSidebarTab === 'learning-plan' ? (
                /* Dynamic View 5: Learning Plan Tab */
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Curated Learning Tracks</h3>
                      <p className="text-[11px] text-slate-500">Accelerate your score to 900+ with micro-credentials</p>
                    </div>
                  </div>

                  {[
                    { title: 'Executive AI Orchestration', duration: '4 Hours', points: '+25 pts', prog: 60 },
                    { title: 'Global Multi-Cloud Scale', duration: '6 Hours', points: '+30 pts', prog: 15 },
                    { title: 'Cross-Border Operational Law', duration: '3 Hours', points: '+20 pts', prog: 0 },
                  ].map((track) => (
                    <Card key={track.title} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{track.title}</h4>
                          <span className="text-[10px] text-slate-400">{track.duration} • Unlocks {track.points}</span>
                        </div>
                        <Button size="sm" onClick={() => navigate('/learning')} className="h-7 text-xs font-bold">
                          Continue
                        </Button>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: `${track.prog}%` }} />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : activeSidebarTab === 'my-badges' ? (
                /* Dynamic View 6: My Badges Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Verifiable Achievement Badges</h3>
                    <p className="text-[11px] text-slate-500">Cryptographically verifiable on TalentXcel Passport</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: 'Elite Tier 800+', icon: Trophy, unlocked: true },
                      { name: 'Operations Vanguard', icon: Award, unlocked: true },
                      { name: 'Top 8% Talent', icon: Star, unlocked: true },
                      { name: 'Verified Leader', icon: ShieldCheck, unlocked: true },
                      { name: 'Growth Accelerator', icon: Flame, unlocked: true },
                      { name: 'Founding Pioneer', icon: Sparkles, unlocked: true },
                    ].map((badge) => (
                      <Card
                        key={badge.name}
                        onClick={() => toast.success(`Badge Verified: ${badge.name}`, { description: 'Issued on TalentXcel Credential Network' })}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:scale-105 transition-all"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                          <badge.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10.5px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {badge.name}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-extrabold">VERIFIED</span>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                /* Dynamic View 7: Default My Score / Core Dimensions View */
                <div className="space-y-4">
                  {/* AI Insights Banner Card - Clickable */}
                  <div
                    onClick={handleGetInsights}
                    className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blue-100 dark:border-blue-900/60 shadow-xs flex items-start gap-3.5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          AI Insights for <span className="text-blue-600 dark:text-blue-400">Your Career Growth</span>
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          View Analysis <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Add your professional details like resume, skills, and complete the CareerProfile form to get an actionable 4D growth analysis.
                      </p>
                    </div>
                  </div>

                  {/* Sub-tabs: CORE DIMENSIONS / INDUSTRY / OPPORTUNITIES / COMPARISON */}
                  <div className="flex items-center gap-5 border-b border-slate-200 dark:border-slate-800 px-1 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'CORE_DIMENSIONS', label: 'CORE DIMENSIONS' },
                      { id: 'INDUSTRY', label: 'INDUSTRY' },
                      { id: 'OPPORTUNITIES', label: 'OPPORTUNITIES' },
                      { id: 'COMPARISON', label: 'COMPARISON' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          if (tab.id === 'COMPARISON') setActiveMainTab('benchmark');
                          if (tab.id === 'OPPORTUNITIES') setActiveSidebarTab('opportunity-map');
                        }}
                        className={cn(
                          'pb-2.5 text-xs font-bold transition-all relative shrink-0 cursor-pointer',
                          activeSubTab === tab.id
                            ? 'text-slate-950 dark:text-white font-black'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        )}
                      >
                        {tab.label}
                        {activeSubTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 dark:bg-cyan-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 5 Clickable & Expandable Dimension Cards */}
                  <div className="space-y-2.5">
                    {dimensions.map((dim) => {
                      const isExpanded = expandedDimension === dim.id;
                      return (
                        <Card
                          key={dim.id}
                          className={cn(
                            'rounded-xl border transition-all overflow-hidden',
                            isExpanded
                              ? 'border-blue-300/80 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 shadow-sm ring-1 ring-blue-500/20'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 hover:border-slate-300 hover:shadow-xs'
                          )}
                        >
                          {/* Card Header Row - Click to Toggle Accordion */}
                          <div
                            onClick={() => setExpandedDimension(isExpanded ? null : dim.id)}
                            className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-[170px]">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                <dim.icon className="w-4 h-4 text-amber-500" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{dim.title}</h4>
                                <p className="text-[10px] text-slate-400">{dim.subtitle}</p>
                              </div>
                            </div>

                            {/* Smooth Golden/Orange Progress Bar */}
                            <div className="flex-1 max-w-[200px] hidden sm:block">
                              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                                  style={{ width: `${dim.score}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{dim.score}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded In-Depth Insights Accordion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 text-xs space-y-3"
                              >
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {dim.description}
                                </p>

                                {/* 3 Detailed Sub-metrics */}
                                <div className="space-y-1.5">
                                  {dim.subMetrics.map((sm) => (
                                    <div key={sm.label} className="flex justify-between items-center text-[10.5px]">
                                      <span className="text-slate-500 dark:text-slate-400">{sm.label}</span>
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sm.value}%` }} />
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{sm.value}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="text-[10.5px] text-amber-900 dark:text-amber-200">
                                      {dim.recommendation}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/career-os')}
                                    className="h-6 text-[10px] font-bold px-2.5 bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                                  >
                                    Take Action
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Professional Identity Hub Banner */}
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Professional Identity Hub</h4>
                        <p className="text-[10.5px] text-slate-400">Showcase credentials, licenses, and verified telemetry.</p>
                      </div>
                    </div>
                    <Link
                      to="/passport"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 shrink-0"
                    >
                      View Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Improve Your TalentScore Card (lg:col-span-3) ──────── */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="rounded-[24px] bg-gradient-to-b from-[#091530] via-[#050e22] to-[#020612] border border-blue-500/25 p-5 text-white text-center space-y-4 shadow-xl relative overflow-hidden">
                {/* Glowing Background Glow */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                  <Zap className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-white leading-tight">
                    Improve Your<br />TalentScore
                  </h3>
                  <p className="text-[10.5px] text-slate-300 mt-1.5 leading-relaxed">
                    Complete quick actions to unlock the next <strong>+90 score points</strong>.
                  </p>
                </div>

                {/* Interactive Points Checklist */}
                <div className="space-y-2 text-left pt-1">
                  {[
                    { id: 'skills', label: 'Verify 2 Top Skills', pts: 20 },
                    { id: 'github', label: 'Sync GitHub / Portfolio', pts: 25 },
                    { id: 'assessment', label: 'Leadership Assessment', pts: 30 },
                    { id: 'education', label: 'Verify Credentials', pts: 15 },
                  ].map((item) => {
                    const isChecked = checklist[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id, item.pts, item.label)}
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all',
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={cn('text-[11px] font-medium leading-tight', isChecked && 'line-through opacity-80')}>
                            {item.label}
                          </span>
                        </div>
                        <span className={cn('text-[10px] font-bold shrink-0', isChecked ? 'text-emerald-400' : 'text-amber-400')}>
                          +{item.pts}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Live Projected Score Pill */}
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">Projected Score:</span>
                  <span className="font-black text-cyan-300 text-xs">{score} Points</span>
                </div>

                <Button
                  onClick={() => navigate('/career-os')}
                  className="w-full h-10 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  Start Improving <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
