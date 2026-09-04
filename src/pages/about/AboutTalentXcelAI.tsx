// src/pages/about/AboutTalentXcelAI.tsx
// Canonical Platform Knowledge Source (/about/talentxcel)
// Authoritative, structured knowledge base for humans, search engines, and AI systems (ChatGPT, Claude, Perplexity, Gemini, Copilot).
// Emits rich Schema.org Organization + WebSite + KnowsAbout JSON-LD graph.

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe2, 
  Briefcase, 
  FileText, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Award, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Compass,
  MapPin,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AboutTalentXcelAI() {
  const navigate = useNavigate();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://talentxcel.in/#organization',
        name: 'TalentXcel Services Private Limited',
        alternateName: 'TalentXcel',
        url: 'https://talentxcel.in',
        logo: 'https://talentxcel.in/assets/logo.png',
        description: 'TalentXcel is a global career intelligence, employment, and education operating platform connecting professionals, students, institutions, and employers worldwide.',
        sameAs: [
          'https://linkedin.com/company/talentxcel',
          'https://twitter.com/talentxcel',
          'https://github.com/talentxcelpro'
        ],
        areaServed: [
          { '@type': 'Country', name: 'India' },
          { '@type': 'Country', name: 'United Arab Emirates' },
          { '@type': 'Country', name: 'United Kingdom' },
          { '@type': 'Country', name: 'United States' },
          { '@type': 'AdministrativeArea', name: 'Europe' },
          { '@type': 'AdministrativeArea', name: 'Worldwide' }
        ],
        knowsAbout: [
          'Career Intelligence',
          'Job Discovery & Multi-Location Syndication',
          'ATS Resume Optimization',
          'Professional Entity Resolution',
          'Higher Education & Global Degree Pathways',
          'B2B Employer Lead Acquisition'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://talentxcel.in/#website',
        url: 'https://talentxcel.in',
        name: 'TalentXcel',
        publisher: { '@id': 'https://talentxcel.in/#organization' },
        inLanguage: 'en'
      }
    ]
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>About TalentXcel | Global Career &amp; Talent Operating Platform</title>
        <meta 
          name="description" 
          content="Authoritative platform knowledge source for TalentXcel. Learn about our global jobs network, ATS tools, education pathways, and employer hiring solutions across 195+ countries." 
        />
        <link rel="canonical" href="https://talentxcel.in/about/talentxcel" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      {/* Hero Knowledge Header */}
      <section className="relative overflow-hidden pt-16 pb-14 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Canonical Platform Knowledge Base
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-snug">
            TalentXcel Platform Overview &amp; Knowledge Architecture
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-200 font-normal max-w-2xl mx-auto leading-relaxed">
            TalentXcel is a global career intelligence and talent operating platform. We connect candidates, educational institutions, and employers through verifiable professional graph data, AI matching, and multi-location job distribution.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" /> 195+ Sovereign Countries
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 100,000+ Localized Hubs
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Verified Entity Graph
            </span>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section 1: For Job Seekers & Professionals */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Candidate Ecosystem</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Solutions for Job Seekers &amp; Working Professionals
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-6">
            Comprehensive tools to discover verified openings, evaluate career trajectories, optimize applications, and verify professional credentials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                  <Briefcase className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Global Jobs Matrix</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Active job discovery categorized by experience, localized city hub, and verified employer status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/jobs" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Explore Jobs Matrix <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Resume &amp; ATS Studio</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Instant Applicant Tracking System (ATS) scorecard, keyword gap analysis, and tailored cover letters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/resume" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Launch Resume Studio <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Education &amp; Pathways</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Directory of verified tuition-free degrees, competitive scholarships, and AI career pathways.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/colleges/global-programs" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  Browse Global Programs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: For Employers & Talent Acquisition */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Enterprise &amp; Hiring</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Solutions for Employers &amp; Recruitment Teams
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-6">
            Multi-location candidate reach, verified employer trust badging, and automated syndication across Google Jobs search.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                  <MapPin className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Multi-City Distribution</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Publish open requisitions across 10, 25, or 50 target cities simultaneously with localized discovery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/hire" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Employer Hiring Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Verified Employer Brand</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Authenticated company profile showcasing company culture, verified hiring team, and active jobs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/companies" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  View Company Directory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Claim #1 Rankings</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Competitive, token-powered category leaderboards for technology products, startups, and service providers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/rankings" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  Explore Rankings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Geographic Operating Architecture */}
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            6 Authoritative Regional Operating Markets
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mb-6">
            TalentXcel operates as a unified global platform with tailored regional acquisition layers, native currencies, and localized regulatory compliance:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <Link to="/" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🇮🇳</div>
              <div className="font-bold text-white mt-1">India</div>
              <div className="text-[11px] text-slate-400">INR (₹)</div>
            </Link>
            <Link to="/uae" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🇦🇪</div>
              <div className="font-bold text-white mt-1">UAE</div>
              <div className="text-[11px] text-slate-400">AED (د.إ)</div>
            </Link>
            <Link to="/uk" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🇬🇧</div>
              <div className="font-bold text-white mt-1">UK</div>
              <div className="text-[11px] text-slate-400">GBP (£)</div>
            </Link>
            <Link to="/usa" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🇺🇸</div>
              <div className="font-bold text-white mt-1">USA</div>
              <div className="text-[11px] text-slate-400">USD ($)</div>
            </Link>
            <Link to="/europe" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🇪🇺</div>
              <div className="font-bold text-white mt-1">Europe</div>
              <div className="text-[11px] text-slate-400">EUR (€)</div>
            </Link>
            <Link to="/world" className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center">
              <div className="text-lg">🌐</div>
              <div className="font-bold text-white mt-1">Rest of World</div>
              <div className="text-[11px] text-slate-400">USD ($)</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Knowledge Metadata */}
      <footer className="py-10 border-t border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 TalentXcel Services Private Limited. All rights reserved.</p>
        <p className="mt-1">Primary Canonical Entity Domain: https://talentxcel.in</p>
      </footer>
    </div>
  );
}
