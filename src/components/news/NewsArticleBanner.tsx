import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsArticleBannerProps {
  slug: string;
  category: string;
  title: string;
  size?: 'card' | 'hero' | 'detail';
  className?: string;
  imageUrl?: string;
}

const SLUG_IMAGE_MAP: Record<string, string> = {
  // Sector Reports
  'the-future-of-work-ai-driven-job-matching': '/images/news/sector-report-executives.jpg',
  'india-gcc-tech-corridor-talent-mobility': '/images/news/remote-work-global.jpg',
  'autonomous-sourcing-vs-contingency-recruiting': '/images/news/compensation-benchmarks.jpg',
  'rise-of-verifiable-credentials-digital-passport': '/images/news/professional-journal-ai.jpg',

  // Career Guides
  'what-is-an-ai-career-platform-boost-job-search': '/images/news/career-guide-candidate.jpg',
  'how-to-build-ats-friendly-resume-ai': '/images/news/ats-resume-engineer.jpg',
  'mastering-technical-behavioral-interviews-ai-coaching': '/images/news/interview-coaching-hr.jpg',
  'guide-to-tuition-free-higher-education-worldwide': '/images/news/tuition-free-university.jpg',

  // Industry Insider
  'top-10-ai-powered-job-search-platforms-2026': '/images/news/ai-job-platform.jpg',
  'top-7-ats-resume-scanners-compared-2026': '/images/news/ats-scanner-comparison.jpg',
  'talentxcel-vs-traditional-job-portals-comparison': '/images/news/industry-insider-team.jpg',
  'top-developer-engineering-communities-direct-hiring': '/images/news/developer-community.jpg',

  // Professional Journals
  'unlocking-career-potential-ai-resume-prep-tools': '/images/news/ats-resume-engineer.jpg',
  'mechanics-of-ats-parsing-engines-technical-analysis': '/images/news/professional-journal-ai.jpg',
  'decentralized-career-passports-skill-validation': '/images/news/remote-work-global.jpg',
  'modernizing-college-placement-cells-tpo-gateways': '/images/news/trade-publication-campus.jpg',

  // Trade Publications
  '2026-state-of-recruitment-report-ai-adoption': '/images/news/sector-report-executives.jpg',
  '2026-resume-parser-benchmark-format-failure-study': '/images/news/ats-scanner-comparison.jpg',
  '10250-colleges-nirf-placement-roi-index': '/images/news/tuition-free-university.jpg',
  'uae-middle-east-tech-recruitment-velocity-index-q3-2026': '/images/news/compensation-benchmarks.jpg'
};

export const NewsArticleBanner: React.FC<NewsArticleBannerProps> = ({
  slug,
  category,
  title,
  size = 'card',
  className = '',
  imageUrl
}) => {
  // Discard generic placeholder / lovable-uploads fallback URLs in favor of dedicated AI editorial photography
  const isPlaceholder = !imageUrl || imageUrl.includes('lovable-uploads') || imageUrl.includes('placeholder');
  const imgSrc = !isPlaceholder 
    ? imageUrl 
    : (SLUG_IMAGE_MAP[slug] || '/images/news/sector-report-executives.jpg');

  const isHero = size === 'hero';
  const isDetail = size === 'detail';

  const containerAspect = isDetail 
    ? 'aspect-[21/9] sm:aspect-[24/10] rounded-2xl min-h-[220px]' 
    : isHero 
      ? 'aspect-[16/9] sm:aspect-[21/9] rounded-2xl min-h-[200px]' 
      : 'aspect-[16/9] rounded-t-2xl min-h-[170px]';

  return (
    <div className={'relative w-full overflow-hidden select-none ' + containerAspect + ' ' + className}>
      {/* Real AI-Generated Editorial Human Photograph */}
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Subtle Editorial Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      {/* Top Meta Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <Badge className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
          {category}
        </Badge>
        <span className="text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 flex items-center gap-1 shadow-sm">
          <Sparkles className="h-3 w-3 text-sky-400" />
          Verified Authority
        </span>
      </div>

      {/* Bottom Editorial Badge Overlay (Hero and Detail) - Clean, avoids repeating the title */}
      {(isHero || isDetail) && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-sky-300 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15">
            TalentXcel Intelligence
          </span>
          <div className="flex items-center gap-1 text-white/90 text-[10px] sm:text-[11px] font-medium bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>15-Day Cadence</span>
          </div>
        </div>
      )}
    </div>
  );
};
