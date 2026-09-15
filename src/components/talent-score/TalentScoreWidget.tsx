import React from 'react';
import { Link } from 'react-router-dom';
import { useTalentScore } from '@/hooks/useTalentScore';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Compact TalentScore card designed to sit at the top of profile and CommandCenter views.
 */
export function TalentScoreWidget() {
  const { data: score, isLoading } = useTalentScore();

  if (isLoading) {
    return (
      <div className="mx-6 mt-6 rounded-[32px] overflow-hidden glass-pro" style={{ height: 88 }}>
        <div className="skeleton-wave w-full h-full opacity-20" />
      </div>
    );
  }

  if (!score) return null;

  const pct = Math.round((score.total / score.maxTotal) * 100);
  const deltaLabel = score.weeklyDelta > 0 ? `+${score.weeklyDelta}` : `${score.weeklyDelta}`;
  const topPercentile = Math.max(1, 100 - score.percentile);

  return (
    <Link
      to="/talent-score"
      className="mx-6 mt-6 flex items-center gap-6 px-6 py-5 rounded-[32px] glass-pro border-white/20 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 group relative overflow-hidden"
    >
      {/* Animated Glow Background */}
      <div 
        className="absolute -inset-24 opacity-20 blur-[60px] rounded-full pointer-events-none group-hover:opacity-30 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle, ${score.gradeColor}, transparent)` }}
      />

      <div className="relative shrink-0 flex items-center justify-center" style={{ width: 64, height: 64 }}>
        <svg width={64} height={64} viewBox="0 0 64 64" className="drop-shadow-sm">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={5} />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={score.gradeColor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
            transform="rotate(-90 32 32)"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${score.gradeColor}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-apple-heavy tracking-tighter leading-none" style={{ color: score.gradeColor }}>
            {score.total}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-apple-heavy text-slate-950 tracking-tight">TalentScore</h3>
          <Badge 
            className="rounded-lg border-none font-apple-heavy text-[10px] uppercase tracking-widest px-2.5 py-1"
            style={{ background: `${score.gradeColor}15`, color: score.gradeColor }}
          >
            Tier {score.grade}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-apple-heavy text-slate-500 uppercase tracking-widest">
              {deltaLabel} Momentum
            </span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">
            Top {topPercentile}% Global
          </span>
        </div>
      </div>

      <div className="h-12 w-12 rounded-2xl bg-white/50 border border-white/50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-white transition-all duration-300 shadow-sm">
        <ChevronRight className="w-5 h-5" />
      </div>
    </Link>
  );
}


