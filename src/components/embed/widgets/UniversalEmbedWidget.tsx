// src/components/embed/widgets/UniversalEmbedWidget.tsx
// TalentXcel Embed & Distribution Engine â€” Universal Responsive Embed Widget

import React, { useEffect, useRef } from 'react';
import {
  EmbedAsset,
  EmbedConfiguration,
  CollegeEmbedData,
  JobMarketEmbedData,
  SkillsEmbedData,
  CareerEmbedData,
  ResumeEmbedData,
  EmployerEmbedData
} from '@/types/embed';
import { embedTelemetry } from '@/services/embed/EmbedTelemetryService';
import {
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Zap,
  ArrowRight,
  Sparkles,
  MapPin,
  Building2,
  FileCheck2,
  Award
} from 'lucide-react';

interface UniversalEmbedWidgetProps {
  asset: EmbedAsset;
  config?: Partial<EmbedConfiguration>;
  isInteractivePreview?: boolean;
}

export const UniversalEmbedWidget: React.FC<UniversalEmbedWidgetProps> = ({
  asset,
  config = {},
  isInteractivePreview = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = config.theme || 'dark';
  const layout = config.layout || 'standard';
  const showHeader = config.showHeader !== false;
  const showFooter = config.showFooter !== false;
  const showMetrics = config.showMetrics !== false;
  const showCta = config.showCta !== false;

  // Notify parent iframe of content height for automatic responsive resizing
  useEffect(() => {
    if (isInteractivePreview) return;

    embedTelemetry.trackEvent(asset.id, asset.category, 'render', { theme, layout });

    const sendHeight = () => {
      if (containerRef.current && window.parent && window.parent !== window) {
        const height = containerRef.current.offsetHeight + 4;
        window.parent.postMessage(
          { type: 'txc-embed-resize', assetId: asset.id, height },
          '*'
        );
      }
    };

    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, [asset.id, asset.category, theme, layout, isInteractivePreview]);

  const handleAttributionClick = () => {
    if (!isInteractivePreview) {
      embedTelemetry.trackEvent(asset.id, asset.category, 'attribution_click', { theme, layout });
    }
  };

  const handleCtaClick = () => {
    if (!isInteractivePreview) {
      embedTelemetry.trackEvent(asset.id, asset.category, 'cta_click', { theme, layout });
    }
  };

  // Theme styles
  const isLight = theme === 'light';
  const isSlate = theme === 'slate';

  const themeClasses = isLight
    ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
    : isSlate
    ? 'bg-slate-900 text-slate-100 border-slate-800 shadow-md'
    : 'bg-[#090d16] text-white border-slate-800/90 shadow-xl';

  const cardBgClasses = isLight
    ? 'bg-slate-50 border-slate-200/80 text-slate-800'
    : isSlate
    ? 'bg-slate-800/60 border-slate-700/60 text-slate-200'
    : 'bg-slate-900/80 border-slate-800/80 text-slate-200';

  const subtextClasses = isLight ? 'text-slate-500' : 'text-slate-400';
  const dividerClasses = isLight ? 'border-slate-200' : 'border-slate-800/80';

  // Category Icon Resolver
  const getCategoryIcon = () => {
    switch (asset.category) {
      case 'college':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'job_market':
        return <MapPin className="w-4 h-4 text-blue-400" />;
      case 'skills':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'career':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'resume':
        return <FileCheck2 className="w-4 h-4 text-rose-400" />;
      case 'employer':
        return <Building2 className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full font-sans rounded-2xl border transition-all duration-200 overflow-hidden box-border ${themeClasses}`}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      {/* 1. Header Bar */}
      {showHeader && (
        <div className={`px-4 py-3 flex items-center justify-between border-b ${dividerClasses}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Intelligence
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              TalentXcel {asset.category.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* 2. Core Body */}
      <div className={`p-4 sm:p-5 ${layout === 'compact' ? 'space-y-3' : 'space-y-4'}`}>
        {/* Title Section */}
        <div>
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0 mt-0.5">
              {getCategoryIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-extrabold tracking-tight leading-snug line-clamp-2 ${layout === 'compact' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                {asset.data.title}
              </h3>
              {asset.data.subtitle && layout !== 'compact' && (
                <p className={`text-xs mt-1 line-clamp-1 ${subtextClasses}`}>
                  {asset.data.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Specific Highlights */}
        {renderCategoryContent(asset, cardBgClasses, subtextClasses, layout)}

        {/* 3. Verified Metrics Grid */}
        {showMetrics && asset.data.metrics && asset.data.metrics.length > 0 && (
          <div className={`grid gap-2 sm:gap-2.5 ${asset.data.metrics.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
            {asset.data.metrics.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex flex-col justify-center ${cardBgClasses}`}
              >
                <span className={`text-[10px] font-medium leading-none mb-1 ${subtextClasses}`}>
                  {m.label}
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 truncate">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 4. Action CTA */}
        {showCta && asset.data.ctaText && (
          <a
            href={asset.canonicalUrl}
            target="_blank"
            rel="noopener"
            onClick={handleCtaClick}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all text-center no-underline"
          >
            <span>{asset.data.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </a>
        )}
      </div>

      {/* 5. Attribution Footer */}
      {showFooter && (
        <div className={`px-4 py-2.5 border-t text-[11px] flex flex-wrap items-center justify-between gap-2 ${dividerClasses} ${isLight ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
          <div className="flex items-center gap-1.5">
            <span className={subtextClasses}>Powered by</span>
            <a
              href={asset.canonicalUrl}
              target="_blank"
              rel="noopener"
              onClick={handleAttributionClick}
              className="font-bold text-blue-500 hover:text-blue-400 no-underline hover:underline flex items-center gap-1"
            >
              <span>TalentXcel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <span className={`text-[10px] ${subtextClasses}`}>
            Updated {asset.data.lastUpdated} â€¢ {asset.data.sourceLabel}
          </span>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sub-renderers for Category Depth
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderCategoryContent(
  asset: EmbedAsset,
  cardBg: string,
  subtext: string,
  layout: string
) {
  if (layout === 'compact') return null;

  switch (asset.category) {
    case 'college': {
      const col = asset.data as CollegeEmbedData;
      if (!col.topRecruiters || col.topRecruiters.length === 0) return null;
      return (
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${cardBg}`}>
          <span className={`font-semibold text-[11px] block ${subtext}`}>
            Top Verified Placement Partners:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {col.topRecruiters.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium text-[11px] border border-blue-500/20"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case 'career': {
      const car = asset.data as CareerEmbedData;
      return (
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`font-semibold text-[11px] ${subtext}`}>Transition Path:</span>
            <span className="font-bold text-emerald-400">â‚¹{car.currentAvgCtcLakhs}L â†’ â‚¹{car.targetAvgCtcLakhs}L CTC</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {car.keySkillGaps?.map((g, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium text-[10px] border border-purple-500/20">
                + {g}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case 'skills': {
      const sk = asset.data as SkillsEmbedData;
      return (
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${cardBg}`}>
          <span className={`font-semibold text-[11px] block ${subtext}`}>Core Tech Stack Focus:</span>
          <div className="flex flex-wrap gap-1.5">
            {sk.relatedSkills?.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-medium text-[11px] border border-amber-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case 'job_market': {
      const jm = asset.data as JobMarketEmbedData;
      return (
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${cardBg}`}>
          <span className={`font-semibold text-[11px] block ${subtext}`}>Leading Employers Hiring in {jm.hubName}:</span>
          <div className="flex flex-wrap gap-1.5">
            {jm.topHiringCompanies?.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-medium text-[11px] border border-blue-500/20">
                {c}
              </span>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
