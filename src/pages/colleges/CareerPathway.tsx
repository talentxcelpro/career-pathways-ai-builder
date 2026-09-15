// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — CareerPathway.tsx
// THE STAR feature: 3-step wizard → AI-generated education pathway
// Aligned to 3-column platform architecture matching /colleges & /learning
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import {
  Brain,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  School,
  ChevronRight,
  ShieldCheck,
  Building2,
  Rocket,
  Zap,
  Crown,
  CheckCircle2,
  Compass,
  Globe,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generatePathway } from '@/services/globalEducationService';
import type {
  PathwayInput,
  EducationPathway,
  CurrentLevel,
  EducationBudget,
} from '@/types/globalEducation';

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const EXAMPLE_GOALS = [
  'AI Researcher',
  'Doctor / Medicine',
  'Software Engineer',
  'Data Scientist',
  'Cybersecurity Specialist',
  'Financial Analyst',
  'UI/UX Designer',
  'Management Consultant',
];

type LevelOption = {
  value: CurrentLevel;
  label: string;
  descriptor: string;
  icon: React.ReactNode;
};

const CURRENT_LEVEL_OPTIONS: LevelOption[] = [
  {
    value: '10th',
    label: '10th Grade',
    descriptor: 'Currently in secondary school',
    icon: <School className="h-6 w-6 text-indigo-600" />,
  },
  {
    value: '12th',
    label: '12th Grade',
    descriptor: 'Completed or currently in higher secondary',
    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
  },
  {
    value: 'bachelor',
    label: "Bachelor's Degree",
    descriptor: 'Graduated or enrolled in undergraduate',
    icon: <GraduationCap className="h-6 w-6 text-emerald-600" />,
  },
  {
    value: 'master',
    label: "Master's Degree",
    descriptor: 'Completed or pursuing postgraduate studies',
    icon: <Award className="h-6 w-6 text-purple-600" />,
  },
  {
    value: 'working',
    label: 'Working Professional',
    descriptor: 'Currently employed, seeking career advancement',
    icon: <Briefcase className="h-6 w-6 text-amber-600" />,
  },
];

type BudgetOption = {
  value: EducationBudget;
  label: string;
  descriptor: string;
  highlight?: string;
};

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    value: 'ZERO',
    label: '₹0 (Zero Cost)',
    descriptor: 'Find fully funded degrees & 100% scholarships',
    highlight: 'Tuition-Free & Stipends',
  },
  {
    value: 'UNDER_50K',
    label: 'Under ₹50,000',
    descriptor: 'Low-cost domestic programs with scholarship aid',
  },
  {
    value: 'UNDER_2L',
    label: '₹50K – ₹2 Lakh',
    descriptor: 'Affordable public universities in Europe & India',
  },
  {
    value: 'FLEXIBLE',
    label: 'Flexible / All Options',
    descriptor: 'Show all global and national options regardless of cost',
  },
];

const STEP_ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-5 w-5 text-indigo-600" />,
  BookOpen: <BookOpen className="h-5 w-5 text-blue-600" />,
  GraduationCap: <GraduationCap className="h-5 w-5 text-emerald-600" />,
  DollarSign: <DollarSign className="h-5 w-5 text-purple-600" />,
  FileText: <FileText className="h-5 w-5 text-amber-600" />,
  TrendingUp: <TrendingUp className="h-5 w-5 text-rose-600" />,
};

function ItemTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    course: { label: 'Foundation Course (₹0 Audit)', className: 'bg-sky-100 text-sky-800 border-sky-200' },
    program: { label: 'Degree Program (Accredited)', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    scholarship: { label: 'Scholarship & Funding', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    exam: { label: 'Standardized Exam', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    action: { label: 'Milestone Action', className: 'bg-slate-100 text-slate-800 border-slate-200' },
  };

  const config = configs[type] ?? { label: type, className: 'bg-slate-100 text-slate-700' };

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function CareerPathway() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goal, setGoal] = useState('');
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel | null>('12th');
  const [budget, setBudget] = useState<EducationBudget | null>('ZERO');
  const [pathway, setPathway] = useState<EducationPathway | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // User Profile
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
    title: profile?.headline || profile?.title || 'Pathway Aspirant',
    location: profile?.location || 'India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (profile || user) {
      const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'TalentXcel Student';
      const title = profile?.headline || profile?.title || 'Pathway Aspirant';
      const location = profile?.location || 'India';
      const avatar = profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png';
      setUserInfo({
        full_name: fullName,
        title: title,
        location: location,
        avatarUrl: avatar,
        coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
    }
  }, [profile, user]);

  const handleGenerate = async () => {
    if (!currentLevel || !budget || !goal.trim()) return;

    setIsGenerating(true);
    try {
      const input: PathwayInput = {
        goal,
        current_level: currentLevel,
        budget,
      };
      const result = await generatePathway(input);
      setPathway(result);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Pathway generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setGoal('');
    setCurrentLevel('12th');
    setBudget('ZERO');
    setPathway(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. SUB-HEADER PILL NAVIGATION BAR                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'All Higher Ed', path: '/colleges', icon: BookOpen },
            { label: 'Universities', path: '/colleges', icon: GraduationCap },
            { label: 'Colleges', path: '/colleges', icon: Building2 },
            { label: 'Premier Institutes', path: '/colleges', icon: Zap },
            { label: 'Global Degrees', path: '/colleges/global-programs', icon: Globe },
            { label: 'Scholarships', path: '/colleges/scholarships', icon: Award },
            { label: 'Career Pathway', path: '/colleges/pathway', icon: Rocket, active: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.active;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. 3-COLUMN MAIN PLATFORM LAYOUT                                          */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (3 cols): USER PROFILE & WIZARD STEPS ───────────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User Profile Card */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden text-center">
            <div
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${userInfo.coverUrl})` }}
            >
              <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>

            <CardContent className="px-5 pb-6 pt-0 relative space-y-4">
              <div
                onClick={() => navigate('/profile')}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-card bg-white mx-auto -mt-10 overflow-hidden shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={userInfo.avatarUrl}
                  alt={userInfo.full_name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/avatar-placeholder.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-sm font-extrabold text-foreground">{userInfo.full_name}</h3>
                  <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{userInfo.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{userInfo.location}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex-1 rounded-2xl text-xs font-bold border-slate-300 cursor-pointer"
                >
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartOver}
                  className="flex-1 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> New Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wizard Progress Stepper */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Pathway Stepper
            </span>
            <div className="space-y-2 text-xs">
              {[
                { s: 1, title: 'Step 1: Your Goal', desc: goal || 'Not defined yet' },
                { s: 2, title: 'Step 2: Current Level', desc: CURRENT_LEVEL_OPTIONS.find((l) => l.value === currentLevel)?.label || '12th Grade' },
                { s: 3, title: 'Step 3: Education Budget', desc: BUDGET_OPTIONS.find((b) => b.value === budget)?.label || '₹0 (Zero Cost)' },
                { s: 4, title: 'Step 4: AI Plan Generated', desc: pathway ? `${pathway.steps.length} Connected Phases` : 'Pending generation' },
              ].map((item) => (
                <div
                  key={item.s}
                  onClick={() => {
                    if (item.s < step) setStep(item.s as any);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    step === item.s
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold'
                      : step > item.s
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 cursor-pointer'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="block font-extrabold">{item.title}</span>
                    <span className="text-[11px] font-normal truncate block max-w-[180px]">{item.desc}</span>
                  </div>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step > item.s ? 'bg-emerald-600 text-white' : step === item.s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > item.s ? '✓' : item.s}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1">
              EDUCATION DESTINATIONS
            </span>
            <Link
              to="/colleges"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span className="flex items-center gap-2">🇮🇳 Indian Higher Ed (1,509)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/colleges/global-programs"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">🌍 Global €0 Degrees</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/colleges/scholarships"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors"
            >
              <span className="flex items-center gap-2">🎓 Scholarships &amp; Grants</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </Card>
        </div>

        {/* ── CENTER COLUMN (6 cols): STEP WIZARD & AI PATHWAY STREAM ────────── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* STEP 1: GOAL SELECTION */}
          {step === 1 && (
            <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shrink-0">
                      <Rocket className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">AI Education &amp; Career Pathway</h3>
                      <p className="text-xs text-slate-300 font-medium">Tell us what you want to become. We'll sequence the fastest, lowest-cost route.</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Future OS</span>
                  </div>
                </div>

                {/* Input Area */}
                <div className="relative">
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && goal.trim()) setStep(2);
                    }}
                    placeholder='e.g. "I want to become an AI Researcher", "Doctor", "Software Engineer"'
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl pl-4 pr-32 text-sm font-medium focus:bg-white/15 focus:border-blue-400"
                  />

                  <Button
                    onClick={() => {
                      if (goal.trim()) setStep(2);
                    }}
                    disabled={!goal.trim()}
                    size="sm"
                    className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 shadow-sm"
                  >
                    Next Step <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>

                {/* Quick Goal Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Popular Goals:</span>
                  {EXAMPLE_GOALS.map((eg) => (
                    <button
                      key={eg}
                      onClick={() => setGoal(eg)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        goal === eg
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {eg}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: WHERE ARE YOU TODAY */}
          {step === 2 && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Step 2: Where are you right now?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select your academic starting baseline to bridge requirements.</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Target: {goal}
                </span>
              </div>

              <div className="space-y-3">
                {CURRENT_LEVEL_OPTIONS.map((opt) => {
                  const isSelected = currentLevel === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setCurrentLevel(opt.value)}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          {opt.icon}
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 block">{opt.label}</span>
                          <span className="text-xs text-slate-500">{opt.descriptor}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="rounded-xl text-xs font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-5"
                >
                  Next: Budget <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: WHAT IS YOUR BUDGET */}
          {step === 3 && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Step 3: What is your education budget?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">We show REAL verified costs, fully funded options and ₹0 tuition routes.</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  ₹0 Start Capable
                </span>
              </div>

              <div className="space-y-3">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = budget === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setBudget(opt.value)}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{opt.label}</span>
                          {opt.highlight && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {opt.highlight}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">{opt.descriptor}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="rounded-xl text-xs font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-6 shadow-md"
                >
                  {isGenerating ? 'Synthesizing Pathway...' : 'Generate My Pathway →'}
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: AI GENERATED PATHWAY RESULT */}
          {step === 4 && pathway && (
            <div className="space-y-6">
              
              {/* Pathway Summary Hero */}
              <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AI PATHWAY SYNTHESIS COMPLETE
                    </span>
                    <button
                      onClick={handleStartOver}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Start Over
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Career Pathway: {pathway.input.goal}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Baseline: <strong>{CURRENT_LEVEL_OPTIONS.find((l) => l.value === pathway.input.current_level)?.label}</strong> · Budget: <strong>{BUDGET_OPTIONS.find((b) => b.value === pathway.input.budget)?.label}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block uppercase">ESTIMATED COST</span>
                      <span className="font-bold text-emerald-400">{pathway.total_estimated_cost}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block uppercase">TOTAL PHASES</span>
                      <span className="font-bold text-white">{pathway.steps.length} Steps</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block uppercase">MATCHED DEGREES</span>
                      <span className="font-bold text-blue-400">{pathway.matched_programs.length} Programs</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block uppercase">SCHOLARSHIPS</span>
                      <span className="font-bold text-purple-400">{pathway.matched_scholarships.length} Awards</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Connected 6-Phase Journey Feed */}
              <div className="space-y-4">
                {pathway.steps.map((st) => (
                  <Card
                    key={st.step_number}
                    className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4"
                  >
                    {/* Phase Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                          {STEP_ICON_MAP[st.icon] || <Brain className="h-5 w-5 text-indigo-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              PHASE 0{st.step_number}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{st.estimated_duration}</span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 mt-1">
                            {st.title}
                          </h4>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        {st.cost_estimate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {st.description}
                    </p>

                    {/* Phase Items */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {st.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ItemTypeBadge type={item.type} />
                              {item.provider && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Provider: {item.provider}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {item.title}
                            </span>
                            {item.evidence_snippet && (
                              <span className="text-[10px] text-slate-500 italic block">
                                💡 {item.evidence_snippet}
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0 space-y-1">
                            {item.cost && (
                              <span className={`text-[11px] font-mono font-bold block ${item.is_free ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {item.cost}
                              </span>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                              >
                                View Portal <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Honest Caveat Callout */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black">Honest Truth on ₹0 Pathways:</strong>
                  <span>{pathway.honest_caveat}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN (3 cols): PRO ADMISSION & ADVISOR WIDGETS ──────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Pro Subscriber Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                AI Roadmap Pro
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-snug">
                Export Verified PDF Roadmap &amp; Mentorship
              </h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Download your personalized admission timeline, SOP checklists, and direct mentor consultation for ₹0 tuition pathways.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => navigate('/colleges/pathway')}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black h-10 shadow-md cursor-pointer"
            >
              Export AI Pathway <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Popular Pathway Templates */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> Popular Blueprints
            </span>
            <div className="space-y-2 text-xs">
              {[
                { name: 'AI Researcher', route: 'CS Foundation → TUM €0 Degree → DAAD' },
                { name: 'Doctor / Medicine', route: 'NEET UG → AIIMS / EU Medical' },
                { name: 'Software Engineer', route: 'The Odin Project → IIT M.Tech GATE' },
                { name: 'Financial Analyst', route: 'Wharton Free Audit → DAAD Grant' },
                { name: 'Cybersecurity Specialist', route: 'TryHackMe → Darmstadt €0 M.Sc' },
              ].map((bp) => (
                <div
                  key={bp.name}
                  onClick={() => {
                    setGoal(bp.name);
                    setStep(2);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex flex-col gap-0.5 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-slate-900">{bp.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{bp.route}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Explore Other Hubs */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Globe className="w-3.5 h-3.5 text-emerald-600" /> Need Programs or Grants?
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 1,509 verified Indian institutions, 100 global degree programs, and 10+ full funding scholarships.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/colleges')}
                className="text-[11px] font-bold rounded-xl"
              >
                🇮🇳 Colleges
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/colleges/scholarships')}
                className="text-[11px] font-bold rounded-xl"
              >
                🎓 Grants
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
