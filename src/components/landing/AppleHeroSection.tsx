import React, { useState } from 'react';
import { 
  ChevronRight, Play, Building2, Sparkles, Briefcase, 
  GraduationCap, FileText, CheckCircle2, ArrowRight, Zap, ShieldCheck 
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
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center z-10">
        
        {/* Top Intelligence Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>TalentXcel SI — Super Intelligence for Careers & Hiring</span>
          </div>
        </div>

        {/* Primary H1 */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
          Your Career. Your Talent. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
            One Intelligent Platform.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Powered by TalentXcel SI — context-aware career and talent intelligence from profile to placement. Select your goal to get started instantly.
        </p>

        {/* =========================================================
            3-INTENT ARCHITECTURE: HIGH-CLARITY ENTRY PATHWAYS
            ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-12">
          
          {/* Card 1: Job Seekers & Professionals */}
          <div className="relative group flex flex-col justify-between p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-md hover:shadow-xl hover:border-blue-500 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  High Demand
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  I&apos;m Looking for a Job
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload your resume for an instant ATS compatibility score, find missing keywords, and match with verified active roles.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <a
                href="/resume/ats-check?intent=resume"
                onClick={() => handleIntentClick('resume', '/resume/ats-check')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
              >
                <span>Check ATS &amp; Match Score</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="text-center">
                <a 
                  href="/jobs"
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Browse 500+ Verified Openings →</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Employers & Recruiters */}
          <div className="relative group flex flex-col justify-between p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Recruiter OS
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  I&apos;m Hiring Talent
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Source pre-vetted candidates with context-aware SI matching. Cut screening cycles by up to 80% with real candidate signals.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <a
                href="/recruiters?intent=hire"
                onClick={() => handleIntentClick('hire', '/recruiters')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
              >
                <span>Access Recruiter OS</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="text-center">
                <a 
                  href="/auth/register?role=employer&intent=hire"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Post a Job Opening in 2 Minutes →</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Career Growth & Education */}
          <div className="relative group flex flex-col justify-between p-6 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 shadow-md hover:shadow-xl hover:border-purple-500 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Career Pathways
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  I&apos;m Building My Career
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Map market skill gaps to structured learning pathways, discover accredited colleges, and build your verified Career Passport.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <a
                href="/career-map?intent=career"
                onClick={() => handleIntentClick('career', '/career-map')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
              >
                <span>Generate Career Map</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="text-center">
                <a 
                  href="/colleges"
                  className="text-xs font-semibold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-purple-500" />
                  <span>Explore Verified Colleges &amp; Degrees →</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Video demo & platform features strip */}
        <div className="pt-2 pb-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              setActiveVideoId('talentxcel-overview');
              setIsVideoModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span>Watch 1-Minute Platform Overview</span>
          </button>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">100% Free Candidate Wedge</span>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

          <div className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Contextual SI Matching</span>
          </div>
        </div>

      </div>

      <TXCProductVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        initialVideoId={activeVideoId}
      />
    </div>
  );
};