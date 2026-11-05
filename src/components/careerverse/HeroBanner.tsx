import React from 'react';
import { BookOpen, Code2, Trophy, Briefcase, Sparkles, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameAudio } from '@/utils/gameAudio';
import { CareerDomainId, CAREER_DOMAINS } from '@/services/careerverse/careerDomainCatalog';

interface HeroBannerProps {
  domainId?: CareerDomainId;
  onOpenWorldMap?: () => void;
  onOpenQuickQuest?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  domainId = 'technology',
  onOpenWorldMap,
  onOpenQuickQuest,
}) => {
  const domainConfig = CAREER_DOMAINS[domainId] || CAREER_DOMAINS.technology;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071329] via-[#0E1E40] to-[#121B38] border border-[#7047F5]/30 p-6 md:p-8 shadow-2xl">
      {/* Visual Citadel / Holographic Stargate Backdrop */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 opacity-40 md:opacity-55 pointer-events-none overflow-hidden select-none">
        {/* Glow Spheres */}
        <div className="absolute right-10 top-[-20%] w-96 h-96 rounded-full bg-gradient-to-br from-[#7047F5] via-[#278DFF] to-[#36D9F5] blur-3xl opacity-50 animate-pulse" />
        <div className="absolute right-1/3 bottom-[-10%] w-64 h-64 rounded-full bg-[#20D994]/20 blur-2xl" />

        {/* Holographic Stargate Arches SVG */}
        <svg
          viewBox="0 0 500 320"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full max-w-[580px] object-contain opacity-80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central Stargate Core */}
          <circle cx="280" cy="160" r="110" stroke="url(#gateGlow)" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="280" cy="160" r="85" stroke="#36D9F5" strokeWidth="1.5" opacity="0.6" />
          <circle cx="280" cy="160" r="60" stroke="#7047F5" strokeWidth="2" opacity="0.8" />
          <circle cx="280" cy="160" r="30" fill="url(#coreGlow)" opacity="0.7" />

          {/* Citadel Spires & Towers */}
          <path d="M190 280 L210 130 L225 150 L240 90 L255 140 L280 60 L305 140 L320 90 L335 150 L350 130 L370 280 Z" fill="#071329" stroke="#36D9F5" strokeWidth="1" opacity="0.6" />
          <path d="M220 280 L235 150 L250 170 L280 100 L310 170 L325 150 L340 280 Z" fill="#0C1B3E" stroke="#7047F5" strokeWidth="1.5" opacity="0.8" />

          {/* Radiant Portal Rays */}
          <line x1="280" y1="50" x2="280" y2="20" stroke="#36D9F5" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="200" y1="100" x2="175" y2="80" stroke="#7047F5" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <line x1="360" y1="100" x2="385" y2="80" stroke="#7047F5" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#36D9F5" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#7047F5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#071329" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gateGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#36D9F5" />
              <stop offset="50%" stopColor="#278DFF" />
              <stop offset="100%" stopColor="#7047F5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7047F5]/20 border border-[#7047F5]/40 text-xs sm:text-sm font-semibold text-[#A34EFF] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#36D9F5]" />
            <span>TalentXcel CareerVerse • {domainConfig.shortLabel}</span>
          </div>

          {onOpenWorldMap && (
            <button
              onClick={() => {
                gameAudio.playClick();
                onOpenWorldMap();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#278DFF]/20 hover:bg-[#278DFF]/30 border border-[#278DFF]/40 text-xs sm:text-sm font-semibold text-[#36D9F5] transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>World Map (2.5D)</span>
            </button>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2">
          Your Career Journey <br />
          <span className="bg-gradient-to-r from-[#36D9F5] via-[#278DFF] to-[#A34EFF] bg-clip-text text-transparent">
            as a Game
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium mb-6">
          {domainConfig.tagline}
        </p>

        {/* 4 Interactive Gateway Action Banners */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
          <Link
            to="/learning"
            onClick={() => gameAudio.playClick()}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#071329]/80 hover:bg-[#101E3B] border border-white/10 hover:border-[#36D9F5]/60 transition-all group backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7047F5]/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-[#36D9F5]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">Learn</span>
          </Link>

          <button
            onClick={() => {
              gameAudio.playClick();
              onOpenQuickQuest?.();
            }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#071329]/80 hover:bg-[#101E3B] border border-white/10 hover:border-[#278DFF]/60 transition-all group backdrop-blur-md text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#278DFF]/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5 text-[#278DFF]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">Practice</span>
          </button>

          <a
            href="#leaderboard-section"
            onClick={() => gameAudio.playClick()}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#071329]/80 hover:bg-[#101E3B] border border-white/10 hover:border-[#FFCA55]/60 transition-all group backdrop-blur-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFCA55]/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-[#FFCA55]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">Compete</span>
          </a>

          <Link
            to="/jobs"
            onClick={() => gameAudio.playClick()}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#071329]/80 hover:bg-[#101E3B] border border-white/10 hover:border-[#20D994]/60 transition-all group backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-[#20D994]/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-[#20D994]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">Get Hired</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
