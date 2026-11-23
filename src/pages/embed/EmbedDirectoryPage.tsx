// src/pages/embed/EmbedDirectoryPage.tsx
// TalentXcel Embed & Distribution Engine â€” Public Embed Discovery Directory

import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { embedRegistry } from '@/services/embed/EmbedRegistry';
import { EmbedAsset, EmbedAssetCategory } from '@/types/embed';
import { EmbedGeneratorModal } from '@/components/embed/EmbedGeneratorModal';
import { UniversalEmbedWidget } from '@/components/embed/widgets/UniversalEmbedWidget';
import {
  Code2,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Zap,
  TrendingUp,
  FileCheck2,
  Building2,
  Copy,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EmbedDirectoryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<EmbedAssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAssetForModal, setActiveAssetForModal] = useState<EmbedAsset | null>(null);

  const assets = useMemo(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    return embedRegistry.listPublicAssets(cat, searchQuery);
  }, [selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    return embedRegistry.getRegistryStats();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    all: <Layers className="w-4 h-4" />,
    college: <GraduationCap className="w-4 h-4 text-emerald-400" />,
    job_market: <Briefcase className="w-4 h-4 text-blue-400" />,
    skills: <Zap className="w-4 h-4 text-amber-400" />,
    career: <TrendingUp className="w-4 h-4 text-purple-400" />,
    resume: <FileCheck2 className="w-4 h-4 text-rose-400" />,
    employer: <Building2 className="w-4 h-4 text-cyan-400" />
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Embeddable Career &amp; Education Intelligence Widgets | TalentXcel</title>
        <meta
          name="description"
          content="Embed live verified college placement statistics, job market indices, salary benchmarks, and career pathways onto your blog or student portal for free."
        />
        <link rel="canonical" href="https://www.talentxcel.in/embeds" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-[#0e1628] to-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TalentXcel Organic Distribution Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Embed Verified Career &amp; Education Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn TalentXcel&apos;s verified public data into reusable, responsive widgets for your college portal, career blog, community, or company careers page.
          </p>

          {/* Key Stats Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Truth Layer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>HTML, JS &amp; Markdown Formats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Zero Cost â€¢ Instant Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Catalog Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search colleges (e.g. IIT Madras), cities (Indore), skills (Python), or careers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-slate-900/80 border-slate-800 text-white rounded-xl placeholder:text-slate-500 text-xs sm:text-sm focus-visible:ring-blue-500"
              />
            </div>

            <Button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              variant="outline"
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-11 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Assets' },
              { id: 'college', label: 'College Placements' },
              { id: 'job_market', label: 'Job Market Hubs' },
              { id: 'skills', label: 'Skills & Tech' },
              { id: 'career', label: 'Career Transitions' },
              { id: 'resume', label: 'ATS Benchmarks' },
              { id: 'employer', label: 'Verified Employers' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {categoryIcons[tab.id]}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-slate-800 text-slate-300 text-[10px] font-semibold uppercase tracking-wider border-slate-700">
                    {asset.category.replace('_', ' ')}
                  </Badge>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {asset.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {asset.subtitle}
                  </p>
                </div>

                {/* Mini Metric Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  {asset.data.metrics.slice(0, 2).map((m, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block truncate">{m.label}</span>
                      <strong className="text-emerald-400 font-bold">{m.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <Button
                  onClick={() => setActiveAssetForModal(asset)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Get Embed Code</span>
                </Button>

                <a
                  href={asset.canonicalUrl}
                  target="_blank"
                  rel="noopener"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  title="View Source Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <div className="text-center py-16 space-y-3 bg-slate-900/30 rounded-2xl border border-slate-800/80">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No assets match your search</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching for a different keyword or select another category from the filters above.
            </p>
          </div>
        )}
      </section>

      {/* Publisher Benefits & Guidelines */}
      <section className="border-t border-slate-800/80 bg-slate-950/60 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Top Publishers &amp; Colleges Use TalentXcel Embeds
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Designed specifically for institutional placement cells, higher ed portals, career influencers and technical bloggers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Always Fresh &amp; Verified</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Widgets automatically pull updated metrics from TalentXcel&apos;s verified national catalog without requiring manual updates on your website.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Zero Host Site Impact</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lightweight async loading (&lt; 3KB loader) with isolated styling prevents any CSS bleed or slowdown on your publishing domain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Clean Editorial Attribution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Legitimate, transparent attribution with canonical citations directly back to the original source dossier. No deceptive SEO tactics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Generator Modal */}
      <EmbedGeneratorModal
        asset={activeAssetForModal}
        isOpen={Boolean(activeAssetForModal)}
        onClose={() => setActiveAssetForModal(null)}
      />
    </div>
  );
};

export default EmbedDirectoryPage;
