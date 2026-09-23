/**
 * TalentXcel TalentScore Experience — Career Potential in 4D
 * Pixel-perfect implementation matching the master 3D gaming card and 3-column cockpit design.
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, BarChart3, Zap, Compass, Briefcase, TrendingUp,
  User, Users, BookOpen, GraduationCap, ChevronRight, ArrowRight,
  Sparkles, Check, Share2, Copy, Shield, Layers, Award,
  Flame, Lock, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GamingTalentScoreCard } from '@/components/talent-score/GamingTalentScoreCard';
import { useTalentScore } from '@/hooks/useTalentScore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TalentScorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'breakdown' | 'benchmark'>('breakdown');
  const [activeSidebarTab, setActiveSidebarTab] = useState('my-score');
  const [activeSubTab, setActiveSubTab] = useState('CORE_DIMENSIONS');

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

  const score = talentScore?.score ?? profile?.achievement_score ?? 823;
  const isScoreLoading = isLoading || isTalentScoreLoading;

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

  // 5 Dimension Cards Data
  const dimensions = [
    {
      id: 'industry-strength',
      title: 'Industry Strength',
      subtitle: 'Your domain expertise and relevance',
      score: 92,
      icon: User,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'technical-capability',
      title: 'Technical Capability',
      subtitle: 'Your validated technical skills',
      score: 88,
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'market-relevance',
      title: 'Market Relevance',
      subtitle: 'Demand alignment with current opportunities',
      score: 78,
      icon: Briefcase,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'recognition-influence',
      title: 'Recognition & Influence',
      subtitle: 'Your professional presence and impact',
      score: 76,
      icon: Users,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'skill-evolution',
      title: 'Skill Evolution',
      subtitle: 'Your learning momentum and adaptability',
      score: 82,
      icon: BookOpen,
      color: 'from-amber-400 to-orange-500',
    },
  ];

  const sidebarItems = [
    { id: 'my-score', label: 'My Score', icon: BarChart3 },
    { id: 'skill-analysis', label: 'Skill Analysis', icon: Sparkles },
    { id: 'opportunity-map', label: 'Opportunity Map', icon: Target },
    { id: 'career-path', label: 'Career Path', icon: Compass },
    { id: 'learning-plan', label: 'Learning Plan', icon: BookOpen },
    { id: 'my-badges', label: 'My Badges', icon: Shield },
  ];

  return (
    <>
      <Helmet>
        <title>TalentScore - Your Career Potential in 4D | TalentXcel</title>
        <meta name="description" content="AI-powered insights. Real opportunities. A smarter you with TalentScore." />
      </Helmet>

      <div className="min-h-screen bg-[#f3f7fd] text-slate-900 selection:bg-blue-500/20 overflow-x-hidden">
        {/* ========================================================================= */}
        {/* HERO SECTION: Futuristic 3D Cyber Stage with Glowing Pedestal & Card     */}
        {/* ========================================================================= */}
        <div className="relative w-full bg-gradient-to-b from-[#030919] via-[#05112c] to-[#0b1c42] pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Ambient Lighting & Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto">
            {/* 3-Column Hero Layout: Text Left | Pedestal & Card Center | Typography Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              {/* Left Column: Heading & 4 Quick Actions */}
              <div className="lg:col-span-4 space-y-6 text-left z-20">
                <div className="tracking-[0.3em] text-[11px] font-bold text-blue-400/90 uppercase">
                  C A R E E R &nbsp;&nbsp; S I G N A L S
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  Your Career<br />
                  Potential in <span className="text-cyan-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.7)]">4D</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300/90 font-medium leading-relaxed max-w-md">
                  AI-powered insights. Real opportunities.<br />
                  A smarter you.
                </p>

                {/* 4 Feature Pills Row */}
                <div className="grid grid-cols-4 gap-2 pt-4 max-w-md">
                  <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 leading-tight">
                      Discover<br />Strengths
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 leading-tight">
                      Get<br />Insights
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 leading-tight">
                      Unlock<br />Opportunities
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:scale-110 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300 leading-tight">
                      Build<br />Your Future
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Column: 3D Stage Pedestal with Gaming Card & Orbiting Badges */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center py-6">
                {/* Orbiting Glass Holographic Badges */}
                {/* Left Floating Badge: Growth */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-30 p-3 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.25)] flex-col items-center gap-1.5"
                >
                  <Briefcase className="w-5 h-5 text-cyan-300" />
                  <span className="text-[11px] font-bold text-white tracking-wide">Growth</span>
                </motion.div>

                {/* Right Upper Floating Badge: Skills */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="hidden md:flex absolute -right-6 top-1/4 z-30 p-3 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.25)] flex-col items-center gap-1.5"
                >
                  <TrendingUp className="w-5 h-5 text-cyan-300" />
                  <span className="text-[11px] font-bold text-white tracking-wide">Skills</span>
                </motion.div>

                {/* Right Lower Floating Badge: Opportunities */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="hidden md:flex absolute -right-6 bottom-1/4 z-30 p-3 px-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.25)] flex-col items-center gap-1.5"
                >
                  <User className="w-5 h-5 text-cyan-300" />
                  <span className="text-[11px] font-bold text-white tracking-wide">Opportunities</span>
                </motion.div>

                {/* Vertical Tablet Gaming Card */}
                <div className="relative z-20 w-full max-w-[380px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                  <GamingTalentScoreCard
                    score={score}
                    displayName={isScoreLoading ? '...' : displayName}
                    title={profile?.title || 'Director Operations'}
                    company={profile?.current_company || 'TalentXcel Services'}
                    actionText="View & Earn in Gaming Hub"
                    actionRoute="/gamification"
                    rankOverride="#853"
                    growthDeltaOverride="+66"
                    syncFidelityOverride="98%"
                    className="border-blue-400/40 shadow-[0_0_40px_rgba(37,99,235,0.35)]"
                  />
                </div>

                {/* 3D Circular Illuminated Stage Pedestal */}
                <div className="w-full max-w-[480px] relative -mt-7 z-10">
                  <div className="w-full h-14 rounded-[100%] bg-gradient-to-r from-[#04102b] via-[#0b245a] to-[#04102b] border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.6),inset_0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-black tracking-[0.35em] text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)] uppercase select-none">
                      LEARN &nbsp;&nbsp;|&nbsp;&nbsp; GROW &nbsp;&nbsp;|&nbsp;&nbsp; EARN &nbsp;&nbsp;|&nbsp;&nbsp; ACHIEVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Stylized Vertical Slogan */}
              <div className="hidden lg:flex lg:col-span-3 flex-col items-end text-right space-y-6 z-20">
                <div className="text-[10px] font-bold tracking-[0.35em] text-blue-300/80 uppercase space-y-1">
                  <div>B E T T E R</div>
                  <div>T A L E N T</div>
                  <div>B R I G H T E R</div>
                  <div>T O M O R R O W</div>
                  <div className="w-12 h-0.5 bg-cyan-400 ml-auto mt-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>

                <div className="font-serif italic text-2xl text-blue-100/90 leading-snug drop-shadow-sm max-w-[180px]">
                  More Than a Score, A Bigger Future
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIDDLE SECTION: Segmented Toggle Pill Bar                                 */}
        {/* ========================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30 flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg">
            <button
              onClick={() => setActiveMainTab('breakdown')}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold transition-all duration-300',
                activeMainTab === 'breakdown'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/35'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Your Breakdown
            </button>
            <button
              onClick={() => setActiveMainTab('benchmark')}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold transition-all duration-300',
                activeMainTab === 'benchmark'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/35'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Industry Benchmark
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 3-Column Layout (Sidebar Left | Dimensions Center | Card Right) */}
        {/* ========================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Column: Glass Navigation Menu (lg:col-span-3) ────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="rounded-[24px] border border-blue-200/40 bg-gradient-to-b from-[#253e70]/80 via-[#2d4982]/85 to-[#3b5d9e]/90 text-white backdrop-blur-xl shadow-xl overflow-hidden p-3 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarTab(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all',
                      activeSidebarTab === item.id
                        ? 'bg-white/20 text-white border border-white/25 shadow-sm'
                        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-cyan-300" />
                      <span>{item.label}</span>
                    </div>
                    {activeSidebarTab === item.id && <ChevronRight className="w-4 h-4 text-cyan-300" />}
                  </button>
                ))}

                {/* Level Up Promo Card inside sidebar */}
                <div
                  onClick={() => navigate('/career-os')}
                  className="p-4 mt-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-blue-950/80 border border-white/15 text-white space-y-2 cursor-pointer hover:border-cyan-400/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>Level Up</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Unlock new opportunities with TalentXcel
                  </p>
                </div>
              </Card>
            </div>

            {/* ── Center Column: Dimensions & Insights (lg:col-span-6) ──────────────── */}
            <div className="lg:col-span-6 space-y-5">
              {/* AI Insights Banner Card */}
              <div className="p-5 rounded-2xl bg-white/90 border border-blue-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    AI Insights for <span className="text-blue-600">Your Career Growth</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Add your professional details like resume, skills, and complete the CareerProfile form to get an actionable 4D growth analysis.
                  </p>
                </div>
              </div>

              {/* Sub-tabs: CORE DIMENSIONS / INDUSTRY / OPPORTUNITIES / COMPARISON */}
              <div className="flex items-center gap-6 border-b border-slate-200 px-2">
                {[
                  { id: 'CORE_DIMENSIONS', label: 'CORE DIMENSIONS' },
                  { id: 'INDUSTRY', label: 'INDUSTRY' },
                  { id: 'OPPORTUNITIES', label: 'OPPORTUNITIES' },
                  { id: 'COMPARISON', label: 'COMPARISON' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={cn(
                      'pb-3 text-xs font-bold transition-all relative',
                      activeSubTab === tab.id
                        ? 'text-slate-950 font-black'
                        : 'text-slate-400 hover:text-slate-700'
                    )}
                  >
                    {tab.label}
                    {activeSubTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* 5 Dimension Cards */}
              <div className="space-y-3">
                {dimensions.map((dim) => (
                  <Card key={dim.id} className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-[200px]">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                          <dim.icon className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{dim.title}</h4>
                          <p className="text-[10px] text-slate-400">{dim.subtitle}</p>
                        </div>
                      </div>

                      {/* Smooth Golden/Orange Progress Bar */}
                      <div className="flex-1 max-w-[240px] hidden sm:block">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-800">{dim.score}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Professional Identity Hub Banner */}
              <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Professional Identity Hub</h4>
                    <p className="text-[11px] text-slate-400">Showcase your full credentials including licenses, certifications, and achievements.</p>
                  </div>
                </div>
                <Link
                  to="/passport"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
                >
                  View Hub <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ── Right Column: Improve Your TalentScore Card (lg:col-span-3) ──────── */}
            <div className="lg:col-span-3">
              <Card className="rounded-[28px] bg-gradient-to-b from-[#091530] via-[#050e22] to-[#020612] border border-blue-500/25 p-7 text-white text-center space-y-5 shadow-2xl relative overflow-hidden">
                {/* Glowing Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]">
                  <Zap className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-black text-white leading-tight">
                    Improve Your<br />TalentScore
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
                    Complete focused career actions to unlock the next 100+ score points and access exclusive opportunities.
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/career-os')}
                  className="w-full h-11 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold gap-2 shadow-lg hover:scale-105 transition-all"
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
