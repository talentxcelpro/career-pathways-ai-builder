// src/components/embed/EmbedGeneratorModal.tsx
// TalentXcel Embed & Distribution Engine â€” Universal Embed Generator Modal

import React, { useState } from 'react';
import {
  EmbedAsset,
  EmbedConfiguration,
  EmbedFormat,
  EmbedTheme,
  EmbedLayout
} from '@/types/embed';
import { embedRegistry } from '@/services/embed/EmbedRegistry';
import { UniversalEmbedWidget } from './widgets/UniversalEmbedWidget';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Copy,
  Check,
  Code2,
  FileCode,
  Share2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';

interface EmbedGeneratorModalProps {
  asset: EmbedAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedGeneratorModal: React.FC<EmbedGeneratorModalProps> = ({
  asset,
  isOpen,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<EmbedFormat>('iframe');
  const [theme, setTheme] = useState<EmbedTheme>('dark');
  const [layout, setLayout] = useState<EmbedLayout>('standard');
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'tablet' | 'full'>('full');
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  if (!asset) return null;

  const config: EmbedConfiguration = {
    theme,
    layout,
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  };

  const codeSnippet = embedRegistry.generateEmbedCode(asset, selectedFormat, config);

  const handleCopy = (format?: EmbedFormat) => {
    const fmt = format || selectedFormat;
    const snippet = embedRegistry.generateEmbedCode(asset, fmt, config);
    navigator.clipboard.writeText(snippet);
    setHasCopied(true);
    toast.success(`Copied ${formatLabel(fmt)} code to clipboard!`);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const formatLabel = (fmt: EmbedFormat): string => {
    switch (fmt) {
      case 'iframe': return 'HTML Iframe';
      case 'javascript': return 'Async JavaScript';
      case 'markdown': return 'Markdown Badge';
      case 'attribution_link': return 'Editorial Attribution Link';
    }
  };

  const previewWidthClass =
    previewWidth === 'mobile'
      ? 'max-w-[360px]'
      : previewWidth === 'tablet'
      ? 'max-w-[480px]'
      : 'max-w-[580px]';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0b0f19] border border-slate-800 text-white p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Embed &amp; Distribution Engine</span>
            </Badge>

            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Public Data â€¢ Safe Backlink
            </span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            Embed &ldquo;{asset.title}&rdquo;
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-400">
            Publish live, verified TalentXcel career and education intelligence directly onto your portal, blog, or student community.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Left Column: Customization & Snippet Generation (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Format Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Select Embed Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['iframe', 'javascript', 'markdown', 'attribution_link'] as EmbedFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      selectedFormat === fmt
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/25'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="truncate">{formatLabel(fmt)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Styling Customization */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  2. Customize Appearance
                </span>
                <span className="text-[10px] text-slate-400">Source attribution locked</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Theme Selector */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Theme</label>
                  <div className="flex gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                    {(['dark', 'light', 'slate'] as EmbedTheme[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                          theme === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Selector */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Layout</label>
                  <div className="flex gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                    {(['compact', 'standard', 'expanded'] as EmbedLayout[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLayout(l)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                          layout === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Generated Code Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  3. Copy Ready-to-Use Snippet
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {formatLabel(selectedFormat)}
                </span>
              </div>

              <div className="relative bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-44 shadow-inner">
                <pre className="whitespace-pre-wrap break-all leading-relaxed">{codeSnippet}</pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <a
                  href={asset.canonicalUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  View Original Intelligence Dossier
                </a>

                <Button
                  onClick={() => handleCopy()}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy {formatLabel(selectedFormat)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Live Third-Party Preview
                </label>

                {/* Viewport Width Controls */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                  <button
                    type="button"
                    onClick={() => setPreviewWidth('mobile')}
                    title="Mobile preview (360px)"
                    className={`p-1 rounded ${previewWidth === 'mobile' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewWidth('tablet')}
                    title="Tablet preview (480px)"
                    className={`p-1 rounded ${previewWidth === 'tablet' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
                  >
                    <Tablet className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewWidth('full')}
                    title="Desktop preview (Full)"
                    className={`p-1 rounded ${previewWidth === 'full' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 min-h-[340px] flex items-center justify-center overflow-hidden">
                <div className={`w-full transition-all duration-300 ${previewWidthClass}`}>
                  <UniversalEmbedWidget
                    asset={asset}
                    config={config}
                    isInteractivePreview={true}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Embed renders asynchronously. No dependencies required on host site.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
