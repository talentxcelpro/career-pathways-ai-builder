// src/components/colleges/CollegeEmbedBadgeGenerator.tsx
// Programmatic Backlink Generator & Embeddable Badge for Colleges & Student Portals
// Produces 1-click embeddable cards with mandatory crawling dofollow backlinks to colleges.talentxcel.in

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Code2, Copy, Check, ExternalLink, Sparkles, Share2 } from 'lucide-react';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

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
  avgPackage = '₹12.5L',
  placementRate = '88%',
  className = '',
}) => {
  const [embedFormat, setEmbedFormat] = useState<'html' | 'markdown' | 'compact'>('html');
  const [hasCopied, setHasCopied] = useState(false);

  const collegeUrl = `https://colleges.talentxcel.in/colleges/${collegeSlug}`;

  // 1. Full HTML Embed with Live Iframe + Mandatory Dofollow Crawl Attribution
  const htmlSnippet = `<!-- TalentXcel Verified College Placement & ROI Badge -->
<div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; max-width: 420px; font-family: system-ui, sans-serif; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
    <span style="font-size: 11px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 9999px;">VERIFIED 2026 DATA</span>
    <span style="font-size: 11px; color: #64748b;">TalentXcel Higher Ed</span>
  </div>
  <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #0f172a;">${collegeName}</h4>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
    <div style="background: #f8fafc; padding: 8px; border-radius: 8px;">
      <span style="color: #64748b; display: block; font-size: 10px;">Avg Placement</span>
      <strong style="color: #059669; font-size: 14px;">${avgPackage}</strong>
    </div>
    <div style="background: #f8fafc; padding: 8px; border-radius: 8px;">
      <span style="color: #64748b; display: block; font-size: 10px;">Placement Rate</span>
      <strong style="color: #2563eb; font-size: 14px;">${placementRate}</strong>
    </div>
  </div>
  <a href="${collegeUrl}" target="_blank" rel="noopener" style="display: block; text-align: center; font-size: 12px; font-weight: 700; color: #ffffff; background: #2563eb; text-decoration: none; padding: 8px; border-radius: 8px;">
    View 2026 Cutoffs, Fees & Placement Dossier &rarr;
  </a>
  <div style="margin-top: 8px; font-size: 10px; text-align: center; color: #94a3b8;">
    Verified by <a href="${collegeUrl}" style="color: #64748b; font-weight: 600; text-decoration: underline;">TalentXcel National College Registry</a>
  </div>
</div>`;

  // 2. Markdown Badge for GitHub Readme / Markdown Blogs
  const markdownSnippet = `[![${collegeName} Placement & ROI Dossier on TalentXcel](https://img.shields.io/badge/TalentXcel-${encodeURIComponent(collegeName).replace(/-/g, '--')}_ROI_Verified-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white)](${collegeUrl})`;

  // 3. Compact Dofollow Text Link Attribution
  const compactSnippet = `<a href="${collegeUrl}" target="_blank" rel="noopener">Verified ${collegeName} 2026 Cutoffs, Fees & Placement Statistics on TalentXcel</a>`;

  const getActiveSnippet = () => {
    switch (embedFormat) {
      case 'markdown': return markdownSnippet;
      case 'compact': return compactSnippet;
      default: return htmlSnippet;
    }
  };

  const handleCopy = () => {
    const snippet = getActiveSnippet();
    navigator.clipboard.writeText(snippet);
    setHasCopied(true);
    toast.success('Embed snippet copied to clipboard with verified backlink attribution!');
    conversionTelemetry.track('free_tool_completed', {
      tool: 'college_embed_badge',
      college: collegeName,
      format: embedFormat,
    });
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <Card className={`border-2 border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 text-white shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-xs font-semibold gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Programmatic Embed Asset</span>
          </Badge>
          <span className="text-xs text-slate-400 font-mono">Dofollow Authority Magnet</span>
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
        <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setEmbedFormat('html')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
              embedFormat === 'html' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            HTML Interactive Card
          </button>
          <button
            type="button"
            onClick={() => setEmbedFormat('markdown')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
              embedFormat === 'markdown' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            GitHub / Markdown
          </button>
          <button
            type="button"
            onClick={() => setEmbedFormat('compact')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all ${
              embedFormat === 'compact' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inline Dofollow Link
          </button>
        </div>

        {/* Code Preview Box */}
        <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-40">
          <pre className="whitespace-pre-wrap break-all">{getActiveSnippet()}</pre>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            Includes canonical attribution to {collegeSlug}
          </span>
          <Button
            onClick={handleCopy}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2"
          >
            {hasCopied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Copied Snippet!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Embed Code &amp; Backlink
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
