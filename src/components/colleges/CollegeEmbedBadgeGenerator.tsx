// src/components/colleges/CollegeEmbedBadgeGenerator.tsx
// Programmatic Backlink Generator & Embeddable Badge for Colleges & Student Portals
// Powered by the Central TalentXcel Embed & Distribution Engine

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Code2, Copy, Check, ExternalLink, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { embedRegistry } from '@/services/embed/EmbedRegistry';
import { EmbedFormat } from '@/types/embed';
import { EmbedGeneratorModal } from '@/components/embed/EmbedGeneratorModal';

interface CollegeEmbedBadgeGeneratorProps {
  collegeName: string;
  collegeSlug: string;
  avgPackage?: string | number;
  placementRate?: string | number;
  className?: string;
}

export const CollegeEmbedBadgeGenerator: React.FC<CollegeEmbedBadgeGeneratorProps> = ({
  collegeName,
  collegeSlug,
  avgPackage = 'â‚¹12.5L',
  placementRate = '88%',
  className = '',
}) => {
  const [embedFormat, setEmbedFormat] = useState<EmbedFormat>('iframe');
  const [hasCopied, setHasCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resolve canonical asset from registry or generate dynamically
  const asset = embedRegistry.getAsset('college', collegeSlug) || embedRegistry.buildCollegeAsset(collegeSlug) || {
    id: `txc-college-${collegeSlug}`,
    category: 'college' as const,
    slug: collegeSlug,
    title: `${collegeName} Placement & Outcome Intelligence`,
    subtitle: `Verified placement statistics and career outcomes`,
    sourceUrl: `https://www.talentxcel.in/colleges/${collegeSlug}`,
    canonicalUrl: `https://www.talentxcel.in/colleges/${collegeSlug}`,
    version: 'v1',
    status: 'active' as const,
    verified: true,
    updatedAt: '2026-11-20',
    data: {
      title: `${collegeName} Placement & Outcome Intelligence`,
      subtitle: `Verified institutional placement data`,
      collegeName,
      slug: collegeSlug,
      city: 'India',
      state: 'India',
      placementRate: typeof placementRate === 'number' ? placementRate : 88,
      verified: true,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel National College Registry',
      sourceUrl: `https://www.talentxcel.in/colleges/${collegeSlug}`,
      metrics: [
        { label: 'Avg Placement', value: avgPackage, highlight: true, color: 'emerald' },
        { label: 'Placement Rate', value: placementRate, highlight: true, color: 'blue' }
      ]
    },
    attribution: {
      brand: 'TalentXcel',
      brandUrl: 'https://www.talentxcel.in',
      sourceUrl: `https://www.talentxcel.in/colleges/${collegeSlug}`,
      displayText: `Verified ${collegeName} Placement Data on TalentXcel`,
      rel: 'noopener'
    }
  };

  const snippet = embedRegistry.generateEmbedCode(asset, embedFormat, {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setHasCopied(true);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <>
      <Card className={`border-2 border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 text-white shadow-xl rounded-2xl overflow-hidden ${className}`}>
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Programmatic Embed Asset</span>
            </Badge>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Public Data
            </span>
          </div>
          <CardTitle className="text-lg sm:text-xl font-black text-white">
            Embed 2026 Placement &amp; ROI Card on Your Blog / Site
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-300">
            Placement cells, student bloggers, and alumni can embed live statistics for {collegeName} with one click.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {/* Format Selector Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setEmbedFormat('iframe')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                embedFormat === 'iframe' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML Iframe
            </button>
            <button
              type="button"
              onClick={() => setEmbedFormat('javascript')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                embedFormat === 'javascript' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Async JS
            </button>
            <button
              type="button"
              onClick={() => setEmbedFormat('markdown')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                embedFormat === 'markdown' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              GitHub / Markdown
            </button>
            <button
              type="button"
              onClick={() => setEmbedFormat('attribution_link')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                embedFormat === 'attribution_link' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Editorial Link
            </button>
          </div>

          {/* Code Preview Box */}
          <div className="relative bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-36">
            <pre className="whitespace-pre-wrap break-all">{snippet}</pre>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs h-9 rounded-xl flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Customize &amp; Live Preview</span>
            </Button>

            <Button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Copied Snippet!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Embed Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Customization Modal */}
      <EmbedGeneratorModal
        asset={asset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
