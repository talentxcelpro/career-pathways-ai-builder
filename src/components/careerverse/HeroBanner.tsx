import React from 'react';
import { BookOpen, Code, Trophy, Briefcase } from 'lucide-react';

interface HeroBannerProps {
  onSelectPortal?: (portal: 'learn' | 'practice' | 'compete' | 'get-hired') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectPortal }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1730] via-[#101E3B] to-[#071329] border border-[#7047F5]/30 p-6 md:p-8 shadow-2xl">
      {/* Background Stargate Ambient Artwork with Floating Mountain Silhouettes */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
        <div className="absolute -top-24 -right-10 w-96 h-96 bg-[#7047F5]/30 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#36D9F5]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#20D994]/15 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Headline */}
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Your Career Journey <br />
            <span className="bg-gradient-to-r from-[#A34EFF] via-[#36D9F5] to-[#20D994] bg-clip-text text-transparent">
              as a Game
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            Learn • Build Skills • Compete • Get Hired
          </p>
        </div>

        {/* Center-Right Interactive Portal Banners matching reference screenshot */}
        <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-center">
          {/* 1. LEARN BANNER */}
          <button
            onClick={() => onSelectPortal?.('learn')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#071329]/90 border border-[#7047F5]/40 hover:border-[#7047F5] shadow-lg shadow-[#7047F5]/20 transform hover:-translate-y-1 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7047F5] to-[#A34EFF] flex items-center justify-center text-white mb-1.5 shadow-[0_0_12px_rgba(112,71,245,0.6)] group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Learn</span>
            <span className="text-[10px] text-[#A34EFF]">Academy</span>
          </button>

          {/* 2. PRACTICE BANNER */}
          <button
            onClick={() => onSelectPortal?.('practice')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#071329]/90 border border-[#278DFF]/40 hover:border-[#278DFF] shadow-lg shadow-[#278DFF]/20 transform hover:-translate-y-1 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#278DFF] to-[#36D9F5] flex items-center justify-center text-white mb-1.5 shadow-[0_0_12px_rgba(39,141,255,0.6)] group-hover:scale-110 transition-transform">
              <Code className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Practice</span>
            <span className="text-[10px] text-[#36D9F5]">Skill Tree</span>
          </button>

          {/* 3. COMPETE BANNER */}
          <button
            onClick={() => onSelectPortal?.('compete')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#071329]/90 border border-[#FFCA55]/40 hover:border-[#FFCA55] shadow-lg shadow-[#FFCA55]/20 transform hover:-translate-y-1 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFCA55] to-[#FFA726] flex items-center justify-center text-slate-950 mb-1.5 shadow-[0_0_12px_rgba(255,202,85,0.6)] group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 font-black" />
            </div>
            <span className="text-xs font-bold text-white">Compete</span>
            <span className="text-[10px] text-[#FFCA55]">Boss Battle</span>
          </button>

          {/* 4. GET HIRED BANNER */}
          <button
            onClick={() => onSelectPortal?.('get-hired')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#071329]/90 border border-[#20D994]/40 hover:border-[#20D994] shadow-lg shadow-[#20D994]/20 transform hover:-translate-y-1 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#20D994] to-[#00E676] flex items-center justify-center text-slate-950 mb-1.5 shadow-[0_0_12px_rgba(32,217,148,0.6)] group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4 font-black" />
            </div>
            <span className="text-xs font-bold text-white">Get Hired</span>
            <span className="text-[10px] text-[#20D994]">Victory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
