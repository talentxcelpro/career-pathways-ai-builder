// src/pages/embed/EmbedStandaloneView.tsx
// TalentXcel Embed & Distribution Engine â€” Standalone Isolated Embed View (Rendered inside Host iframes)

import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { embedRegistry } from '@/services/embed/EmbedRegistry';
import { EmbedAssetCategory, EmbedTheme, EmbedLayout } from '@/types/embed';
import { UniversalEmbedWidget } from '@/components/embed/widgets/UniversalEmbedWidget';
import { AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const EmbedStandaloneView: React.FC = () => {
  const { category: rawCategory, slug: rawSlug, assetId: rawAssetId } = useParams<{
    category?: string;
    slug?: string;
    assetId?: string;
  }>();

  const [searchParams] = useSearchParams();

  const theme = (searchParams.get('theme') || 'dark') as EmbedTheme;
  const layout = (searchParams.get('layout') || 'standard') as EmbedLayout;

  const asset = useMemo(() => {
    // 1. Direct assetId route
    if (rawAssetId) {
      return embedRegistry.getAssetById(rawAssetId);
    }

    // 2. Category & slug route
    if (rawCategory && rawSlug) {
      return embedRegistry.getAsset(rawCategory as EmbedAssetCategory, rawSlug);
    }

    // 3. Query param fallback: ?category=college&slug=...
    const qCat = searchParams.get('category') as EmbedAssetCategory | null;
    const qSlug = searchParams.get('slug');
    if (qCat && qSlug) {
      return embedRegistry.getAsset(qCat, qSlug);
    }

    return null;
  }, [rawCategory, rawSlug, rawAssetId, searchParams]);

  if (!asset) {
    return (
      <div className="min-h-[220px] w-full flex items-center justify-center p-4 bg-[#090d16] text-white font-sans">
        <Helmet>
          <meta name="robots" content="noindex, follow" />
          <title>TalentXcel Intelligence Asset</title>
        </Helmet>
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 text-center max-w-md w-full shadow-lg">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">
            TalentXcel Intelligence Dossier
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            This verified data asset is currently being refreshed from the national registry.
          </p>
          <a
            href="https://www.talentxcel.in"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 underline"
          >
            <span>Explore TalentXcel Intelligence</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-2 sm:p-3 box-border flex items-center justify-center bg-transparent font-sans">
      <Helmet>
        {/* Strict SEO Guardrails: Embed routes must NEVER compete with canonical source URLs */}
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={asset.canonicalUrl} />
        <title>{asset.title} â€” Verified TalentXcel Intelligence</title>
      </Helmet>

      <UniversalEmbedWidget
        asset={asset}
        config={{
          theme,
          layout,
          showHeader: searchParams.get('header') !== 'false',
          showFooter: searchParams.get('footer') !== 'false',
          showMetrics: searchParams.get('metrics') !== 'false',
          showCta: searchParams.get('cta') !== 'false'
        }}
      />
    </div>
  );
};

export default EmbedStandaloneView;
