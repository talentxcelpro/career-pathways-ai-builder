import React from 'react';
import { ShieldAlert, CheckCircle2, Circle, Trophy, Award, KeyRound, ArrowRight, Swords, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerBossBattle } from '@/services/careerverse/careerBossBattleService';
import { CareerDomainId, CAREER_DOMAINS } from '@/services/careerverse/careerDomainCatalog';
import { gameAudio } from '@/utils/gameAudio';

interface BossBattleProps {
  battle: CareerBossBattle;
  domainId?: CareerDomainId;
  onOpenWorkspace: (battle: CareerBossBattle) => void;
}

export const BossBattleCard: React.FC<BossBattleProps> = ({
  battle,
  domainId = 'technology',
  onOpenWorkspace
}) => {
  const currentStage = battle.user_participation?.current_stage || 1;
  const rawStages = battle.stages || ['Stage 1', 'Stage 2', 'Stage 3', 'Final Review'];
  const stages = Array.isArray(rawStages)
    ? rawStages.map((s: any) => typeof s === 'string' ? s : s?.name || s?.desc || s?.title || 'Stage')
    : ['Stage 1', 'Stage 2', 'Stage 3', 'Final Review'];

  const domainConfig = CAREER_DOMAINS[domainId] || CAREER_DOMAINS.technology;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#101E3B] border border-white/10 p-6 md:p-7 shadow-2xl backdrop-blur-xl">
      {/* Background Combat Aura */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#FF4757]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#7047F5]/20 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 flex items-center justify-center text-[#FF4757] shadow-lg shadow-[#FF4757]/20">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-xl tracking-tight">Boss Battle – Employer Challenge</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Prove competency in <span className="text-[#36D9F5] font-semibold">{domainConfig.shortLabel}</span> to unlock fast-track hiring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4757]/15 border border-[#FF4757]/30 text-xs font-black text-[#FF4757] uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF4757] animate-ping" />
          <span>LIVE ARENA</span>
        </div>
      </div>

      {/* Main Combat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Cyber Dragon Graphic */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-tr from-[#7047F5] via-[#278DFF] to-[#36D9F5] p-1 shadow-2xl shadow-[#7047F5]/40 group">
            <div className="w-full h-full rounded-[14px] bg-[#071329] overflow-hidden flex items-center justify-center relative">
              {/* Animated Cyber Dragon Visual (SVG Art matching reference screenshot) */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="dragonPlating" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E1B4B" />
                    <stop offset="50%" stopColor="#312E81" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="hornGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#7047F5" />
                  </linearGradient>
                  <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>
                </defs>

                {/* Cyber Dragon Background Grid */}
                <rect width="200" height="200" fill="#071329" />
                <circle cx="100" cy="100" r="80" stroke="#7047F5" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 4" />

                {/* Back Horns */}
                <path d="M70 70 Q45 25 20 40 Q40 65 65 80 Z" fill="url(#hornGlow)" opacity="0.9" />
                <path d="M130 70 Q155 25 180 40 Q160 65 135 80 Z" fill="url(#hornGlow)" opacity="0.9" />

                {/* Dragon Head Plating */}
                <polygon points="100,35 145,85 130,150 100,185 70,150 55,85" fill="url(#dragonPlating)" stroke="#36D9F5" strokeWidth="1.5" />

                {/* Snout & Brow Ridges */}
                <polygon points="100,60 125,95 115,145 100,165 85,145 75,95" fill="#0F172A" stroke="#7047F5" strokeWidth="1" />

                {/* Cybernetic Scales / Vents */}
                <line x1="88" y1="120" x2="112" y2="120" stroke="#36D9F5" strokeWidth="1.5" opacity="0.8" />
                <line x1="90" y1="135" x2="110" y2="135" stroke="#36D9F5" strokeWidth="1.5" opacity="0.8" />
                <line x1="94" y1="150" x2="106" y2="150" stroke="#36D9F5" strokeWidth="1.5" opacity="0.8" />

                {/* Glowing Cyber Eyes */}
                <polygon points="76,85 92,90 84,97" fill="url(#eyeGlow)" />
                <polygon points="124,85 108,90 116,97" fill="url(#eyeGlow)" />
                <circle cx="84" cy="90" r="2.5" fill="#FFFFFF" />
                <circle cx="116" cy="90" r="2.5" fill="#FFFFFF" />

                {/* Crown Core Gem */}
                <polygon points="100,45 108,58 100,70 92,58" fill="#FF4757" stroke="#FFA726" strokeWidth="1" />
              </svg>

              {/* Boss Tag Overlay with crisp font */}
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-xs font-black text-center text-[#36D9F5] border border-white/10 flex items-center justify-between">
                <span>Lv. 15 Guardian Boss</span>
                <span className="text-[#FF4757] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-[#FF4757]" /> 10,000 HP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Pipeline & Recruiter Fast-Track Info */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* Company Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shadow-white/5 flex-shrink-0">
              <img
                src={battle.company_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'}
                alt={battle.company_name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-lg sm:text-2xl font-black text-white">{battle.title}</h4>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {battle.company_name} <span className="text-[#36D9F5] font-semibold">({battle.role_type})</span>
              </p>
            </div>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {stages.map((stageName, idx) => {
              const stageNum = idx + 1;
              const isPast = stageNum < currentStage;
              const isCurrent = stageNum === currentStage;

              return (
                <div
                  key={`${idx}-${stageName}`}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    isPast
                      ? 'bg-[#20D994]/15 border-[#20D994]/50 text-[#20D994]'
                      : isCurrent
                      ? 'bg-[#278DFF]/20 border-[#278DFF] text-white shadow-lg shadow-[#278DFF]/20'
                      : 'bg-[#071329] border-white/5 text-slate-400'
                  }`}
                >
                  <div className="mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-[#20D994]" />
                    ) : isCurrent ? (
                      <Circle className="w-4 h-4 text-[#36D9F5] animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold leading-tight">{stageName}</span>
                </div>
              );
            })}
          </div>

          {/* Victory Rewards */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs sm:text-sm">
            <span className="font-bold text-white">Victory Reward:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFCA55]/15 text-[#FFCA55] font-bold border border-[#FFCA55]/20">
              <Trophy className="w-4 h-4" />
              <span>+{battle.xp_reward} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7047F5]/20 text-[#A34EFF] font-bold border border-[#7047F5]/30">
              <Award className="w-4 h-4" />
              <span>Verified Skill Badge</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#20D994]/15 text-[#20D994] font-bold border border-[#20D994]/30">
              <KeyRound className="w-4 h-4" />
              <span>Interview Fast-Track</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={() => {
                gameAudio.playClick();
                onOpenWorkspace(battle);
              }}
              className="w-full sm:w-auto px-8 bg-gradient-to-r from-[#7047F5] via-[#278DFF] to-[#36D9F5] hover:from-[#6035e0] hover:to-[#1a7ae0] text-white font-black text-sm h-11 rounded-xl shadow-lg shadow-[#7047F5]/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Swords className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Enter Boss Battle Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
