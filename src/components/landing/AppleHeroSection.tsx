import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight, Play } from 'lucide-react';
import { TXCProductVideoModal } from '@/components/video/TXCProductVideoModal';
import careerPassportPreview from '@/assets/career-passport-preview.png';

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
                AI-Powered Platform for
                <span className="block font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Jobs, Skills & Higher Ed
                </span>
              </h1>
              
              <p className="text-body-large text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Search verified jobs, build ATS-optimized resumes, explore 10,250+ Indian colleges, and fast-track your career with AI-guided learning and verified skill passports.
              </p>
            </div>

            {/* CTA Buttons - Direct Zero-Barrier Free Utility */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a 
                href="/resume"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl transition-all group"
              >
                Check My Resume — Free ATS Scan
                <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <button 
                type="button"
                onClick={() => {
                  setActiveVideoId('talentxcel-overview');
                  setIsVideoModalOpen(true);
                }}
                className="inline-flex items-center justify-center px-5 py-3.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800 text-sm font-bold rounded-2xl shadow-sm transition-all gap-2 group"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-2.5 w-2.5 fill-white ml-0.5" />
                </div>
                Watch 24s Demo
              </button>

              <a 
                href="/colleges"
                className="inline-flex items-center justify-center px-5 py-3.5 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-sm font-bold rounded-2xl transition-all"
              >
                10,250+ Colleges
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Join thousands of professionals accelerating their careers with TalentXcel
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm">
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">10K+</div>
                  <div className="text-caption text-muted-foreground">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">1K+</div>
                  <div className="text-caption text-muted-foreground">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">95%</div>
                  <div className="text-caption text-muted-foreground">Success Rate</div>
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