import React from 'react';
import { Trophy, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface GamingTalentScoreCardProps {
  score?: number;
  displayName?: string;
  title?: string;
  company?: string;
  actionText?: string;
  actionRoute?: string;
  onActionClick?: () => void;
  className?: string;
  rankOverride?: string;
  growthDeltaOverride?: string;
  syncFidelityOverride?: string;
}

export const GamingTalentScoreCard: React.FC<GamingTalentScoreCardProps> = ({
  score = 823,
  displayName = 'TalentXcelServices',
  title = 'Director Operations',
  company = 'TalentXcel Services',
  actionText = 'View & Earn in Gaming Hub',
  actionRoute = '/gamification',
  onActionClick,
  className,
  rankOverride,
  growthDeltaOverride,
  syncFidelityOverride,
}) => {
  const navigate = useNavigate();

  // Clamp score between 100 and 1000
  const normalizedScore = Math.min(Math.max(Number(score) || 823, 100), 1000);
  const progressRatio = normalizedScore / 1000;

  // Determine tier name based on score
  const tierName =
    normalizedScore >= 800
      ? 'Elite Tier'
      : normalizedScore >= 650
      ? 'Pro Tier'
      : normalizedScore >= 500
      ? 'Rising Tier'
      : 'Emerging Tier';

  const tierCategory =
    normalizedScore >= 800
      ? 'ELITE'
      : normalizedScore >= 650
      ? 'PRO'
      : normalizedScore >= 500
      ? 'RISING'
      : 'EMERGING';

  // SVG Gauge calculations
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Dynamic stats
  const rank = rankOverride || `#${Math.floor(4821 * (1 - normalizedScore / 1000)) || 853}`;
  const growthDelta = growthDeltaOverride || `+${Math.round(normalizedScore * 0.08) || 66}`;
  const syncFidelity = syncFidelityOverride || '98%';

  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
    } else if (actionRoute) {
      navigate(actionRoute);
    }
  };

  // Subtitle formulation
  const displaySubtitle = title
    ? company
      ? `${title} at ${company}`
      : title
    : company
    ? `Professional at ${company}`
    : 'Director Operations at TalentXcel Services';

  return (
    <div
      className={cn(
        'relative w-full max-w-[480px] mx-auto rounded-[40px] md:rounded-[44px]',
        'bg-gradient-to-b from-[#081533] via-[#040c1d] to-[#020612]',
        'p-7 sm:p-9 md:p-10 border border-blue-500/25',
        'shadow-[0_25px_60px_-15px_rgba(3,10,30,0.95),0_0_35px_rgba(37,99,235,0.18)]',
        'flex flex-col items-center overflow-hidden select-none',
        className
      )}
    >
      {/* Ambient background glows */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%)',
        }}
      />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none blur-3xl bg-blue-600/10" />

      {/* Decorative concentric rings around center */}
      <div className="absolute top-[215px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-blue-500/10 pointer-events-none" />
      <div className="absolute top-[215px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-blue-500/5 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 text-center w-full mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-sky-400">
          TALENTSCORE
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5 truncate max-w-full px-2">
          {displayName}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 truncate max-w-full px-2">
          {displaySubtitle}
        </p>
      </div>

      {/* Center Circular Glowing Gauge */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2">
        <div className="relative w-[210px] h-[210px] sm:w-[220px] sm:h-[220px] flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 220 220"
          >
            <defs>
              {/* Glowing Amber Gradient */}
              <linearGradient id="gamingAmberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="85%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Glow Filter for Amber Ring */}
              <filter id="amberGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Unfilled track: Cream/Pale Yellow segment matching design */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="#fef3c7"
              strokeWidth={strokeWidth}
              fill="none"
              strokeOpacity="0.85"
            />

            {/* Progress Arc: Glowing Amber Gradient */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#gamingAmberGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#amberGlowFilter)"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.75))',
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>

          {/* Central Score and Tier Category */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {normalizedScore}
            </span>
            <span className="text-[11px] font-black tracking-[0.28em] text-slate-300 mt-2 uppercase">
              {tierCategory}
            </span>
          </div>
        </div>

        {/* Tier Pill Badge with Amber Glow */}
        <div className="mt-3 relative">
          <div
            className="px-4 py-1 rounded-full text-[11px] font-extrabold tracking-wide text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.65)]"
          >
            {tierName}
          </div>
        </div>
      </div>

      {/* 3 Squircle Stat Cards */}
      <div className="relative z-10 grid grid-cols-3 gap-3 w-full mt-7">
        {/* Card 1: Ecosystem Tier */}
        <div className="rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-blue-400/40 hover:bg-[#0c1f48] transition-all">
          <Trophy className="w-6 h-6 text-blue-400 stroke-[1.8] mb-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {rank}
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-1.5">
            ECOSYSTEM TIER
          </span>
        </div>

        {/* Card 2: Growth Delta */}
        <div className="rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-sky-400/40 hover:bg-[#0c1f48] transition-all">
          <TrendingUp className="w-6 h-6 text-sky-400 stroke-[2] mb-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {growthDelta}
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-1.5">
            GROWTH DELTA
          </span>
        </div>

        {/* Card 3: Sync Fidelity */}
        <div className="rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-lg hover:border-blue-400/40 hover:bg-[#0c1f48] transition-all">
          <ShieldCheck className="w-6 h-6 text-blue-400 stroke-[1.8] mb-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {syncFidelity}
          </span>
          <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-1.5">
            SYNC FIDELITY
          </span>
        </div>
      </div>

      {/* Bottom Action Pill Button */}
      <div className="relative z-10 w-full mt-7 flex justify-center">
        <button
          type="button"
          onClick={handleAction}
          className="group w-full max-w-[320px] rounded-full bg-[#0b1c40]/90 hover:bg-[#0f2554] border border-blue-500/45 hover:border-sky-400/70 text-sky-200 hover:text-white px-5 py-2.5 flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide transition-all shadow-[0_0_18px_rgba(37,99,235,0.25)] hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          <span className="truncate">{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default GamingTalentScoreCard;
