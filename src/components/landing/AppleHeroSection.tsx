import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Building2, Sparkles, Briefcase, GraduationCap, 
  FileText, ArrowRight, Zap, ShieldCheck, Globe, 
  TrendingUp, Search, FileCheck, Users, BookOpen
} from 'lucide-react';
import { TXCProductVideoModal } from '@/components/video/TXCProductVideoModal';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { recordUserIntent } from '@/utils/intentRouting';

export const AppleHeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState('talentxcel-overview');

  const handleIntentClick = (intent: string, returnUrl: string) => {
    recordUserIntent(intent, returnUrl);
    conversionTelemetry.track('signup_cta_click', { source: `hero_${intent}` });
  };

  return (
    <section aria-label="Hero Section" className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 sm:py-8 lg:py-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[650px] h-[400px] bg-gradient-to-br from-blue-400/15 via-indigo-400/10 to-purple-400/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -left-20 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        
        {/* Top Eyebrow / Tagline Row matching Image 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>TalentXcel SI — Super Intelligence for Careers &amp; Hiring</span>
          </div>
          
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
            YOUR SKILLS. GLOBAL OPPORTUNITIES.
          </div>
        </div>

        {/* =========================================================
            PRIMARY HERO GRID: HEADLINE + GLOBAL CHARACTER GRAPHIC
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-10 sm:mb-12">
          
          {/* Left Column: Headline, Subtitle, Highlights */}
          <div className="lg:col-span-6 text-left space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Your Career.<br />
              Your Talent.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                A Global Platform.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Powered by <strong className="font-semibold text-slate-900 dark:text-white">TalentXcel SI</strong> — context-aware career and talent intelligence from profile to placement. Select your goal to get started instantly.
            </p>

            {/* 3 Trust/Feature Badges directly from Image 2 */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <Link 
                to="/jobs"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <span>Global Opportunities</span>
              </Link>

              <Link 
                to="/career-map"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>AI-Powered Career Intelligence</span>
              </Link>

              <Link 
                to="/network"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Trusted by Professionals Worldwide</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Global Hero Graphic with Interactive Hotspot Cards */}
          <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[580px] rounded-2xl overflow-hidden shadow-2xl border border-blue-100/80 dark:border-slate-800 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 group">
              <img 
                src="/hero-character-full.webp" 
                alt="TalentXcel Global Career Platform"
                className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />

              {/* 4 Interactive Hotspots matching Image 2 Floating Cards */}
              <Link 
                to="/jobs"
                title="Jobs Worldwide - Explore active openings across 50+ countries"
                className="absolute left-[66%] top-[19%] w-[32%] h-[15%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Jobs Worldwide"
              />
              <Link 
                to="/recruiters"
                title="Top Recruiters - Connect with 1,000+ verified recruiters"
                className="absolute left-[70%] top-[36%] w-[29%] h-[15%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Top Recruiters"
              />
              <Link 
                to="/career-map"
                title="Career Growth - Discover AI-driven learning and career progression"
                className="absolute left-[72%] top-[53%] w-[27%] h-[15%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Career Growth"
              />
              <Link 
                to="/colleges"
                title="Verified Colleges & Degrees - Explore 2,000+ accredited institutions"
                className="absolute left-[72%] top-[70%] w-[27%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Verified Colleges & Degrees"
              />
            </div>

            {/* Mobile Touch Bar for the 4 Key Portals */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[580px] lg:hidden mt-3 text-left">
              <Link 
                to="/jobs" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Jobs Worldwide</span>
              </Link>
              <Link 
                to="/recruiters" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Top Recruiters</span>
              </Link>
              <Link 
                to="/career-map" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-purple-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-white shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Career Growth</span>
              </Link>
              <Link 
                to="/colleges" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-purple-400 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Verified Colleges</span>
              </Link>
            </div>
          </div>

        </div>

        {/* =========================================================
            3-INTENT ARCHITECTURE: HIGH-CLARITY ENTRY PATHWAYS
            ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-8 sm:mb-10">
          
          {/* Card 1: Job Seekers & Professionals */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-md hover:shadow-xl hover:border-blue-500 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  High Demand
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  I&apos;m Looking for a Job
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Upload your resume for an instant ATS compatibility score, find missing keywords, and match with verified active roles.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
              <Link
                to="/resume/ats-check?intent=resume"
                onClick={() => handleIntentClick('resume', '/resume/ats-check')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Check ATS &amp; Match Score</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* 3 micro-features from Image 2 */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                <Link to="/jobs" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">AI Job Matching</span>
                </Link>
                <Link to="/resume/ats-check" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">ATS Optimized</span>
                </Link>
                <Link to="/jobs" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">500+ Verified Roles</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Employers & Recruiters */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Recruiter OS
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  I&apos;m Hiring Talent
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Source pre-vetted candidates with context-aware SI matching. Cut screening cycles by up to 80% with real candidate signals.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
              <Link
                to="/recruiters?intent=hire"
                onClick={() => handleIntentClick('hire', '/recruiters')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Access Recruiter OS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* 3 micro-features from Image 2 */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                <Link to="/auth/register?role=employer&intent=hire" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Post a Job in 2 Min</span>
                </Link>
                <Link to="/talent-database" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Verified Candidates</span>
                </Link>
                <Link to="/recruiters" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">AI Screening</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Career Growth & Education */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 shadow-md hover:shadow-xl hover:border-purple-500 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Career Pathways
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  I&apos;m Building My Career
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Map market skill gaps to structured learning pathways, discover accredited colleges, and build your verified Career Passport.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
              <Link
                to="/career-map?intent=career"
                onClick={() => handleIntentClick('career', '/career-map')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
              >
                <span>Generate Career Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* 3 micro-features from Image 2 */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-1">
                <Link to="/career-map" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Skill Gap Analysis</span>
                </Link>
                <Link to="/colleges" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Verified Colleges</span>
                </Link>
                <Link to="/career-insights" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">AI Career Guidance</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================
            BOTTOM STATS & INFINITE OPPORTUNITIES TRUST BAR
            ========================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 md:gap-10">
            {/* Stat 1 */}
            <Link to="/talent-database" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">100K+</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Professionals</div>
              </div>
            </Link>

            {/* Stat 2 */}
            <Link to="/jobs" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">500+</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Verified Jobs</div>
              </div>
            </Link>

            {/* Stat 3 */}
            <Link to="/recruiters" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">1,000+</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Global Recruiters</div>
              </div>
            </Link>

            {/* Stat 4 */}
            <Link to="/colleges" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">2,000+</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Colleges &amp; Courses</div>
              </div>
            </Link>

            {/* Stat 5 */}
            <Link to="/jobs" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">50+</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Countries</div>
              </div>
            </Link>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveVideoId('talentxcel-overview');
                setIsVideoModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Watch 1-Minute Platform Overview"
            >
              <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
              <span className="hidden sm:inline">Watch Overview</span>
            </button>

            <Link
              to="/auth/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs hover:border-purple-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>One Platform. Infinite Opportunities.</span>
            </Link>
          </div>

        </div>

      </div>

      <TXCProductVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        initialVideoId={activeVideoId}
      />
    </section>
  );
};
