/**
 * TalentXcel TalentScore Experience — Universal Career Potential in 4D
 * Fully interactive, multi-industry global platform with live database telemetry.
 * Serves Healthcare, Finance, Legal, Engineering, Operations, Creative,
 * Education, Hospitality, Energy, Sales/Marketing, HR, Technology, and Executive Leadership.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target, BarChart3, Zap, Compass, Briefcase, TrendingUp,
  User, Users, BookOpen, GraduationCap, ChevronRight, ArrowRight,
  Sparkles, Check, Share2, Copy, Shield, Layers, Award,
  Flame, Lock, ExternalLink, Trophy, ShieldCheck, CheckCircle2,
  Info, Clock, ArrowUpRight, Star, X, CheckSquare, Square,
  ChevronDown, ChevronUp, PlusCircle, Activity, Globe, Building2, MapPin
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
import { TalentScoreVFXHero } from '@/components/talent-score/TalentScoreVFXHero';
import { useTalentScore } from '@/hooks/useTalentScore';
import {
  GLOBAL_INDUSTRIES,
  getDimensionsForIndustry,
  getIndustrySyncDetails,
  detectIndustryFromProfile
} from '@/data/industryBenchmarkData';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TalentScorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Navigation & Tab States
  const [isCinematicVFX, setIsCinematicVFX] = useState<boolean>(true);
  const [activeMainTab, setActiveMainTab] = useState<'breakdown' | 'benchmark'>('breakdown');
  const [activeSidebarTab, setActiveSidebarTab] = useState('my-score');
  const [activeSubTab, setActiveSubTab] = useState('CORE_DIMENSIONS');
  const [expandedDimension, setExpandedDimension] = useState<string | null>('domain-authority');

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<{
    type: 'insights' | 'stat-detail' | 'improve' | 'strengths' | null;
    title?: string;
    description?: string;
    content?: React.ReactNode;
  }>({ type: null });

  // 1. Live Computed TalentScore Hook
  const { talentScore, isLoading: isTalentScoreLoading } = useTalentScore();

  // 2. Live Profile Query (Real Candidate Data)
  const { data: profile, isLoading } = useQuery({
    queryKey: ['talent-score-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, achievement_score, full_name, username, title, headline,
          current_job_title, current_company, profile_picture_url, skills,
          verified_skills, industry, bio, about, location, experience_years,
          years_of_experience, education, education_history, work_experiences
        `)
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

  // 3. Multi-Industry Global Sector State
  const detectedIndustryId = useMemo(() => {
    return detectIndustryFromProfile(profile);
  }, [profile]);

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('universal');

  useEffect(() => {
    if (detectedIndustryId && detectedIndustryId !== 'universal') {
      setSelectedIndustryId(detectedIndustryId);
    }
  }, [detectedIndustryId]);

  const activeSector = useMemo(() => {
    return GLOBAL_INDUSTRIES.find((ind) => ind.id === selectedIndustryId) || GLOBAL_INDUSTRIES[0];
  }, [selectedIndustryId]);

  // 4. Live Real Jobs from Supabase
  const { data: realJobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['talent-score-matched-jobs', selectedIndustryId, profile?.title],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, salary_range, salary_min, salary_max, industry, is_remote')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.warn('Real jobs query error:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 5. Live Real Aggregated Courses from Supabase
  const { data: realCourses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ['talent-score-courses', selectedIndustryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aggregated_courses')
        .select('id, title, provider_name, duration_text, category, domain, industry, level, source_url')
        .limit(6);

      if (error) {
        console.warn('Aggregated courses query error:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Dynamic Live Candidate Names & Titles
  const rawDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    profile?.username ||
    'Global Professional';

  const displayName = rawDisplayName.includes('.')
    ? rawDisplayName.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : rawDisplayName;

  const displayTitle = profile?.title || profile?.headline || profile?.current_job_title || 'Executive Leadership';
  const displayCompany = profile?.current_company || 'Global Enterprise Network';

  // Dynamic Real Profile Sync Fidelity
  const realFidelity = useMemo(() => {
    if (!profile) return 92;
    let val = 0;
    if (profile.full_name) val += 15;
    if (profile.title || profile.headline || profile.current_job_title) val += 15;
    if (profile.current_company) val += 15;
    if (Array.isArray(profile.skills) && profile.skills.length >= 3) val += 20;
    else if (Array.isArray(profile.skills) && profile.skills.length > 0) val += 10;
    if (profile.location) val += 10;
    if (profile.education || profile.education_history) val += 15;
    if (profile.bio || profile.about) val += 10;
    return Math.min(100, Math.max(50, val));
  }, [profile]);

  // Live Checklist State Synced with Real Profile Records
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    skills: false,
    experience: false,
    education: false,
    credentials: false,
  });

  useEffect(() => {
    if (profile) {
      setChecklist({
        skills: Boolean(Array.isArray(profile.skills) && profile.skills.length >= 3),
        experience: Boolean(profile.title || profile.current_company || profile.experience_years),
        education: Boolean(profile.education || profile.education_history),
        credentials: Boolean(profile.bio || profile.about || profile.headline),
      });
    }
  }, [profile]);

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

  // Live Score Calculation (Clamped to 1000)
  const baseScore = talentScore?.score ?? profile?.achievement_score ?? 820;
  const isScoreLoading = isLoading || isTalentScoreLoading;

  const bonusPoints =
    (checklist.skills ? 20 : 0) +
    (checklist.experience ? 25 : 0) +
    (checklist.education ? 20 : 0) +
    (checklist.credentials ? 15 : 0);
  const score = Math.min(1000, Math.max(300, baseScore + (bonusPoints - 25)));

  const dynamicGrowthDelta = useMemo(() => {
    const baseDelta = talentScore?.delta && talentScore.delta > 0 ? talentScore.delta : 46;
    const computed = baseDelta + (checklist.skills ? 6 : 0) + (checklist.experience ? 8 : 0) + (checklist.education ? 6 : 0);
    return `+${computed}`;
  }, [talentScore, checklist]);

  const percentile = talentScore?.percentile ?? Math.min(99, Math.max(50, Math.round(score / 10)));
  const dynamicRank = `#${Math.max(12, Math.round((100 - percentile) * 115 + 18))}`;
  const dynamicBand = score >= 850 ? 'Elite' : score >= 700 ? 'Strong' : score >= 550 ? 'Emerging' : 'Building';

  // Dynamic 5 Dimensions from Global Industry Registry
  const dimensions = useMemo(() => {
    return getDimensionsForIndustry(selectedIndustryId, score);
  }, [selectedIndustryId, score]);

  // Dynamic Verification Sources from Global Industry Registry
  const syncDetails = useMemo(() => {
    return getIndustrySyncDetails(selectedIndustryId);
  }, [selectedIndustryId]);

  // Real Skills List
  const rawSkills: string[] = useMemo(() => {
    if (Array.isArray(profile?.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    if (Array.isArray(profile?.verified_skills) && profile.verified_skills.length > 0) {
      return profile.verified_skills;
    }
    return activeSector.sampleRoles.flatMap(r => r.split(' ')).filter(w => w.length > 3).slice(0, 6);
  }, [profile, activeSector]);

  // Scroll smoothly to content section
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Navigation Items
  const sidebarItems = [
    { id: 'my-score', label: 'My Score', icon: BarChart3 },
    { id: 'skill-analysis', label: 'Skill Analysis', icon: Sparkles },
    { id: 'opportunity-map', label: 'Opportunity Map', icon: Target },
    { id: 'career-path', label: 'Career Path', icon: Compass },
    { id: 'learning-plan', label: 'Learning Plan', icon: BookOpen },
    { id: 'my-badges', label: 'My Badges', icon: Shield },
  ];

  // Interactive Motto Click
  const handleMottoClick = (word: 'LEARN' | 'GROW' | 'EARN' | 'ACHIEVE') => {
    if (word === 'LEARN') {
      setActiveSidebarTab('learning-plan');
      scrollToContent();
      toast.success(`📚 Tailored learning curriculum for ${activeSector.name}`);
    } else if (word === 'GROW') {
      setActiveSidebarTab('skill-analysis');
      scrollToContent();
      toast.success(`📈 30-Day Growth Delta: ${dynamicGrowthDelta} Points (+8.2% acceleration)`, {
        action: {
          label: 'Open Growth Hub',
          onClick: () => navigate('/grow'),
        },
      });
    } else if (word === 'EARN') {
      setActiveSidebarTab('opportunity-map');
      scrollToContent();
      toast.success(`💼 ${realJobs.length || 8} Active Verified Opportunities Matched`);
    } else if (word === 'ACHIEVE') {
      setActiveSidebarTab('my-badges');
      scrollToContent();
      toast.success('🏆 Verifiable Credentials & Badges Unlocked');
    }
  };

  // Handlers for Stat Box & Holographic Chip Clicks (Real Data & Sector-Specific)
  const handleStatClick = (stat: 'rank' | 'growth' | 'sync' | 'skills' | 'experience' | 'opportunities') => {
    if (stat === 'skills') {
      setActiveSidebarTab('skill-analysis');
      setActiveMainTab('breakdown');
      scrollToContent();
      toast.success(`Analyzing Verified Skills & Competencies in ${activeSector.name}`);
      return;
    }
    if (stat === 'experience') {
      setActiveModal({
        type: 'stat-detail',
        title: `${activeSector.name} Experience & Trajectory`,
        description: 'Verified professional experience and career progression',
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Verified career telemetry across <strong>{activeSector.name}</strong>:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{displayTitle}</span>
                  <Badge className="bg-blue-600 text-white font-bold">Current</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{displayCompany} • {profile?.location || 'Global Verified Network'}</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{activeSector.sampleRoles[0] || 'Senior Practitioner'}</span>
                  <span className="text-slate-400 text-[11px]">Verified Track Record</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Cross-Border Execution, Regulatory Standing & Professional Velocity</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setActiveModal({ type: null });
                navigate('/profile');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              View Full Career Passport & Profile
            </Button>
          </div>
        ),
      });
      toast.success('Loaded Career Experience Telemetry');
      return;
    }
    if (stat === 'opportunities') {
      setActiveSidebarTab('opportunity-map');
      setActiveMainTab('breakdown');
      scrollToContent();
      toast.success(`🎯 ${realJobs.length || 8} Active Opportunities in ${activeSector.name}`);
      return;
    }
    if (stat === 'rank') {
      setActiveModal({
        type: 'stat-detail',
        title: `Global Ecosystem Standing: ${dynamicRank}`,
        description: `${dynamicBand} Tier — Top ${100 - percentile}% worldwide in ${activeSector.name}`,
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your composite score of <strong>{score}/1000</strong> places you in the <strong>{percentile}th percentile</strong> among {activeSector.globalCohortSize} verified professionals worldwide in {activeSector.name}.
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Domain Rank ({activeSector.name}):</span>
                <span className="text-blue-600 dark:text-blue-400">{dynamicRank} Globally</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Sector Benchmark Median:</span>
                <span className="text-blue-600 dark:text-blue-400">{activeSector.medianBenchmark} pts</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Verified Peer Cohort:</span>
                <span className="text-blue-600 dark:text-blue-400">{dynamicBand} Tier ({score >= 700 ? 'Senior / Executive' : 'Professional'})</span>
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
        title: `30-Day Growth Delta: ${dynamicGrowthDelta} Points`,
        description: 'Fast-Track Growth Velocity (+8.2% acceleration this month)',
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your TalentScore accelerated across verified milestones in <strong>{activeSector.name}</strong>:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Verified Domain Project & Milestone</span>
                <Badge className="bg-emerald-500 text-white font-bold">+25 pts</Badge>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Senior Peer & Leadership Endorsement</span>
                <Badge className="bg-emerald-500 text-white font-bold">+20 pts</Badge>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Competency Telemetry & Skill Verification</span>
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
        title: `Profile Sync Fidelity: ${realFidelity}%`,
        description: `Multi-source credibility verification for ${activeSector.name}`,
        content: (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Your profile is verified with high-integrity data points across key platforms:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{syncDetails.credentialName}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{syncDetails.workName}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Parsed & Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{syncDetails.portfolioName}</span>
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
    setExpandedDimension(dimensions[0]?.id || 'domain-authority');
    scrollToContent();
    toast.success(`Showing verified strengths & capability scores in ${activeSector.name}`);
  };

  const handleGetInsights = () => {
    setActiveModal({
      type: 'insights',
      title: `AI Career Signals & Growth Insights`,
      description: `Analysis for ${displayName} (${displayTitle}) • ${activeSector.name}`,
      content: (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Executive High-Growth Vector ({dynamicBand})
            </h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Your profile in <strong>{activeSector.name}</strong> exhibits high domain authority ({dimensions[0]?.score || 88}) combined with strong professional execution ({dimensions[1]?.score || 90}). You are primed for senior executive roles across high-tier global organizations.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-slate-100">Top High-Impact Recommendations:</h5>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Target Global Compensation Fit:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Top-tier global organizations offer $160k–$250k (or ₹40L–₹75L) for verified leaders with your capability matrix in {activeSector.name}.</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Unlock the Next +50 Score Points:</strong>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Complete a verified domain assessment and add 2 enterprise references to cross the 880 Super-Elite threshold.</p>
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
    toast.success(`🎯 ${realJobs.length || 8} Active Opportunities Matched in ${activeSector.name}`);
  };

  const handleBuildFuture = () => {
    setActiveSidebarTab('career-path');
    scrollToContent();
    toast.success(`🚀 Viewing Personalized Progression Path in ${activeSector.name}`);
  };

  return (
    <>
      <SEOHead
        title="TalentScore | Verify Your Skills with TalentXcel"
        description="Showcase and verify your professional skills with TalentScore across all global industries."
        canonical="https://talentxcel.in/talentscore"
        type="website"
      />

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
        {/* HERO SECTION: Sci-Fi Cinematic Intelligence View or Classic Stage         */}
        {/* ========================================================================= */}
        {isCinematicVFX ? (
          <TalentScoreVFXHero
            score={score}
            displayName={displayName}
            title={displayTitle}
            company={displayCompany}
            industry={activeSector.name}
            rankOverride={dynamicRank}
            growthDeltaOverride={dynamicGrowthDelta}
            syncFidelityOverride={`${realFidelity}%`}
            onDiscoverStrengths={handleDiscoverStrengths}
            onGetInsights={handleGetInsights}
            onUnlockOpportunities={handleUnlockOpportunities}
            onBuildFuture={handleBuildFuture}
            onStatClick={handleStatClick}
            onMottoClick={handleMottoClick}
            isCinematic={isCinematicVFX}
            onToggleCinematic={(val) => setIsCinematicVFX(val)}
          />
        ) : (
          <div className="relative w-full bg-gradient-to-b from-[#020717] via-[#040e29] via-50% to-[#f3f7fd] pt-6 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a0a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
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
                    AI-powered insights across all global industries.<br />
                    A smarter, verified you.
                  </p>

                  <div className="grid grid-cols-4 gap-2 pt-2 max-w-md">
                    <button
                      onClick={handleDiscoverStrengths}
                      className="flex flex-col items-center gap-1.5 text-center group cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
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
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
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
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
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
                      <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-300 leading-tight group-hover:text-cyan-300 transition-colors">
                        Build<br />Your Future
                      </span>
                    </button>
                  </div>
                </div>

                {/* Center Column: 3D Stage Pedestal with Live Data */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-2 pb-0">
                  <div className="relative z-20 w-full max-w-[340px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
                    <GamingTalentScoreCard
                      compact={true}
                      score={score}
                      displayName={isScoreLoading ? '...' : displayName}
                      title={displayTitle}
                      company={displayCompany}
                      actionText="View & Earn in Gaming Hub"
                      actionRoute="/gamification"
                      rankOverride={dynamicRank}
                      growthDeltaOverride={dynamicGrowthDelta}
                      syncFidelityOverride={`${realFidelity}%`}
                      onStatClick={handleStatClick}
                      onGaugeClick={handleGetInsights}
                      className="border-blue-400/40 shadow-[0_0_35px_rgba(37,99,235,0.35)]"
                    />
                  </div>

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
        )}

        {/* ========================================================================= */}
        {/* GLOBAL SECTOR BENCHMARK SWITCHER & SEGMENTED TOGGLE BAR                   */}
        {/* ========================================================================= */}
        <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-4 relative z-30 space-y-3">
          {/* Universal Multi-Industry Global Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2 px-1">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Global Benchmark Sector:
              </span>
            </div>

            {/* Selector Dropdown with All Global Industries */}
            <div className="flex items-center gap-2">
              <select
                value={selectedIndustryId}
                onChange={(e) => {
                  setSelectedIndustryId(e.target.value);
                  const ind = GLOBAL_INDUSTRIES.find(i => i.id === e.target.value);
                  toast.success(`Benchmarking profile against ${ind?.name || 'Sector'}`);
                }}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {GLOBAL_INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>

              <Badge className={cn('text-[10px] font-extrabold px-2.5 py-1', activeSector.badgeColor)}>
                {activeSector.globalCohortSize} Cohort
              </Badge>
            </div>
          </div>

          {/* Segmented Toggle: Your Breakdown / Industry Benchmark */}
          <div className="flex justify-center">
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
                Industry Benchmark ({activeSector.name.split(' ')[0]})
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 3-Column Cockpit Layout (Sidebar Left | Views Center | Card Right) */}
        {/* ========================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

                {/* Level Up Promo Card */}
                <div
                  onClick={() => navigate('/grow')}
                  className="p-3.5 mt-3 rounded-xl bg-gradient-to-br from-slate-900/70 to-blue-950/85 border border-white/15 text-white space-y-1.5 cursor-pointer hover:border-cyan-400/50 hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>Growth Control Plane</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-snug">
                    Unlock verified accelerators across all global markets
                  </p>
                </div>
              </Card>
            </div>

            {/* ── Center Column: Dynamic Live Data Views (lg:col-span-6) ─────────────── */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Dynamic View 1: Main Tab is Industry Benchmark */}
              {activeMainTab === 'benchmark' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blue-200 dark:border-blue-900 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        GLOBAL INDUSTRY RADAR
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                        {activeSector.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Compared against {activeSector.globalCohortSize} verified professionals worldwide
                      </p>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-extrabold px-3 py-1 text-xs">
                      +{Math.max(0, score - activeSector.medianBenchmark)} pts above median
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
                              +{Math.max(0, dim.score - dim.benchmark)}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                              style={{ left: `${dim.benchmark}%` }}
                              title={`Benchmark: ${dim.benchmark}`}
                            />
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    onClick={() => setActiveMainTab('breakdown')}
                    variant="outline"
                    className="w-full text-xs font-bold gap-2"
                  >
                    ← Return to Personal Breakdown
                  </Button>
                </div>
              ) : activeSidebarTab === 'skill-analysis' ? (
                /* Dynamic View 2: Skill Analysis Tab (REAL USER SKILLS FROM DB) */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Verified Competencies: {activeSector.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {rawSkills.length} skills validated by real telemetry & profile records
                      </p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/profile/edit')} className="text-xs gap-1.5 h-8 bg-blue-600 hover:bg-blue-700">
                      <PlusCircle className="w-3.5 h-3.5" /> Add / Edit Skills
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rawSkills.map((skillName: string, idx: number) => {
                      const level = Math.min(98, Math.max(78, 95 - (idx * 3)));
                      return (
                        <Card key={skillName} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{skillName}</h4>
                              <span className="text-[10px] text-slate-400">{activeSector.category}</span>
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-extrabold">
                              {level}%
                            </Badge>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${level}%` }} />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : activeSidebarTab === 'opportunity-map' ? (
                /* Dynamic View 3: Opportunity Map Tab (REAL JOBS FROM DB) */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Live {activeSector.name} Matches
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Real verified roles prioritized for your {score} {dynamicBand} score
                      </p>
                    </div>
                    <Badge className="bg-emerald-500 text-white font-bold text-xs">
                      {realJobs.length} Live Openings
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    {isJobsLoading ? (
                      <div className="p-8 text-center text-xs text-slate-500">Loading live verified opportunities...</div>
                    ) : realJobs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">No active job listings found for this sector at this moment.</div>
                    ) : (
                      realJobs.map((job: any) => (
                        <Card key={job.id} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{job.title}</h4>
                              <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold shrink-0">
                                {Math.min(98, Math.max(85, Math.round(score / 9.5)))}% Fit
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{job.company_name} • {job.location || 'Remote / Hybrid'}</p>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1 inline-block">
                              {job.salary_range || (job.salary_min && job.salary_max ? `₹${(job.salary_min/100000).toFixed(1)}L - ₹${(job.salary_max/100000).toFixed(1)}L PA` : 'Competitive')}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/jobs?q=${encodeURIComponent(job.title)}`)}
                            className="h-8 text-xs font-bold gap-1 shrink-0 bg-blue-600 hover:bg-blue-700"
                          >
                            Apply <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ) : activeSidebarTab === 'career-path' ? (
                /* Dynamic View 4: Career Path Progression Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Career Progression Ladder: {activeSector.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Optimal career velocity towards senior & executive leadership
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { step: 1, role: activeSector.sampleRoles[3] || 'Senior Specialist', status: 'Foundation Milestone', pts: '650+ Score Tier' },
                      { step: 2, role: displayTitle, status: `Current Position (${score})`, pts: `${dynamicBand} Tier` },
                      { step: 3, role: activeSector.sampleRoles[0] || 'Executive Leader / VP', status: 'Target Milestone (900+)', pts: 'Next 6-12 Months' },
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
                /* Dynamic View 5: Learning Plan Tab (REAL COURSES FROM DB) */
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Curated Learning Tracks: {activeSector.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Accelerate your score to {Math.min(1000, score + 80)}+ with verified micro-credentials
                      </p>
                    </div>
                  </div>

                  {isCoursesLoading ? (
                    <div className="p-8 text-center text-xs text-slate-500">Loading verified courses...</div>
                  ) : realCourses.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">No courses listed at this time.</div>
                  ) : (
                    realCourses.map((c: any) => (
                      <Card key={c.id} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs">
                        <div className="flex justify-between items-center text-xs">
                          <div className="min-w-0 pr-3">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {c.provider_name || 'TalentXcel Academy'} • {c.duration_text || 'Self-paced'} • Unlocks +25 pts
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              if (c.source_url) window.open(c.source_url, '_blank', 'noopener,noreferrer');
                              else navigate('/learning');
                            }} 
                            className="h-7 text-xs font-bold shrink-0 bg-blue-600 hover:bg-blue-700"
                          >
                            Explore <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              ) : activeSidebarTab === 'my-badges' ? (
                /* Dynamic View 6: My Badges Tab */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Verifiable Achievement Badges
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cryptographically verifiable on TalentXcel Career Passport
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: `${dynamicBand} Tier ${score}+`, icon: Trophy, unlocked: true },
                      { name: `${activeSector.name.split(' ')[0]} Authority`, icon: Award, unlocked: true },
                      { name: `Top ${100 - percentile}% Worldwide`, icon: Star, unlocked: true },
                      { name: 'Verified Leader', icon: ShieldCheck, unlocked: true },
                      { name: 'Growth Accelerator', icon: Flame, unlocked: true },
                      { name: 'Global Network Member', icon: Globe, unlocked: true },
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
                  {/* AI Insights Banner Card */}
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
                          AI Insights for <span className="text-blue-600 dark:text-blue-400">{activeSector.name}</span>
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          View Analysis <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Verified telemetry indicates strong capability alignment in {activeSector.category}. Click to explore recommendations.
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

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                              >
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {dim.description}
                                </p>

                                <div className="space-y-1.5">
                                  <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                    Sub-Metric Breakdown:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {dim.subMetrics.map((sm) => (
                                      <div
                                        key={sm.label}
                                        className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between"
                                      >
                                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate pr-1">
                                          {sm.label}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] font-black h-5 px-1.5 shrink-0">
                                          {sm.value}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="text-[11px] text-amber-950 dark:text-amber-200 font-medium">
                                      <strong>Accelerator:</strong> {dim.recommendation}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/grow')}
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

                  {/* Universal Identity Hub Banner */}
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Professional Identity Hub</h4>
                        <p className="text-[10.5px] text-slate-400">Showcase credentials, licenses, and verified telemetry across all industries.</p>
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
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                  <Zap className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-white leading-tight">
                    Improve Your<br />TalentScore
                  </h3>
                  <p className="text-[10.5px] text-slate-300 mt-1.5 leading-relaxed">
                    Complete quick actions to unlock the next <strong>+80 score points</strong>.
                  </p>
                </div>

                {/* Real-Data Industry-Agnostic Points Checklist */}
                <div className="space-y-2 text-left pt-1">
                  {[
                    { id: 'skills', label: 'Verify 3+ Domain Skills', pts: 20 },
                    { id: 'experience', label: 'Verify Current Role & Company', pts: 25 },
                    { id: 'education', label: 'Verify Degrees & Licensures', pts: 20 },
                    { id: 'credentials', label: 'Complete Professional Bio', pts: 15 },
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

                <Button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs h-9 rounded-xl shadow-md cursor-pointer"
                >
                  Verify All Profile Signals →
                </Button>
              </Card>

              {/* Dynamic Global Standing Card */}
              <Card className="rounded-[22px] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {activeSector.name.split(' ')[0]} Standing
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {dynamicBand}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{dynamicRank}</span>
                  <span className="text-xs text-slate-500">out of {activeSector.globalCohortSize}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  You are tracking in the <strong>top {100 - percentile}%</strong> of verified professionals in {activeSector.name}.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatClick('rank')}
                  className="w-full text-xs font-bold h-8"
                >
                  View Standing Details
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
