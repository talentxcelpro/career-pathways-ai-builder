// src/pages/employers/GlobalEmployerAcquisition.tsx
// Global Employer Job Acquisition & Hiring Portal (/hire & /employers/post-job)
// Value Prop: "Hire Top Global Talent Across 100,000+ Locations Worldwide"
// Emits WebPage & Service schema (Zero JobPosting schema on listing hubs)

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
  Users,
  Briefcase,
  Clock,
  Award
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

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Hire Top Global Talent Across 100,000+ Locations | TalentXcel</title>
        <meta 
          name="description" 
          content="Post your jobs across 100,000+ locations in 195+ countries. Reach verified candidates worldwide on TalentXcel and Google Jobs search." 
        />
        <link rel="canonical" href="https://talentxcel.in/hire" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'TalentXcel Global Employer Job Distribution Network',
            description: 'Multi-location job syndication and Google Jobs search discovery platform.',
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
      <section className="relative overflow-hidden pt-16 pb-14 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-5">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            Global Employer Network · 195+ Countries
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-snug">
            Hire Top Talent Across{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              100,000+ Locations
            </span>{' '}
            Worldwide
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 font-normal max-w-2xl mx-auto leading-relaxed">
            Reach qualified professionals across 195+ countries. Post your job opening once to distribute it across TalentXcel's global talent network and eligible Google Jobs discovery.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/jobs/post/multi-location')}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Post to Multiple Locations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/jobs/post')}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-2 border-slate-600 hover:border-slate-400 bg-slate-900/90 hover:bg-slate-800 text-white hover:text-white shadow-sm transition-all cursor-pointer"
            >
              Post a Single Job
            </Button>
          </div>

          {/* Key Metric Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-white">100,000+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Target Cities &amp; Hubs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-blue-400">195+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Countries Covered</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">Google Jobs</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Eligible Job Discovery</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-purple-400">Direct Connect</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Verified Candidate Applications</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Global Reach & Google Rich Result Simulator */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <Badge variant="outline" className="text-sky-400 border-sky-400/30 bg-sky-400/10 mb-2.5">
            Interactive Hiring Calculator
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            See Your Candidate Reach Across Cities
          </h2>
          <p className="text-slate-300 mt-2 max-w-xl mx-auto text-sm sm:text-base">
            Select your target markets and preview how your opening appears to active candidates on Google Jobs and TalentXcel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reach Calculator */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  Candidate Reach Estimator
                </CardTitle>
                <CardDescription className="text-slate-300 text-xs sm:text-sm">
                  Choose your target country and the number of cities you want to hire from.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5 block">
                    Target Country Market
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GLOBAL_COUNTRIES.slice(0, 8).map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => setSelectedCountryCode(country.code)}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          selectedCountryCode === country.code
                            ? 'bg-blue-600/25 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{country.flagEmoji}</span>
                        <span className="truncate">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Cities to Target
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
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1 City (Single Location)</span>
                    <span>25 Cities (Regional Focus)</span>
                    <span>50 Cities (Nationwide / Global)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Estimated Job Seekers Reached:</span>
                    <span className="font-bold text-emerald-400 text-base">
                      ~{estimatedReach.toLocaleString()} Candidates
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Target City Openings:</span>
                    <span className="font-bold text-white">
                      {selectedLocationsCount} Localized Listings
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Search Discovery:</span>
                    <span className="font-bold text-sky-400">
                      Immediate Active Search &amp; Discovery
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Google Rich Results Card Simulator */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 text-white">
                    <Search className="w-5 h-5 text-blue-400" />
                    Google Jobs Card Preview
                  </CardTitle>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Search Verified
                  </Badge>
                </div>
                <CardDescription className="text-slate-300 text-xs sm:text-sm">
                  How candidates see your job listing in search results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simulated Google Job Snippet */}
                <div className="p-5 rounded-xl bg-white text-slate-900 shadow-lg border border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-700 hover:underline cursor-pointer">
                        {demoRole}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                        {demoCompany}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5 font-medium">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {selectedCountry.flagEmoji} {selectedCountry.name}
                        </span>
                        <span>•</span>
                        <span>Full-time</span>
                        <span>•</span>
                        <span>Via TalentXcel</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      TX
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Just posted
                    </span>
                    <span className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors">
                      Apply on TalentXcel
                    </span>
                  </div>
                </div>

                {/* Direct Applicant Pipeline & Matching Features */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 text-slate-200">
                  <div className="text-white font-semibold flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Included Hiring Benefits
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant publication across TalentXcel and Google Jobs search</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct candidate applications delivered straight to your employer dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI-powered candidate screening and resume skill match scoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3 Pillars of Employer Hiring */}
      <section className="py-14 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Why Companies Hire on TalentXcel
            </h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-xl mx-auto">
              Everything you need to attract, evaluate, and hire outstanding professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multi-City Job Distribution</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Publish your open position across multiple top talent hubs simultaneously to attract the best local and remote candidates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Verified Employer Credibility</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Display your verified company profile, branding, and hiring team to build trust with top-tier candidates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Faster Candidate Discovery</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Your listings are optimized for Google Search and TalentXcel matching so qualified professionals find your role fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="py-14 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Hire Your Next Great Team Member?
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Create your employer account today or start drafting your multi-location campaign in minutes.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/jobs/post/multi-location')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Post Across Multiple Cities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/jobs/post')}
              className="border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-white px-8 py-6 text-base font-medium shadow-md cursor-pointer"
            >
              Post a Single Job
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
