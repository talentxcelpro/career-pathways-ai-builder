// src/pages/employers/GlobalEmployerAcquisition.tsx
// Global Employer Job Acquisition & Invitation Portal (/hire & /employers/post-job)
// Value Prop: "Distribute Your Job Across 100,000+ Locations and Submit It for Google Jobs Discovery"
// Strictly emits WebPage & Service schema (Zero JobPosting schema)

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Globe2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Send, 
  ShieldCheck,
  Code2,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { GLOBAL_COUNTRIES } from '@/config/jobs/countriesData';

export default function GlobalEmployerAcquisition() {
  const navigate = useNavigate();
  const [selectedLocationsCount, setSelectedLocationsCount] = useState<number>(10);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('in');
  const [demoRole, setDemoRole] = useState<string>('Senior Full Stack Engineer');
  const [demoCompany, setDemoCompany] = useState<string>('Acme Global Technologies');

  const selectedCountry = GLOBAL_COUNTRIES.find((c) => c.code === selectedCountryCode) || GLOBAL_COUNTRIES[0];

  // Reach estimation formula
  const estimatedReach = Math.round(selectedLocationsCount * 1420);
  const estimatedDiscoveryTime = '24-48 Hours';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Distribute Your Job Across 100,000+ Locations | TalentXcel Global Network</title>
        <meta 
          name="description" 
          content="Publish your open roles across 100,000+ locations in 195+ countries. TalentXcel automatically generates Google-compliant JobPosting structured data and submits your postings for accelerated Google Jobs discovery." 
        />
        <link rel="canonical" href="https://talentxcel.in/hire" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'TalentXcel Global Employer Job Distribution Network',
            description: 'Multi-location job syndication and Google Jobs Search schema submission engine.',
            provider: {
              '@type': 'Organization',
              name: 'TalentXcel Services Private Limited',
              url: 'https://talentxcel.in',
            },
            areaServed: 'Worldwide',
          })}
        </script>
      </Helmet>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            Global 100K Job Network · 195+ Countries
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Distribute Your Job Across{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              100,000+ Locations
            </span>{' '}
            and Submit It for Google Jobs Discovery
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reach top talent worldwide. TalentXcel automatically validates your posting against Google Search Console standards, builds authoritative Schema.org JobPosting JSON-LD, and dispatches it through our Google Indexing pipeline.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/jobs/post/multi-location')}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Post Across Multiple Locations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/jobs/post')}
              className="w-full sm:w-auto px-8 py-6 text-base font-medium border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              Post a Single Job
            </Button>
          </div>

          {/* Key Metric Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-white">100,000+</div>
              <div className="text-xs text-slate-400 mt-1">Available Global Locations</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-blue-400">195+</div>
              <div className="text-xs text-slate-400 mt-1">Sovereign Countries</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">GSC Schema Compliant</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-bold text-purple-400">25K / Shard</div>
              <div className="text-xs text-slate-400 mt-1">Automated XML Sitemaps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Global Reach & Google Rich Result Simulator */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-sky-400 border-sky-400/30 bg-sky-400/10 mb-3">
            Interactive Employer Simulator
          </Badge>
          <h2 className="text-3xl font-bold text-white">
            See How Your Role Synergizes with Google Search
          </h2>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Configure your target cities and preview your live Google Jobs rich snippet and geographic reach.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reach Calculator */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Multi-Location Reach Estimator
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select your target country market and number of localized city spawns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Target Country Market
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {GLOBAL_COUNTRIES.slice(0, 8).map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => setSelectedCountryCode(country.code)}
                        className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          selectedCountryCode === country.code
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-sm">{country.flagEmoji}</span>
                        <span className="truncate">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Target Cities to Spawn
                    </label>
                    <span className="text-sm font-bold text-blue-400">
                      {selectedLocationsCount} Cities
                    </span>
                  </div>
                  <Slider
                    value={[selectedLocationsCount]}
                    onValueChange={(val) => setSelectedLocationsCount(val[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>1 City (Single Job)</span>
                    <span>25 Cities (Regional Hub)</span>
                    <span>50 Cities (Multi-National)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Estimated Candidate Pool Reach:</span>
                    <span className="font-bold text-emerald-400 text-base">
                      ~{estimatedReach.toLocaleString()} Candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Google-Compliant Job Records Generated:</span>
                    <span className="font-bold text-white">
                      {selectedLocationsCount} Distinct URLs
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Google Indexing Acceleration Queue:</span>
                    <span className="font-bold text-sky-400">
                      Instant Dispatch (URL_UPDATED)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Google Rich Results Card Simulator */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    Google Jobs Card Live Preview
                  </CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Schema Valid
                  </Badge>
                </div>
                <CardDescription className="text-slate-400">
                  Exact rendering format generated for Google for Jobs structured data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simulated Google Job Snippet */}
                <div className="p-5 rounded-xl bg-white text-slate-900 shadow-md border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-700 hover:underline cursor-pointer">
                        {demoRole}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                        {demoCompany}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                          {selectedCountry.flagEmoji} {selectedCountry.name}
                        </span>
                        <span>•</span>
                        <span>Full-time</span>
                        <span>•</span>
                        <span>Via TalentXcel</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      TX
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <ClockIcon className="w-3.5 h-3.5 text-slate-400" /> Just posted
                    </span>
                    <span className="px-3 py-1 rounded bg-blue-600 text-white font-medium">
                      Apply on TalentXcel
                    </span>
                  </div>
                </div>

                {/* Schema Metadata Audit Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-400">
                  <div className="text-slate-200 font-semibold flex items-center gap-1 mb-2">
                    <Code2 className="w-3.5 h-3.5 text-sky-400" /> Auto-Generated JobPosting Schema
                  </div>
                  <div><span className="text-blue-400">@type</span>: &quot;JobPosting&quot;</div>
                  <div><span className="text-blue-400">title</span>: &quot;{demoRole}&quot;</div>
                  <div><span className="text-blue-400">hiringOrganization</span>: &quot;{demoCompany}&quot;</div>
                  <div><span className="text-blue-400">jobLocation.addressCountry</span>: &quot;{selectedCountry.code.toUpperCase()}&quot;</div>
                  <div><span className="text-blue-400">datePosted</span>: [Authoritative ISO timestamp]</div>
                  <div><span className="text-blue-400">directApply</span>: true</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4 Pillars of the 100K Job Network */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Why Global Employers Choose TalentXcel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multi-Location Spawning</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Post 1 job and spawn 5, 20, or 50 distinct local records across our 100,000 locations without thin doorway penalties.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Strict GSC Compliance</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Our fail-closed schema validator guarantees authoritative dates, verified employers, and zero fabricated data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Indexing API Acceleration</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Individual job URLs are immediately queued for Google Indexing API publishing, expediting search discovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="py-16 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white">
            Ready to Expand Your Talent Acquisition Reach?
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Create your employer account today or start drafting your multi-location campaign in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/jobs/post/multi-location')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-semibold"
            >
              Launch Multi-Location Campaign
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
