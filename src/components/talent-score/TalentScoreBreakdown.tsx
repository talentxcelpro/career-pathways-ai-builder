import React from 'react';
import { Activity, BookOpen, Briefcase, ChevronRight, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTier, type TalentScoreTier } from './TalentScoreRing';

interface SubScore {
  key: string;
  label: string;
  value: number;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  tip: string;
}

interface TalentScoreBreakdownProps {
  score: number;
  subScores?: Partial<Record<string, number>>;
  className?: string;
  onActionClick?: (key: string) => void;
}

const DEFAULT_SUB_SCORES: SubScore[] = [
  {
    key: 'profile',
    label: 'Identity Strength',
    value: 0,
    weight: 30,
    icon: UserRound,
    tip: 'Add portfolio links and proof of work to strengthen your market identity.',
  },
  {
    key: 'skills',
    label: 'Verified Capability',
    value: 0,
    weight: 25,
    icon: Activity,
    tip: 'Complete two skill assessments to turn listed skills into verified proof.',
  },
  {
    key: 'activity',
    label: 'Market Momentum',
    value: 0,
    weight: 20,
    icon: Briefcase,
    tip: 'Apply to three Precision Match roles this week to increase momentum.',
  },
  {
    key: 'network',
    label: 'Ecosystem Influence',
    value: 0,
    weight: 15,
    icon: Users,
    tip: 'Connect with five professionals in your target ecosystem companies.',
  },
  {
    key: 'learning',
    label: 'Skill Evolution',
    value: 0,
    weight: 10,
    icon: BookOpen,
    tip: 'Complete one active skill module to strengthen your performance index.',
  },
];

const TIER_COLORS: Record<TalentScoreTier, { bar: string; bg: string; text: string }> = {
  emerging: { bar: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  rising: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  pro: { bar: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-700' },
  elite: { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  legend: { bar: 'bg-gradient-to-r from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700' },
};

function defaultValueFor(score: number, key: string) {
  const base = Math.round((score / 1000) * 100);
  const offsets: Record<string, number> = {
    profile: 8,
    skills: 2,
    activity: -4,
    network: -8,
    learning: -2,
  };
  return Math.max(0, Math.min(100, base + (offsets[key] ?? 0)));
}

export const TalentScoreBreakdown: React.FC<TalentScoreBreakdownProps> = ({
  score,
  subScores = {},
  className,
  onActionClick,
}) => {
  const tier = getTier(score);
  const colors = TIER_COLORS[tier];

  const items = DEFAULT_SUB_SCORES.map((item) => ({
    ...item,
    value: Math.min(100, subScores[item.key] ?? defaultValueFor(score, item.key)),
  }));

  const nextTierMap: Record<TalentScoreTier, { name: string; threshold: number } | null> = {
    emerging: { name: 'Rising', threshold: 300 },
    rising: { name: 'Pro', threshold: 500 },
    pro: { name: 'Elite', threshold: 700 },
    elite: { name: 'Legend', threshold: 900 },
    legend: null,
  };
  const nextTier = nextTierMap[tier];
  const ptsToNext = nextTier ? nextTier.threshold - score : 0;

  return (
    <div className={cn('space-y-6 edge-to-edge', className)}>
      {nextTier && (
        <div className={cn('rounded-[32px] border p-8 shadow-xl', colors.bg, 'border-current/10')}>
          <div className="mb-4 flex items-center justify-between">
            <span className={cn('text-[10px] font-apple-heavy uppercase tracking-[0.2em]', colors.text)}>
              {ptsToNext} PTS TO {nextTier.name.toUpperCase()} STATUS
            </span>
            <span className={cn('text-sm font-apple-heavy', colors.text)}>
              {score} / {nextTier.threshold}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/60 shadow-inner">
            <div
              className={cn('h-full rounded-full transition-all duration-1000 shadow-sm', colors.bar)}
              style={{ width: `${Math.min(100, (score / nextTier.threshold) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onActionClick?.(item.key)}
              className="group w-full rounded-[28px] border border-slate-100 bg-white p-6 text-left transition-all duration-300 hover:border-blue-200 hover:shadow-2xl hover:scale-[1.02]"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn('rounded-[16px] p-2.5 shadow-sm', colors.bg)}>
                    <Icon className={cn('h-5 w-5', colors.text)} />
                  </div>
                  <div>
                    <p className="text-base font-apple-heavy text-slate-900">{item.label}</p>
                    <p className="text-[10px] font-apple-bold uppercase tracking-widest text-slate-400 mt-1">
                      {item.weight}% Performance Weight
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn('tabular-nums text-xl font-apple-heavy', colors.text)}>
                    {item.value}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-50 shadow-inner">
                <div
                  className={cn('h-full rounded-full transition-all duration-1000 shadow-sm', colors.bar)}
                  style={{ width: `${item.value}%` }}
                />
              </div>

              {item.value < 80 && (
                <div className="mt-4 flex items-center gap-2 text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                  <span className="text-[9px] font-apple-heavy uppercase tracking-widest bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg">Tactical Move</span>
                  <p className="text-xs font-apple-medium leading-relaxed">
                    {item.tip}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
