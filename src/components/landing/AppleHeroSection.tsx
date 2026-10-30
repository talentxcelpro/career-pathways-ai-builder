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
  const [activeMobileGoal, setActiveMobileGoal] = useState<'job' | 'hire' | 'career'>('job');

  const handleIntentClick = (intent: string, returnUrl: string) => {
    recordUserIntent(intent, returnUrl);
    conversionTelemetry.track('signup_cta_click', { source: `hero_${intent}` });
  };

  return (
    <section aria-label="Hero Section" className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-3 sm:py-6 lg:py-10">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[650px] h-[400px] bg-gradient-to-br from-blue-400/15 via-indigo-400/10 to-purple-400/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -left-20 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full z-10">
        
        {/* Top Eyebrow / Tagline Row - Compact on Mobile */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] sm:text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">TalentXcel SI — Super Intelligence for Careers &amp; Hiring</span>
          </div>
          
          <div className="hidden sm:block text-[11px] sm:text-xs font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
            YOUR SKILLS. GLOBAL OPPORTUNITIES.
          </div>
        </div>

        {/* =========================================================
            PRIMARY HERO GRID: HEADLINE + GLOBAL CHARACTER GRAPHIC
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-center mb-5 sm:mb-10">
          
          {/* Left Column: Headline, Subtitle, Highlights */}
          <div className="lg:col-span-6 text-left space-y-2.5 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Your Career.<br />
              Your Talent.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                A Global Platform.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed max-w-xl">
              Powered by <strong className="font-semibold text-slate-900 dark:text-white">TalentXcel SI</strong> — context-aware career and talent intelligence from profile to placement. Select your goal below to get started instantly.
            </p>

            {/* 3 Trust/Feature Badges (Desktop & Tablet) */}
            <div className="hidden sm:flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
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
                <span>AI Career Intelligence</span>
              </Link>

              <Link 
                to="/network"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Trusted Worldwide</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Global Hero Graphic with Interactive Hotspot Cards */}
          <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[560px] max-h-[165px] sm:max-h-none rounded-2xl overflow-hidden shadow-xl border border-blue-100/90 dark:border-slate-800 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 group">
              <img 
                src="/hero-character-full.webp" 
                alt="TalentXcel Global Career Platform"
                className="w-full h-[165px] sm:h-auto object-cover object-top sm:object-center select-none transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />

              {/* 4 Interactive Desktop Hotspots mapped precisely to glass cards */}
              <Link 
                to="/jobs"
                title="Jobs Worldwide - Explore active openings across 50+ countries"
                className="hidden sm:block absolute left-[60%] top-[18%] w-[29%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Jobs Worldwide"
              />
              <Link 
                to="/recruiters"
                title="Top Recruiters - Connect with 1,000+ verified recruiters"
                className="hidden sm:block absolute left-[63.5%] top-[35%] w-[27.5%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Top Recruiters"
              />
              <Link 
                to="/career-map"
                title="Career Growth - Discover AI-driven learning and career progression"
                className="hidden sm:block absolute left-[67%] top-[52.5%] w-[25%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Career Growth"
              />
              <Link 
                to="/colleges"
                title="Verified Colleges & Degrees - Explore 2,000+ accredited institutions"
                className="hidden sm:block absolute left-[67%] top-[70%] w-[25%] h-[17%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Verified Colleges & Degrees"
              />
            </div>

            {/* Mobile Native App 2x2 Quick-Portal Widget Tiles */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[560px] lg:hidden mt-2 text-left">
              <Link 
                to="/jobs" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-400 active:scale-[0.97] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">Jobs Worldwide</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold truncate">500+ Active Roles</div>
                </div>
              </Link>

              <Link 
                to="/recruiters" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-blue-400 active:scale-[0.97] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">Top Recruiters</div>
                  <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold truncate">1,000+ Verified</div>
                </div>
              </Link>

              <Link 
                to="/career-map" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-purple-400 active:scale-[0.97] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">Career Growth</div>
                  <div className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold truncate">AI Roadmaps</div>
                </div>
              </Link>

              <Link 
                to="/colleges" 
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-purple-400 active:scale-[0.97] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">Colleges &amp; Degrees</div>
                  <div className="text-[9px] text-pink-600 dark:text-pink-400 font-semibold truncate">2,000+ Accredited</div>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* =========================================================
            MOBILE NATIVE APP SEGMENTED GOAL SELECTOR
            (Pulls content right into view without endless scrolling)
            ========================================================= */}
        <div className="md:hidden mb-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-2.5">
            <button
              type="button"
              onClick={() => setActiveMobileGoal('job')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeMobileGoal === 'job'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              💼 Find a Job
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileGoal('hire')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeMobileGoal === 'hire'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🏢 Hire Talent
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileGoal('career')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeMobileGoal === 'career'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🚀 Career Map
            </button>
          </div>

          {/* Active Mobile Intent Card */}
          {activeMobileGoal === 'job' && (
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-300 dark:border-blue-900/80 shadow-md text-left animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">I&apos;m Looking for a Job</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">ATS resume score &amp; matching roles</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  High Demand
                </span>
              </div>
              <Link
                to="/resume/ats-check?intent=resume"
                onClick={() => handleIntentClick('resume', '/resume/ats-check')}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all mb-2"
              >
                <span>Check ATS &amp; Match Score</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                <Link to="/jobs" className="hover:text-blue-600">AI Job Match</Link>
                <span>•</span>
                <Link to="/resume/ats-check" className="hover:text-blue-600">ATS Optimized</Link>
                <span>•</span>
                <Link to="/jobs" className="hover:text-blue-600">500+ Verified Roles</Link>
              </div>
            </div>
          )}

          {activeMobileGoal === 'hire' && (
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-300 dark:border-emerald-900/80 shadow-md text-left animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">I&apos;m Hiring Talent</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Pre-vetted SI candidate signals</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Recruiter OS
                </span>
              </div>
              <Link
                to="/recruiters?intent=hire"
                onClick={() => handleIntentClick('hire', '/recruiters')}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all mb-2"
              >
                <span>Access Recruiter OS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                <Link to="/auth/register?role=employer&intent=hire" className="hover:text-emerald-600">Post in 2 Min</Link>
                <span>•</span>
                <Link to="/talent-database" className="hover:text-emerald-600">Pre-Vetted Pool</Link>
                <span>•</span>
                <Link to="/recruiters" className="hover:text-emerald-600">SI Screening</Link>
              </div>
            </div>
          )}

          {activeMobileGoal === 'career' && (
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-300 dark:border-purple-900/80 shadow-md text-left animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">I&apos;m Building My Career</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">AI skill roadmaps &amp; degree pathways</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Career Pathways
                </span>
              </div>
              <Link
                to="/career-map?intent=career"
                onClick={() => handleIntentClick('career', '/career-map')}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition-all mb-2"
              >
                <span>Generate Career Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                <Link to="/career-map" className="hover:text-purple-600">Skill Gap Map</Link>
                <span>•</span>
                <Link to="/colleges" className="hover:text-purple-600">2,000+ Colleges</Link>
                <span>•</span>
                <Link to="/career-insights" className="hover:text-purple-600">AI Guidance</Link>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            DESKTOP & TABLET: 3-INTENT ARCHITECTURE GRID
            ========================================================= */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 text-left mb-8 sm:mb-10">
          
          {/* Card 1: Job Seekers & Professionals */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300">
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

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <Link
                to="/resume/ats-check?intent=resume"
                onClick={() => handleIntentClick('resume', '/resume/ats-check')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Check ATS &amp; Match Score</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                <Link to="/jobs" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">AI Job Match</span>
                </Link>
                <Link to="/resume/ats-check" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">ATS Optimized</span>
                </Link>
                <Link to="/jobs" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">500+ Roles</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Employers & Recruiters */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300">
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

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <Link
                to="/recruiters?intent=hire"
                onClick={() => handleIntentClick('hire', '/recruiters')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Access Recruiter OS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                <Link to="/auth/register?role=employer&intent=hire" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Post in 2 Min</span>
                </Link>
                <Link to="/talent-database" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Pre-Vetted Pool</span>
                </Link>
                <Link to="/recruiters" className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">SI Screening</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Career Growth & Education */}
          <div className="relative group flex flex-col justify-between p-5 sm:p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 shadow-sm hover:shadow-xl hover:border-purple-500 transition-all duration-300">
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

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <Link
                to="/career-map?intent=career"
                onClick={() => handleIntentClick('career', '/career-map')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all"
              >
                <span>Generate Career Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                <Link to="/career-map" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">Skill Gap Analysis</span>
                </Link>
                <Link to="/colleges" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">2,000+ Colleges</span>
                </Link>
                <Link to="/career-insights" className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="truncate">AI Guidance</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================
            BOTTOM STATS & INFINITE OPPORTUNITIES TRUST BAR
            ========================================================= */}
        <div className="p-3 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-3 sm:gap-6">
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-8 md:gap-10">
            {/* Stat 1 */}
            <Link to="/talent-database" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">100K+</div>
                <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">Talent</div>
              </div>
            </Link>

            {/* Stat 2 */}
            <Link to="/jobs" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">500+</div>
                <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">Jobs</div>
              </div>
            </Link>

            {/* Stat 3 */}
            <Link to="/recruiters" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">1,000+</div>
                <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">Recruiters</div>
              </div>
            </Link>

            {/* Stat 4 */}
            <Link to="/colleges" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">2,000+</div>
                <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">Colleges</div>
              </div>
            </Link>

            {/* Stat 5 */}
            <Link to="/jobs" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">50+</div>
                <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">Countries</div>
              </div>
            </Link>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveVideoId('talentxcel-overview');
                setIsVideoModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Watch 1-Minute Platform Overview"
            >
              <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
              <span>Watch Overview</span>
            </button>

            <Link
              to="/auth/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs hover:border-purple-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">One Platform. Infinite Opportunities.</span>
              <span className="sm:hidden">Join Network</span>
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
