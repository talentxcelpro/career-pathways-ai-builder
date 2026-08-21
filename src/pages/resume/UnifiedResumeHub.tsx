import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Upload,
  Sparkles,
  Target,
  BarChart3,
  Mail,
  Video,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Brain,
  Layers,
  Briefcase,
  Check,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function UnifiedResumeHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Search & Target Role State
  const [targetRole, setTargetRole] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Builder' | 'ATS' | 'Templates' | 'CoverLetter' | 'Interview' | 'Passport'>('All');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState<'all' | 'ats' | 'tech' | 'executive' | 'creative'>('all');

  // User Profile Data
  const userInfo = {
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'TalentXcel Candidate',
    title: profile?.headline || profile?.title || 'Software Engineer & AI Builder',
    location: profile?.location || 'Bengaluru, India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || 'https://chatr.chat/assets/img/logo.png',
    coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  };

  const handleTailorSubmit = () => {
    if (!targetRole.trim()) {
      navigate('/resume/build');
      return;
    }
    toast.success(`Target role set to "${targetRole}". Initializing AI Resume Tailor...`);
    navigate(`/resume/build?target=${encodeURIComponent(targetRole)}`);
  };

  const handlePillNav = (tab: 'All' | 'Builder' | 'ATS' | 'Templates' | 'CoverLetter' | 'Interview' | 'Passport') => {
    setActiveTab(tab);
    if (tab === 'Builder') navigate('/resume/build');
    else if (tab === 'ATS') navigate('/resume/ats-check');
    else if (tab === 'Templates') navigate('/resume/templates');
    else if (tab === 'CoverLetter') navigate('/resume/cover-letter');
    else if (tab === 'Interview') navigate('/resume/interview-prep');
    else if (tab === 'Passport') navigate('/passport');
  };

  // Executive Template Showcase Data
  const templates = [
    {
      id: 'harvard-executive',
      title: 'Harvard Classic Executive',
      category: 'executive',
      badge: '99% ATS Pass',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'Single-column rigorous typography prioritized by Fortune 500 recruiters.',
      accent: '#0f172a',
      downloads: '14.2k uses',
    },
    {
      id: 'silicon-modern',
      title: 'Silicon Valley Modern Tech',
      category: 'tech',
      badge: 'YC & Tier-1 Tech',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      description: 'Clean metric-driven project blocks optimized for Engineering & Product.',
      accent: '#2563eb',
      downloads: '18.9k uses',
    },
    {
      id: 'minimal-slate',
      title: 'Minimalist ATS Scanner',
      category: 'ats',
      badge: 'Zero Parsing Errors',
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      description: 'Ultra-high scannability score guaranteed across Greenhouse, Lever & Workday.',
      accent: '#475569',
      downloads: '9.8k uses',
    },
    {
      id: 'creative-lead',
      title: 'Design & Creative Lead',
      category: 'creative',
      badge: 'Visual Hierarchy',
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      description: 'Sophisticated dual-column palette for UI/UX, Marketing & Creative Directors.',
      accent: '#7c3aed',
      downloads: '7.4k uses',
    }
  ];

  const filteredTemplates = selectedTemplateFilter === 'all'
    ? templates
    : templates.filter(t => t.category === selectedTemplateFilter);

  // 6 Core Power Tools
  const coreTools = [
    {
      icon: Target,
      title: 'ATS Scanner & Scorer',
      description: 'Benchmark against 10M+ job descriptions and check your ATS match rate.',
      badge: 'AI Diagnostic',
      path: '/resume/ats-check',
      accentBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
    },
    {
      icon: Mail,
      title: 'AI Cover Letter Studio',
      description: 'Generate high-conversion cover letters tailored to your target company.',
      badge: '1-Click Match',
      path: '/resume/cover-letter',
      accentBg: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
    },
    {
      icon: Video,
      title: 'AI Interview Coach',
      description: 'Practice real-time technical & behavioral questions with instant AI feedback.',
      badge: 'Live Simulation',
      path: '/resume/interview-prep',
      accentBg: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
    },
    {
      icon: Globe,
      title: 'Web Portfolio Generator',
      description: 'Turn your resume into a hosted personal developer portfolio in 10 seconds.',
      badge: 'Custom URL',
      path: '/resume/portfolio',
      accentBg: 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300'
    },
    {
      icon: BarChart3,
      title: 'Resume Performance Analytics',
      description: 'Track recruiter views, downloads, search appearances, and interview invites.',
      badge: 'Telemetry',
      path: '/resume/analytics',
      accentBg: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
    },
    {
      icon: FileText,
      title: 'My Saved Resumes & Versions',
      description: 'Manage specialized resume variants tailored for different industry roles.',
      badge: 'Cloud Sync',
      path: '/resume/dashboard',
      accentBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Resume Command Center | TalentXcel</title>
        <meta name="description" content="Build, score, and ATS-optimize executive resumes with AI assistance. Access 50+ templates, instant parsing, and interview coaching." />
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>

      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
        
        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 1. TOP SUB-HEADER PILL NAVIGATION BAR                                      */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
            {[
              { label: 'Resume Command Center', id: 'All', icon: Sparkles, badge: 'Hub' },
              { label: 'AI Resume Builder', id: 'Builder', icon: Brain, badge: 'Active' },
              { label: 'ATS Scanner', id: 'ATS', icon: Target, badge: '98% Pass' },
              { label: '50+ Templates', id: 'Templates', icon: Layers, badge: 'Pro' },
              { label: 'Cover Letter Studio', id: 'CoverLetter', icon: Mail, badge: null },
              { label: 'AI Interview Coach', id: 'Interview', icon: Video, badge: 'New' },
              { label: 'Career Passport', id: 'Passport', icon: ShieldCheck, badge: 'Sync' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handlePillNav(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 2. 3-COLUMN MAIN PLATFORM ARCHITECTURE (3 - 6 - 3 GRID)                  */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN (3 cols): PROFILE & ATS READINESS SCORE CARD ───────── */}
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
                      (e.target as HTMLImageElement).src = 'https://chatr.chat/assets/img/logo.png';
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
                  <p className="text-xs text-muted-foreground font-semibold line-clamp-1">{userInfo.title}</p>
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
                    onClick={() => navigate('/resume/build')}
                    className="flex-1 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> New Resume
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ATS Readiness Health Meter */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" /> ATS Health Score
                </span>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* Circular Meter Simulation */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center space-y-2">
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  88<span className="text-emerald-600 text-lg">/100</span>
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  High ATS Compatibility
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full w-[88%] rounded-full"></div>
                </div>
              </div>

              {/* Key Diagnostic Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Header &amp; Contact Structure</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Action-Verb Bullet Impact</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">92%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Target Keyword Match</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">78%</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/resume/ats-check')}
                className="w-full rounded-2xl text-xs font-bold border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer"
              >
                Scan Target Job Description →
              </Button>
            </Card>

            {/* Quick Resume Resources */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-2 pb-1">
                Executive Ecosystem
              </span>
              <Link
                to="/resume/templates"
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">📄 50+ Verified Templates</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/resume/cover-letter"
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
              >
                <span className="flex items-center gap-2">✉️ AI Cover Letter Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/passport"
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              >
                <span className="flex items-center gap-2">🛡️ Career Passport Sync</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </Card>
          </div>

          {/* ── CENTER COLUMN (6 cols): AI RESUME COMMAND ENGINE & CORE WORKFLOW ── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* EXECUTIVE DARK NAVY COMMAND HERO */}
            <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shrink-0">
                      <Brain className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          TALENTXCEL AI RESUME COMMAND CENTER · READY
                        </span>
                      </div>
                      <h3 className="text-xl font-black !text-white mt-1" style={{ color: '#ffffff' }}>
                        Build &amp; ATS-Optimize Your Executive Resume.
                      </h3>
                      <p className="text-xs !text-slate-300 font-medium mt-0.5" style={{ color: '#cbd5e1' }}>
                        Inject target keywords, benchmark against 10M+ job postings, and pass ATS screening in 3 seconds.
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-xs font-bold shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>ATS 99.4% Verified</span>
                  </div>
                </div>

                {/* Conversational Tailoring Bar */}
                <div className="relative">
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTailorSubmit()}
                    placeholder='Type target role (e.g. "Senior Full-Stack Engineer", "Product Lead at Google", "Financial Analyst")...'
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl pl-4 pr-36 text-sm font-medium focus:bg-white/15 focus:border-blue-400"
                  />

                  <Button
                    onClick={handleTailorSubmit}
                    size="sm"
                    className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 shadow-sm cursor-pointer"
                  >
                    Tailor AI Plan <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>

                {/* Quick Examples */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">QUICK EXAMPLES:</span>
                  {[
                    'Senior React Engineer',
                    'Product Manager',
                    'Data Scientist',
                    'Financial Analyst',
                    'DevOps Architect'
                  ].map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setTargetRole(kw)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* ── 2 PRIMARY INTERACTIVE ACTION CARDS (UPLOAD VS FROM SCRATCH) ──── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Instant Upload & Parse */}
              <Card 
                onClick={() => navigate('/resume/upload')}
                className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-full border border-blue-200">
                    Fast Track · 3 Sec
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Upload &amp; Enhance Existing
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Drop your current PDF or DOCX. AI will extract history, score ATS readiness, and rewrite weak bullet points.
                  </p>
                </div>

                <div className="pt-2">
                  <Button className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs h-10 shadow-sm cursor-pointer">
                    Upload Resume (PDF/DOCX) →
                  </Button>
                </div>
              </Card>

              {/* Card 2: AI Guided Builder from Scratch */}
              <Card 
                onClick={() => navigate('/resume/build')}
                className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full border border-purple-200">
                    Most Popular
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                    Build from Scratch with AI
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Step-by-step intelligent wizard with 500+ pre-approved executive phrases and live side-by-side formatting.
                  </p>
                </div>

                <div className="pt-2">
                  <Button className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-10 shadow-sm cursor-pointer">
                    Launch AI Studio →
                  </Button>
                </div>
              </Card>
            </div>

            {/* ── 50+ EXECUTIVE TEMPLATES SHOWCASE ────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> Executive Template Gallery
                  </h3>
                  <p className="text-xs text-slate-500">Recruiter-tested templates engineered for 0% parsing failure.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full text-[11px] font-bold">
                  {(['all', 'ats', 'tech', 'executive', 'creative'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedTemplateFilter(filter)}
                      className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                        selectedTemplateFilter === filter
                          ? 'bg-white dark:bg-card text-blue-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTemplates.map((t) => (
                  <Card
                    key={t.id}
                    onClick={() => navigate(`/resume/build?template=${t.id}`)}
                    className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${t.badgeColor}`}>
                        {t.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{t.downloads}</span>
                    </div>

                    {/* Template Thumbnail Mockup */}
                    <div className="h-28 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 flex flex-col justify-between group-hover:border-blue-300 transition-colors">
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-1/3 rounded-full" style={{ backgroundColor: t.accent }}></div>
                        <div className="h-1.5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-1.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        <div className="h-1.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {t.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ── 6 CORE CAREER POWER TOOLS ───────────────────────────────────── */}
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Career Superpowers Suite
                </h3>
                <p className="text-xs text-slate-500">Comprehensive AI acceleration tools connected to your career passport.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coreTools.map((tool) => (
                  <Card
                    key={tool.title}
                    onClick={() => navigate(tool.path)}
                    className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl border ${tool.accentBg} group-hover:scale-105 transition-transform`}>
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-800">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (3 cols): PRO SUBSCRIPTION & LIVE JOB MATCHES ─────── */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Pro Upgrade Card */}
            <Card className="rounded-3xl border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">
                  PRO SUBSCRIBER
                </span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>

              <div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Fast-Track Recruiter Shortlisting
                </h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Unlock unlimited AI resume tailoring, keyword density injection, and 1-on-1 human recruiter review.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-blue-100">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Unlimited ATS Keyword Injections</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Multi-format PDF &amp; Word Export</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Direct Recruiter Inbox Placement</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/pricing')}
                className="w-full rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs h-10 shadow-md cursor-pointer"
              >
                Upgrade to Pro ($19/mo)
              </Button>
            </Card>

            {/* High-Match Live Job Matches */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Matched to Your Resume
                </span>
                <Link to="/jobs" className="text-[11px] font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { role: 'Senior React Developer', company: 'Google Cloud', match: '96%', salary: '₹28L–₹42L' },
                  { role: 'Full Stack Engineer', company: 'Microsoft', match: '93%', salary: '₹25L–₹38L' },
                  { role: 'AI Platform Specialist', company: 'Stripe', match: '91%', salary: '₹32L–₹50L' },
                ].map((job) => (
                  <div 
                    key={job.role}
                    onClick={() => navigate('/jobs')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{job.role}</span>
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-mono">
                        {job.match}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{job.company}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Resume FAQ / Trust */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Enterprise ATS Certified</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                All TalentXcel templates conform strictly to UTF-8 parse standards used by Workday, Taleo, Greenhouse, and Lever.
              </p>
            </Card>

          </div>

        </div>

      </div>
    </>
  );
}
