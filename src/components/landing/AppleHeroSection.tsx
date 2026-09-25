import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight, Play, Building2, Sparkles } from 'lucide-react';
import { TXCProductVideoModal } from '@/components/video/TXCProductVideoModal';
import careerPassportPreview from '@/assets/career-passport-preview.png';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { PLATFORM_METRICS } from '@/config/platformMetrics';

export const AppleHeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState('talentxcel-overview');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-muted/30 to-muted/50">
      {/* Floating geometric elements with semantic colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              {/* Recruiter / Candidate Quick Banner */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                <a 
                  href="/recruiters"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 border border-blue-500/30 hover:border-blue-500 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shadow-sm group hover:bg-blue-600/15"
                >
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Hiring Talent? Search {PLATFORM_METRICS.totalProfessionalsDisplay} candidates on Recruiter OS</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Globe Icon with semantic colors */}
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="w-[clamp(3rem,4vw,4rem)] h-[clamp(3rem,4vw,4rem)] bg-gradient-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/80 rounded-full"></div>
                  <div className="absolute top-2 left-2 w-[clamp(0.5rem,0.75vw,0.75rem)] h-[clamp(0.75rem,1vw,1rem)] bg-accent rounded-full opacity-80"></div>
                  <div className="absolute top-4 right-3 w-[clamp(0.375rem,0.5vw,0.5rem)] h-[clamp(0.5rem,0.75vw,0.75rem)] bg-accent rounded-full opacity-60"></div>
                  <div className="absolute bottom-3 left-4 w-[clamp(0.75rem,1vw,1rem)] h-[clamp(0.375rem,0.5vw,0.5rem)] bg-accent rounded-full opacity-70"></div>
                  <div className="absolute bottom-2 right-2 w-[clamp(0.375rem,0.5vw,0.5rem)] h-[clamp(0.375rem,0.5vw,0.5rem)] bg-accent rounded-full opacity-50"></div>
                  <div className="absolute top-1 left-2 w-[clamp(0.75rem,1vw,1rem)] h-[clamp(0.75rem,1vw,1rem)] bg-primary-foreground/30 rounded-full blur-sm"></div>
                </div>
              </div>
              
              <h1 className="text-display font-heading tracking-tight text-foreground leading-[1.1]">
                The Global Professional
                <span className="block font-medium bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Talent Network
                </span>
              </h1>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold">
                <span>Connect with Tech & Leadership Professionals Worldwide • UAE • Europe • Americas • Asia</span>
              </div>
              
              <p className="text-body-large text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Build your Career Passport, get verified by TalentScore, connect with global leaders and peers, discover opportunities worldwide, and let top hiring teams discover you.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 text-xs text-muted-foreground font-medium">
                <span className="text-foreground font-semibold">Professionals</span>
                <span>•</span>
                <span className="text-foreground font-semibold">Tech Leaders</span>
                <span>•</span>
                <span className="text-foreground font-semibold">Recruiters</span>
                <span>•</span>
                <span className="text-foreground font-semibold">Companies</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold hidden sm:inline">Connect. Discover. Grow. Get Hired.</span>
              </div>
            </div>

            {/* CTA Buttons - Two Doors for Candidates & Recruiters */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start items-center">
              <a 
                href="/auth/register"
                onClick={() => {
                  conversionTelemetry.track('signup_cta_click', { source: 'homepage' });
                  conversionTelemetry.setAcquisitionContext('homepage', '/');
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl transition-all group"
              >
                Join TalentXcel
                <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a 
                href="/jobs"
                className="inline-flex items-center justify-center px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold rounded-2xl shadow-sm transition-all"
              >
                Find Jobs
              </a>

              <a 
                href="/recruiters"
                className="inline-flex items-center justify-center px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl border border-slate-700/50 transition-all gap-2 group"
              >
                <Building2 className="h-4 w-4 text-blue-400" />
                <span>Hire Talent</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </a>

              <button 
                type="button"
                onClick={() => {
                  setActiveVideoId('talentxcel-overview');
                  setIsVideoModalOpen(true);
                }}
                className="inline-flex items-center justify-center px-4 py-3.5 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-sm font-bold rounded-2xl transition-all gap-1.5 group"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-2 w-2 fill-white ml-0.5" />
                </div>
                24s Demo
              </button>
            </div>

            {/* Quick-choice Two-Door Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  For Professionals
                </div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                  Build Career Passport → Network with peers → Discover verified jobs → Get discovered.
                </p>
                <a href="/passport" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                  Build Career Passport <ChevronRight className="h-3 w-3" />
                </a>
              </div>

              <a 
                href="/recruiters" 
                className="p-3.5 rounded-xl border-2 border-blue-500/30 hover:border-blue-600 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 backdrop-blur-sm text-left transition-all group block shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between text-xs font-bold text-blue-950 dark:text-blue-200 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    For Recruiters & Hiring Teams
                  </span>
                  <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">RECRUITER OS</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                  Search {PLATFORM_METRICS.totalProfessionalsDisplay} talent live → Match with Candidate 360 → Direct verified outreach → Hire.
                </p>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:underline inline-flex items-center gap-1">
                  Open Recruiter OS <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Join thousands of verified professionals accelerating their careers with TalentXcel
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm">
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">{PLATFORM_METRICS.totalProfessionalsDisplay}</div>
                  <div className="text-caption text-muted-foreground">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">{PLATFORM_METRICS.hiringTeamsDisplay}</div>
                  <div className="text-caption text-muted-foreground">Hiring Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">{PLATFORM_METRICS.matchSuccessRateDisplay}</div>
                  <div className="text-caption text-muted-foreground">Match Success</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Platform Video & Career Passport Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-secondary/15 to-accent/20 rounded-[2rem] blur-2xl" aria-hidden="true"></div>
            <div 
              className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border/50 group bg-black cursor-pointer"
              onClick={() => {
                setActiveVideoId('talentxcel-overview');
                setIsVideoModalOpen(true);
              }}
            >
              <img
                src="/videos/txc/thumbnails/talentxcel-overview.jpg"
                alt="TalentXcel Platform Demo — Watch Live Video Overview"
                loading="lazy"
                decoding="async"
                width="600"
                height="400"
                className="block w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              {/* Play trigger overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 flex flex-col justify-between p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Tour • 0:24
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-[11px] font-mono backdrop-blur-sm border border-white/10">
                    1080p HD
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-blue-500 transition-all flex-shrink-0">
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base drop-shadow-sm group-hover:text-blue-200 transition-colors">
                      Watch TalentXcel in Action
                    </h4>
                    <p className="text-slate-300 text-xs drop-shadow-sm">
                      Click to watch 24s platform tour & live AI features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Demo Modal */}
      <TXCProductVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        initialVideoId={activeVideoId}
      />
    </div>
  );
};