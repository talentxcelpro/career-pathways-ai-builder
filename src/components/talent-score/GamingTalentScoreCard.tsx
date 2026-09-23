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
  compact?: boolean;
  onStatClick?: (stat: 'rank' | 'growth' | 'sync') => void;
  onGaugeClick?: () => void;
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
  compact = false,
  onStatClick,
  onGaugeClick,
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
  const radius = compact ? 60 : 80;
  const strokeWidth = compact ? 10 : 14;
  const viewBoxSize = compact ? 160 : 220;
  const centerCoord = compact ? 80 : 110;
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
        'relative w-full mx-auto select-none overflow-hidden transition-all duration-300',
        compact
          ? 'max-w-[340px] rounded-[32px] p-4 sm:p-5 border border-blue-400/35 shadow-[0_20px_50px_rgba(2,8,24,0.9),0_0_30px_rgba(37,99,235,0.22)]'
          : 'max-w-[480px] rounded-[40px] md:rounded-[44px] p-7 sm:p-9 md:p-10 border border-blue-500/25 shadow-[0_25px_60px_-15px_rgba(3,10,30,0.95),0_0_35px_rgba(37,99,235,0.18)]',
        'bg-gradient-to-b from-[#081533] via-[#040c1d] to-[#020612]',
        className
      )}
    >
      {/* Ambient background glows */}
      <div
        className={cn(
          'absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-3xl opacity-25',
          compact ? 'w-48 h-48' : 'w-72 h-72'
        )}
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 75%)',
        }}
      />
      <div
        className={cn(
          'absolute top-8 left-1/2 -translate-x-1/2 rounded-full pointer-events-none blur-3xl bg-blue-600/10',
          compact ? 'w-60 h-60' : 'w-96 h-96'
        )}
      />

      {/* Decorative concentric rings around center */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10 pointer-events-none',
          compact ? 'top-[160px] w-[180px] h-[180px]' : 'top-[215px] w-[240px] h-[240px]'
        )}
      />

      {/* Top Header */}
      <div className={cn('relative z-10 text-center w-full', compact ? 'mb-2' : 'mb-6')}>
        <p className={cn('font-bold uppercase text-sky-400', compact ? 'text-[9.5px] tracking-[0.35em]' : 'text-[11px] tracking-[0.42em]')}>
          TALENTSCORE
        </p>
        <h2 className={cn('font-black text-white tracking-tight truncate max-w-full px-1', compact ? 'text-lg sm:text-xl mt-1' : 'text-2xl sm:text-3xl mt-1.5')}>
          {displayName}
        </h2>
        <p className={cn('font-medium text-slate-400 truncate max-w-full px-1', compact ? 'text-[10.5px] sm:text-[11px] mt-0.5' : 'text-xs sm:text-sm mt-0.5')}>
          {displaySubtitle}
        </p>
      </div>

      {/* Center Circular Glowing Gauge */}
      <div
        onClick={onGaugeClick}
        className={cn(
          'relative z-10 flex flex-col items-center justify-center my-1 group',
          onGaugeClick && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            'relative flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]',
            compact ? 'w-[150px] h-[150px]' : 'w-[210px] h-[210px] sm:w-[220px] sm:h-[220px]'
          )}
        >
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
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
                <feGaussianBlur in="SourceGraphic" stdDeviation={compact ? '3.5' : '5'} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Unfilled track */}
            <circle
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              stroke="#fef3c7"
              strokeWidth={strokeWidth}
              fill="none"
              strokeOpacity="0.85"
            />

            {/* Progress Arc */}
            <circle
              cx={centerCoord}
              cy={centerCoord}
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
            <span
              className={cn(
                'font-black text-white tracking-tight leading-none drop-shadow-md',
                compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
              )}
            >
              {normalizedScore}
            </span>
            <span
              className={cn(
                'font-black text-slate-300 uppercase tracking-[0.25em]',
                compact ? 'text-[9.5px] mt-1' : 'text-[11px] mt-2'
              )}
            >
              {tierCategory}
            </span>
          </div>
        </div>

        {/* Tier Pill Badge with Amber Glow */}
        <div className={cn('relative', compact ? 'mt-2' : 'mt-3')}>
          <div
            className={cn(
              'rounded-full font-extrabold tracking-wide text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.65)]',
              compact ? 'px-3 py-0.5 text-[9.5px]' : 'px-4 py-1 text-[11px]'
            )}
          >
            {tierName}
          </div>
        </div>
      </div>

      {/* 3 Squircle Stat Cards */}
      <div className={cn('relative z-10 grid grid-cols-3 w-full', compact ? 'mt-4 gap-2' : 'mt-7 gap-3')}>
        {/* Card 1: Ecosystem Tier */}
        <div
          onClick={() => onStatClick?.('rank')}
          title="Click to view Global Ecosystem Standing"
          className={cn(
            'rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg hover:border-cyan-400/50 hover:bg-[#0c1f48] hover:scale-105 active:scale-95 transition-all cursor-pointer group',
            compact ? 'p-2 sm:p-2.5' : 'p-3.5 sm:p-4'
          )}
        >
          <Trophy className={cn('text-blue-400 stroke-[1.8] group-hover:text-cyan-300 transition-colors', compact ? 'w-4 h-4 mb-1' : 'w-6 h-6 mb-2')} />
          <span className={cn('font-black text-white tracking-tight leading-none', compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl')}>
            {rank}
          </span>
          <span className={cn('font-bold uppercase text-slate-400', compact ? 'text-[7.5px] tracking-[0.1em] mt-1' : 'text-[8.5px] sm:text-[9.5px] tracking-[0.14em] mt-1.5')}>
            ECOSYSTEM TIER
          </span>
        </div>

        {/* Card 2: Growth Delta */}
        <div
          onClick={() => onStatClick?.('growth')}
          title="Click to view 30-Day Growth Delta Breakdown"
          className={cn(
            'rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg hover:border-sky-400/50 hover:bg-[#0c1f48] hover:scale-105 active:scale-95 transition-all cursor-pointer group',
            compact ? 'p-2 sm:p-2.5' : 'p-3.5 sm:p-4'
          )}
        >
          <TrendingUp className={cn('text-sky-400 stroke-[2] group-hover:text-cyan-300 transition-colors', compact ? 'w-4 h-4 mb-1' : 'w-6 h-6 mb-2')} />
          <span className={cn('font-black text-white tracking-tight leading-none', compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl')}>
            {growthDelta}
          </span>
          <span className={cn('font-bold uppercase text-slate-400', compact ? 'text-[7.5px] tracking-[0.1em] mt-1' : 'text-[8.5px] sm:text-[9.5px] tracking-[0.14em] mt-1.5')}>
            GROWTH DELTA
          </span>
        </div>

        {/* Card 3: Sync Fidelity */}
        <div
          onClick={() => onStatClick?.('sync')}
          title="Click to view Profile Sync & Telemetry Health"
          className={cn(
            'rounded-2xl bg-[#091838]/85 border border-blue-500/25 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg hover:border-cyan-400/50 hover:bg-[#0c1f48] hover:scale-105 active:scale-95 transition-all cursor-pointer group',
            compact ? 'p-2 sm:p-2.5' : 'p-3.5 sm:p-4'
          )}
        >
          <ShieldCheck className={cn('text-blue-400 stroke-[1.8] group-hover:text-cyan-300 transition-colors', compact ? 'w-4 h-4 mb-1' : 'w-6 h-6 mb-2')} />
          <span className={cn('font-black text-white tracking-tight leading-none', compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl')}>
            {syncFidelity}
          </span>
          <span className={cn('font-bold uppercase text-slate-400', compact ? 'text-[7.5px] tracking-[0.1em] mt-1' : 'text-[8.5px] sm:text-[9.5px] tracking-[0.14em] mt-1.5')}>
            SYNC FIDELITY
          </span>
        </div>
      </div>

      {/* Bottom Action Pill Button */}
      <div className={cn('relative z-10 w-full flex justify-center', compact ? 'mt-4' : 'mt-7')}>
        <button
          type="button"
          onClick={handleAction}
          className={cn(
            'group rounded-full bg-[#0b1c40]/90 hover:bg-[#0f2554] border border-blue-500/45 hover:border-cyan-400/70 text-sky-200 hover:text-white flex items-center justify-center gap-2 font-bold tracking-wide transition-all shadow-[0_0_18px_rgba(37,99,235,0.25)] hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] cursor-pointer',
            compact ? 'w-full max-w-[260px] py-1.5 px-3 text-[10.5px]' : 'w-full max-w-[320px] py-2.5 px-5 text-xs'
          )}
        >
          <Trophy className={cn('text-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]', compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
          <span className="truncate">{actionText}</span>
          <ArrowRight className={cn('text-sky-400 group-hover:translate-x-1 transition-transform shrink-0', compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        </button>
      </div>
    </div>
  );
};

export default GamingTalentScoreCard;
