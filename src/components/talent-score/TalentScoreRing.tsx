import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export type TalentScoreTier = 'emerging' | 'rising' | 'pro' | 'elite' | 'legend';

interface TalentScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showScore?: boolean;
  showTier?: boolean;
  animated?: boolean;
  highContrast?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<TalentScoreTier, {
  label: string;
  color: string;
  trackColor: string;
  gradient: [string, string];
  min: number;
  max: number;
}> = {
  emerging: {
    label: 'Emerging',
    color: '#64748b',
    trackColor: '#e2e8f0',
    gradient: ['#94a3b8', '#64748b'],
    min: 0,
    max: 299,
  },
  rising: {
    label: 'Rising',
    color: '#2563eb',
    trackColor: '#dbeafe',
    gradient: ['#60a5fa', '#2563eb'],
    min: 300,
    max: 499,
  },
  pro: {
    label: 'Pro',
    color: '#7c3aed',
    trackColor: '#ede9fe',
    gradient: ['#a78bfa', '#7c3aed'],
    min: 500,
    max: 699,
  },
  elite: {
    label: 'Elite',
    color: '#d97706',
    trackColor: '#fef3c7',
    gradient: ['#fbbf24', '#d97706'],
    min: 700,
    max: 899,
  },
  legend: {
    label: 'Legend',
    color: '#ea580c',
    trackColor: '#ffedd5',
    gradient: ['#f97316', '#dc2626'],
    min: 900,
    max: 1000,
  },
};

export function getTier(score: number): TalentScoreTier {
  if (score >= 900) return 'legend';
  if (score >= 700) return 'elite';
  if (score >= 500) return 'pro';
  if (score >= 300) return 'rising';
  return 'emerging';
}

const SIZE_CONFIG = {
  sm: { svg: 80, stroke: 7, fontSize: 'text-lg', labelSize: 'text-[9px]' },
  md: { svg: 120, stroke: 9, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
  lg: { svg: 160, stroke: 11, fontSize: 'text-4xl', labelSize: 'text-xs' },
  xl: { svg: 200, stroke: 13, fontSize: 'text-5xl', labelSize: 'text-sm' },
};

export const TalentScoreRing: React.FC<TalentScoreRingProps> = ({
  score,
  size = 'lg',
  showScore = true,
  showTier = true,
  animated = true,
  highContrast = false,
  className,
}) => {
  const tier = getTier(score);
  const config = TIER_CONFIG[tier];
  const sizeConf = SIZE_CONFIG[size];
  const scoreColor = highContrast ? '#e2e8f0' : config.color;
  const tierColor = highContrast ? '#cbd5e1' : config.color;

  const { circumference, dashOffset, cx, cy, r } = useMemo(() => {
    const svgSize = sizeConf.svg;
    const strokeW = sizeConf.stroke;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r = (svgSize - strokeW * 2 - 4) / 2;
    const circumference = 2 * Math.PI * r;
    const clampedScore = Math.min(1000, Math.max(0, score));
    const pct = clampedScore / 1000;
    const dashOffset = circumference * (1 - pct);
    return { circumference, dashOffset, cx, cy, r };
  }, [score, sizeConf]);

  const svgSize = sizeConf.svg;
  const gradientId = `ts-ring-grad-${tier}-${size}`;

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="rotate-[-90deg]"
          aria-label={`TalentScore: ${score} - ${config.label} tier`}
          role="img"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.gradient[0]} />
              <stop offset="100%" stopColor={config.gradient[1]} />
            </linearGradient>
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={config.trackColor}
            strokeWidth={sizeConf.stroke}
            strokeLinecap="round"
          />

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={sizeConf.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={animated ? {
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            } : undefined}
          />
        </svg>

        {showScore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-black tracking-tighter leading-none', sizeConf.fontSize)} style={{ color: scoreColor }}>
              {score}
            </span>
            {showTier && (
              <span
                className={cn('mt-0.5 font-extrabold uppercase tracking-widest', sizeConf.labelSize)}
                style={{ color: tierColor, opacity: highContrast ? 0.95 : 0.75 }}
              >
                {config.label}
              </span>
            )}
          </div>
        )}
      </div>

      {showTier && (
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            backgroundColor: config.trackColor,
            color: config.color,
          }}
        >
          <span>{config.label} Tier</span>
        </div>
      )}
    </div>
  );
};
