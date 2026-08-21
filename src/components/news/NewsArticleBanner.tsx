import React from 'react';
import { 
  Sparkles, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  MessageSquare,
  Award,
  Globe,
  Zap,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsArticleBannerProps {
  slug: string;
  category: string;
  title: string;
  size?: 'card' | 'hero' | 'detail';
  className?: string;
}

interface BannerConfig {
  gradient: string;
  accentColor: string;
  glowColor: string;
  icon: React.ElementType;
  kicker: string;
  statBadge: string;
}

const ARTICLE_THEMES: Record<string, BannerConfig> = {
  'talentxcel-launches-ai-career-ecosystem-2026': {
    gradient: 'from-[#0b0f19] via-[#111c38] to-[#0d2a4a]',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    icon: Layers,
    kicker: 'Platform Launch',
    statBadge: '6 Unified Hubs'
  },
  'talentxcel-unveils-resume-command-center-ats-intelligence': {
    gradient: 'from-[#09151c] via-[#0d2826] to-[#081f18]',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    icon: FileText,
    kicker: 'Resume Command Center',
    statBadge: '98% ATS Pass Rate'
  },
  'global-degrees-scholarships-and-career-pathway-feed': {
    gradient: 'from-[#0d1527] via-[#1a1c38] to-[#2b1b17]',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    icon: Globe,
    kicker: 'Education Intelligence',
    statBadge: 'Tuition-Free & Funded'
  },
  'verified-providers-and-free-learning-certificates': {
    gradient: 'from-[#110c24] via-[#20133b] to-[#121e36]',
    accentColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    icon: Award,
    kicker: 'Learning Catalog',
    statBadge: '2,650+ Free Courses'
  },
  'india-tech-hiring-trends-2026-skills-over-pedigree': {
    gradient: 'from-[#09111e] via-[#0c1f33] to-[#092b2e]',
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    icon: TrendingUp,
    kicker: 'Hiring Demand Index',
    statBadge: 'Skills Over Pedigree'
  },
  'mapping-10250-indian-colleges-higher-ed-transparency': {
    gradient: 'from-[#06151f] via-[#0a232f] to-[#0c1a2e]',
    accentColor: '#14B8A6',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    icon: GraduationCap,
    kicker: 'Higher Ed Transparency',
    statBadge: '10,250+ Colleges'
  },
  'launch-of-verifiable-digital-career-passport': {
    gradient: 'from-[#120a21] via-[#19102e] to-[#0a1829]',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    icon: ShieldCheck,
    kicker: 'Digital Credential Identity',
    statBadge: 'Verifiable Proof'
  },
  'chatr-communication-suite-integration': {
    gradient: 'from-[#081326] via-[#101b3b] to-[#1f122e]',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    icon: MessageSquare,
    kicker: 'Real-Time Communication',
    statBadge: 'CHATR Suite'
  }
};

const DEFAULT_THEME: BannerConfig = {
  gradient: 'from-[#0b0f19] via-[#131b2e] to-[#0d2238]',
  accentColor: '#38BDF8',
  glowColor: 'rgba(56, 189, 248, 0.3)',
  icon: Sparkles,
  kicker: 'Career Intelligence',
  statBadge: 'Verified Insight'
};

export const NewsArticleBanner: React.FC<NewsArticleBannerProps> = ({
  slug,
  category,
  title,
  size = 'card',
  className = ''
}) => {
  const config = ARTICLE_THEMES[slug] || DEFAULT_THEME;
  const IconComponent = config.icon;

  const isHero = size === 'hero';
  const isDetail = size === 'detail';

  return (
    <div 
      className={`relative w-full overflow-hidden bg-gradient-to-br ${config.gradient} select-none flex flex-col justify-between text-white ${
        isDetail 
          ? 'h-64 sm:h-80 md:h-96 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10' 
          : isHero 
            ? 'h-64 sm:h-72 lg:h-80 rounded-2xl p-6 sm:p-7' 
            : 'h-48 sm:h-52 rounded-2xl p-5'
      } ${className}`}
    >
      {/* Background Ambient Glow */}
      <div 
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: config.glowColor }}
      />
      <div 
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: config.glowColor }}
      />

      {/* Decorative Subtle SVG Grid Pattern */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${slug}-${size}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug}-${size})`} />
      </svg>

      {/* Top Bar: Category Pill & Brand Emblem */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="text-[11px] font-bold px-2.5 py-0.5 bg-white/10 backdrop-blur-md text-white border-white/15"
          >
            {category}
          </Badge>
          <span 
            className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-md hidden sm:inline-flex items-center gap-1"
            style={{ 
              backgroundColor: `${config.accentColor}20`,
              color: config.accentColor,
              border: `1px solid ${config.accentColor}40`
            }}
          >
            <Zap className="h-3 w-3" />
            {config.statBadge}
          </span>
        </div>

        {/* TalentXcel Vector Gauge Logo */}
        <div className="flex items-center gap-1.5 opacity-95">
          <svg 
            viewBox="0 0 32 32" 
            fill="none" 
            className="w-5 h-5 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
          >
            <path
              d="M 17 28 A 12 12 0 1 1 28 17"
              stroke="#FFFFFF"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 12 20 L 22 10"
              stroke="#38BDF8"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <circle cx="12" cy="20" r="1.8" fill="#38BDF8" />
          </svg>
          <span className="text-[11px] font-extrabold tracking-tight text-white">
            Talent<span className="text-[#38BDF8]">Xcel</span>
          </span>
        </div>
      </div>

      {/* Center Illustrated Icon Area */}
      <div className="relative z-10 my-auto flex items-center gap-4">
        <div 
          className={`flex items-center justify-center rounded-2xl backdrop-blur-xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${
            isDetail 
              ? 'w-16 h-16 sm:w-20 sm:h-20' 
              : isHero 
                ? 'w-14 h-14 sm:w-16 sm:h-16' 
                : 'w-12 h-12'
          }`}
          style={{ 
            backgroundColor: `${config.accentColor}18`,
            borderColor: `${config.accentColor}45`,
            boxShadow: `0 8px 24px ${config.glowColor}`
          }}
        >
          <IconComponent 
            className={isDetail ? 'h-8 w-8 sm:h-10 sm:w-10' : isHero ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'} 
            style={{ color: config.accentColor }} 
          />
        </div>

        <div className="min-w-0 flex-1">
          <p 
            className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-1"
            style={{ color: config.accentColor }}
          >
            {config.kicker}
          </p>
          <h3 className={`font-extrabold text-white leading-tight line-clamp-2 ${
            isDetail 
              ? 'text-xl sm:text-2xl md:text-3xl' 
              : isHero 
                ? 'text-lg sm:text-xl md:text-2xl' 
                : 'text-sm sm:text-base'
          }`}>
            {title}
          </h3>
        </div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] sm:text-xs text-slate-300 font-medium">
        <span className="flex items-center gap-1.5 text-slate-300/90">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accentColor }} />
          Verified Authority
        </span>
        <span className="text-white/70 font-mono tracking-tight text-[10px]">
          TalentXcel Intelligence
        </span>
      </div>
    </div>
  );
};
