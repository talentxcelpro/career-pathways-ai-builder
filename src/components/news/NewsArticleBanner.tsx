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
  'the-future-of-work-ai-driven-job-matching': '/images/news/sector-report-executives.jpg',
  'india-gcc-tech-corridor-talent-mobility': '/images/news/sector-report-executives.jpg',
  'autonomous-sourcing-vs-contingency-recruiting': '/images/news/compensation-benchmarks.jpg',
  'rise-of-verifiable-credentials-digital-passport': '/images/news/remote-work-global.jpg',
  'what-is-an-ai-career-platform-boost-job-search': '/images/news/career-guide-candidate.jpg',
  'how-to-build-ats-friendly-resume-ai': '/images/news/career-guide-candidate.jpg',
  'mastering-technical-behavioral-interviews-simulated-coaching': '/images/news/interview-coaching-hr.jpg',
  'salary-negotiation-data-driven-playbook': '/images/news/interview-coaching-hr.jpg',
  'navigating-career-transitions-skill-gap-bridging': '/images/news/career-guide-candidate.jpg',
  'top-10-ai-recruitment-platforms-benchmarked': '/images/news/industry-insider-team.jpg',
  'evaluating-talent-intelligence-platforms-technical-buyers-matrix': '/images/news/industry-insider-team.jpg',
  'the-2026-hr-tech-stack-from-ats-to-agentic-matching': '/images/news/industry-insider-team.jpg',
  'state-of-remote-ai-engineering-teams': '/images/news/remote-work-global.jpg',
  'vector-embeddings-and-knowledge-graphs-in-career-matching': '/images/news/professional-journal-ai.jpg',
  'measuring-predictive-validity-of-automated-resume-scoring': '/images/news/professional-journal-ai.jpg',
  'real-time-skill-graphing-dynamic-ontology-labor-markets': '/images/news/professional-journal-ai.jpg',
  'mitigating-algorithmic-bias-in-automated-candidate-discovery': '/images/news/professional-journal-ai.jpg',
  'the-2026-tier-1-and-tier-2-campus-placement-diagnostic': '/images/news/trade-publication-campus.jpg',
  'gcc-engineering-compensation-benchmark-report': '/images/news/compensation-benchmarks.jpg',
  'cross-border-hiring-surge-middle-east-tech-hubs-tapping-indian-talent': '/images/news/sector-report-executives.jpg',
  'corporate-internship-conversion-rates-indian-gccs': '/images/news/trade-publication-campus.jpg',
  'talentxcel-launches-ai-career-ecosystem-2026': '/images/news/sector-report-executives.jpg',
  'talentxcel-unveils-resume-command-center-ats-intelligence': '/images/news/career-guide-candidate.jpg',
  'global-degrees-scholarships-and-career-pathway-feed': '/images/news/trade-publication-campus.jpg',
  'verified-providers-and-free-learning-certificates': '/images/news/remote-work-global.jpg',
  'india-tech-hiring-trends-2026-skills-over-pedigree': '/images/news/compensation-benchmarks.jpg',
  'mapping-10250-indian-colleges-higher-ed-transparency': '/images/news/trade-publication-campus.jpg',
  'launch-of-verifiable-digital-career-passport': '/images/news/professional-journal-ai.jpg',
  'chatr-communication-suite-integration': '/images/news/industry-insider-team.jpg'
};

export const NewsArticleBanner: React.FC<NewsArticleBannerProps> = ({
  slug,
  category,
  title,
  size = 'card',
  className = '',
  imageUrl
}) => {
  const imgSrc = imageUrl || SLUG_IMAGE_MAP[slug] || '/images/news/sector-report-executives.jpg';
  const isHero = size === 'hero';
  const isDetail = size === 'detail';

  const containerAspect = isDetail 
    ? 'aspect-[21/9] sm:aspect-[24/10] rounded-3xl min-h-[240px]' 
    : isHero 
      ? 'aspect-[16/9] sm:aspect-[21/9] rounded-3xl min-h-[220px]' 
      : 'aspect-[16/9] rounded-t-3xl min-h-[180px]';

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />

      {/* Top Meta Overlay */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
        <Badge className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] sm:text-xs font-bold px-2.5 py-0.5">
          {category}
        </Badge>
        <span className="text-[10px] sm:text-xs font-semibold text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-sky-400" />
          Verified Authority
        </span>
      </div>

      {/* Bottom Brand / Title Overlay (on hero and detail) */}
      {(isHero || isDetail) && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex items-end justify-between">
          <div className="max-w-xl">
            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-sky-400 block mb-0.5">
              TalentXcel Intelligence
            </span>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white line-clamp-2 drop-shadow-md">
              {title}
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-white/80 text-[11px] font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>15-Day Cadence</span>
          </div>
        </div>
      )}
    </div>
  );
};
