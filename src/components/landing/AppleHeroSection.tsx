import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight, Play, Building2, Sparkles, Network, Briefcase, UserCheck } from 'lucide-react';
import { TXCProductVideoModal } from '@/components/video/TXCProductVideoModal';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

export const AppleHeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState('talentxcel-overview');

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Floating geometric elements for background texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-24 text-center z-10">
        
        {/* Top Category Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>TalentXcel</span>
          </div>
        </div>

        {/* Primary H1 */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
          The Global Professional <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Talent Network
          </span>
        </h1>

        {/* Supporting Line 1 */}
        <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
          Connect with Tech & Leadership Professionals Worldwide
        </p>
        
        {/* Supporting Line 2 */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Build your Career Passport, connect with professionals, discover opportunities, and let hiring teams discover you.
        </p>

        {/* Ecosystem Pillars - Visual Hierarchy */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-500" /> Career Passport</span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">+</span>
          <span className="flex items-center gap-2"><Network className="w-5 h-5 text-indigo-500" /> Network</span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">+</span>
          <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500" /> Jobs</span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">+</span>
          <span className="flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-500" /> Recruiter OS</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/auth/register"
            onClick={() => {
              conversionTelemetry.track('signup_cta_click', { source: 'homepage' });
              conversionTelemetry.setAcquisitionContext('homepage', '/');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all group"
          >
            Join Network
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a 
            href="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-lg font-bold rounded-xl shadow-sm transition-all"
          >
            Find Jobs
          </a>

          <a 
            href="/recruiters"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 border-2 border-transparent dark:border-slate-800 text-white text-lg font-bold rounded-xl shadow-lg transition-all"
          >
            Hire Talent
          </a>
        </div>
        
        {/* Social Proof */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Join the rapidly growing professional talent network connecting global leaders, tech talent, and top companies.
          </p>
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