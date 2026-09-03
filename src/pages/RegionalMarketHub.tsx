// src/pages/RegionalMarketHub.tsx
// TalentXcel Global Organic Acquisition Operating System (GO-AOS)
// Authoritative Regional Market Landing Hub Component (/uae, /uk, /usa, /europe, /world)
// Enforces Strict SEO Invariants: Emits CollectionPage & ItemList Schema (STRICTLY ZERO JobPosting on Hubs)

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Search, 
  Users, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getRegionalMarketByPrefix, RegionalMarketConfig } from '@/lib/seo/regionalTaxonomy';

export const RegionalMarketHub: React.FC = () => {
  const { regionCode, subSurface } = useParams<{ regionCode?: string; subSurface?: string }>();
  const market: RegionalMarketConfig = getRegionalMarketByPrefix(regionCode || '');

  const canonicalUrl = `https://talentxcel.in${market.urlPrefix}`;

  // Structured Data: CollectionPage + ItemList + BreadcrumbList
  // STRICT INVARIANT: ZERO JobPosting structured data on listing hubs!
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonicalUrl,
        "url": canonicalUrl,
        "name": `TalentXcel ${market.name} — Career Operating System & Hiring Network`,
        "description": `Explore verified career pathways, high-intent jobs, employer solutions, and talent intelligence in ${market.name}.`,
        "inLanguage": market.defaultLocale,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://talentxcel.in/#website",
          "url": "https://talentxcel.in",
          "name": "TalentXcel",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "TalentXcel Global",
            "item": "https://talentxcel.in",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": market.name,
            "item": canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-16">
      <Helmet>
        <title>{`TalentXcel ${market.name} — Jobs, Employers & Career Intelligence`}</title>
        <meta 
          name="description" 
          content={`Connect with verified employers, explore top careers in ${market.name}, optimize your resume, and benchmark compensation in ${market.defaultCurrency}.`} 
        />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/60 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{market.flagEmoji}</span>
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
              Regional Market Hub • {market.name}
            </Badge>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Career & Hiring Operating System for {market.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {market.strategicFocus}. Verified talent networks, direct employer hiring, local {market.defaultCurrency} compensation benchmarks, and accredited educational pathways.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={market.urlPrefix ? `${market.urlPrefix}/jobs` : '/jobs'}>
              <Button className="rounded-xl h-10 px-5 text-xs font-bold gap-2">
                <Briefcase className="h-4 w-4" />
                Explore {market.name} Jobs
              </Button>
            </Link>
            <Link to={market.urlPrefix ? `${market.urlPrefix}/employers` : '/hire'}>
              <Button variant="outline" className="rounded-xl h-10 px-5 text-xs font-bold gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Hire Talent in {market.name}
              </Button>
            </Link>
            <Link to="/resume">
              <Button variant="ghost" className="rounded-xl h-10 px-4 text-xs font-semibold gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                ATS Resume Checker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Regional Surfaces */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Jobs & Hiring */}
          <Card className="rounded-2xl border shadow-xs bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Verified Jobs & Openings</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Explore real, non-scraped roles with transparent {market.defaultCurrency} compensation packages.
              </p>
            </div>
            <div className="pt-2">
              <Link to={market.urlPrefix ? `${market.urlPrefix}/jobs` : '/jobs'} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Browse Job Directory <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* Pillar 2: Employer Acquisition */}
          <Card className="rounded-2xl border shadow-xs bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Employer Multi-Location Composer</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Directly post jobs across {market.name} and reach verified professionals across borders.
              </p>
            </div>
            <div className="pt-2">
              <Link to={market.urlPrefix ? `${market.urlPrefix}/employers` : '/hire'} className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                Post Jobs in {market.name} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* Pillar 3: Educational Pathways & Campus */}
          <Card className="rounded-2xl border shadow-xs bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Campus & Training Ecosystem</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Partner with accredited universities, colleges, and vocational certification providers.
              </p>
            </div>
            <div className="pt-2">
              <Link to={market.urlPrefix ? `${market.urlPrefix}/colleges` : '/colleges'} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                Explore Institutional Programs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Featured Regional Cities */}
        <Card className="rounded-2xl border shadow-xs bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Key Employment & Tech Centers in {market.name}</h3>
              <p className="text-xs text-muted-foreground">Localized employment hubs with verified search demand</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">{market.featuredCountries.length} Countries</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {market.featuredCountries.map((c) => (
              <div key={c.code} className="p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <div className="text-xs font-bold text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">Currency: {c.currency} • Locale: {c.locale}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegionalMarketHub;
