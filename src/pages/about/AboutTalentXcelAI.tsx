// src/pages/about/AboutTalentXcelAI.tsx
// Canonical First-Party Brand Entity Page — /about/talentxcel
// Primary first-party canonical representation of TalentXcel for users, Google, and AI discovery systems.
// Upgraded to include Brand Identity, Product Ecosystem, User Segments, How It Works, and News.
// Emits: Organization + WebSite + WebPage + BreadcrumbList JSON-LD (no FAQ schema).

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Building2, Globe2, Briefcase, FileText, Sparkles, GraduationCap, 
  Layers, Award, Users, CheckCircle2, ArrowRight, ShieldCheck,
  Compass, MapPin, TrendingUp, Cpu, Network, BookOpen, 
  BarChart2, UserCheck, ChevronRight, Newspaper, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ── Schema.org JSON-LD ────────────────────────────────────────
const SCHEMA_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://talentxcel.in/#organization',
      name: 'TalentXcel',
      legalName: 'TalentXcel Services Private Limited',
      alternateName: ['TalentXcel', 'TalentXcel AI Career Platform', 'Chatr', 'ChatrChat'],
      url: 'https://talentxcel.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://talentxcel.in/talentxcel-official-logo.png',
        width: 200, height: 200
      },
      description: 'TalentXcel is an AI-powered career operating system connecting job seekers, students, and professionals with verified jobs, ATS-ready resume tools, Indian college data, career learning paths, skill verification, and professional networking.',
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN'
      },
      areaServed: [
        { '@type': 'Country', name: 'India' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'United States' },
        { '@type': 'AdministrativeArea', name: 'Europe' },
        { '@type': 'AdministrativeArea', name: 'Worldwide' }
      ],
      knowsAbout: [
        'AI Career Intelligence', 'Job Discovery & Multi-Location Syndication',
        'ATS Resume Optimization', 'Professional Entity Resolution',
        'Higher Education & Global Degree Pathways', 'B2B Employer Lead Acquisition',
        'Career Passport & Digital Professional Identity', 'Skill Verification & Certifications'
      ],
      sameAs: [
        'https://www.linkedin.com/company/talentxcel-services/',
        'https://talentxcel.in', 'https://talentxcel.co.in', 'https://talentxcel.net',
        'https://chatr.chat', 'https://chatrchat.in', 'https://twitter.com/talentxcel'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@talentxcel.in',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://talentxcel.in/#website',
      url: 'https://talentxcel.in',
      name: 'TalentXcel',
      publisher: { '@id': 'https://talentxcel.in/#organization' },
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://talentxcel.in/jobs?search={search_term_string}' },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'WebPage',
      '@id': 'https://talentxcel.in/about/talentxcel#webpage',
      url: 'https://talentxcel.in/about/talentxcel',
      name: 'About TalentXcel — AI Career Platform | Jobs, Resume, ATS & Employer Solutions',
      description: 'Authoritative first-party information about TalentXcel: products, who uses it, how it works, global markets, and company information.',
      isPartOf: { '@id': 'https://talentxcel.in/#website' },
      about: { '@id': 'https://talentxcel.in/#organization' },
      inLanguage: 'en'
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://talentxcel.in' },
        { '@type': 'ListItem', position: 2, name: 'About TalentXcel', item: 'https://talentxcel.in/about/talentxcel' }
      ]
    }
  ]
};

// ── Data ──────────────────────────────────────────────────────
const PRODUCTS = [
  { icon: Briefcase,   color: 'blue',   label: 'Jobs',            desc: 'Verified job listings by role, location & experience', to: '/jobs' },
  { icon: FileText,    color: 'emerald',label: 'Resume Builder',   desc: 'AI-powered resume builder & ATS optimizer', to: '/resume' },
  { icon: BarChart2,   color: 'sky',    label: 'ATS Scanner',      desc: 'Real-time ATS score and keyword gap analysis', to: '/resume/ats-scanner' },
  { icon: Compass,     color: 'violet', label: 'Career Map',       desc: 'Visual career progression pathways & roadmaps', to: '/career-map' },
  { icon: Layers,      color: 'purple', label: 'Career Passport',  desc: 'Living professional identity & verified credentials', to: '/passport' },
  { icon: BookOpen,    color: 'amber',  label: 'Learning',         desc: 'Skill courses, certifications & upskilling tracks', to: '/learning' },
  { icon: Network,     color: 'cyan',   label: 'Network',          desc: 'Professional networking & peer connections', to: '/network' },
  { icon: Building2,   color: 'rose',   label: 'Employer Hub',     desc: 'Multi-city job posting & employer solutions', to: '/hire' },
  { icon: Globe2,      color: 'indigo', label: 'Companies',        desc: 'Company profiles, culture & hiring intelligence', to: '/companies' },
  { icon: GraduationCap, color: 'teal', label: 'Colleges',        desc: '10,250+ Indian colleges with placement data', to: '/colleges' },
  { icon: TrendingUp,  color: 'orange', label: 'Salary Intel',     desc: 'Role & city salary benchmarks & calculators', to: '/tools' },
  { icon: Award,       color: 'yellow', label: 'Rankings',         desc: 'Industry leaderboards & Claim #1 positions', to: '/rankings' },
];

const USER_SEGMENTS = [
  { label: 'Job Seekers',        icon: Briefcase,    desc: 'Find verified jobs matching experience, skills, and city' },
  { label: 'Students',           icon: GraduationCap,desc: 'Discover colleges, internships, and career roadmaps' },
  { label: 'Working Professionals', icon: UserCheck, desc: 'Grow careers, build a career passport & verified network' },
  { label: 'Employers',          icon: Building2,    desc: 'Post jobs across 100+ cities and hire faster' },
  { label: 'Recruiters',         icon: Users,        desc: 'Source verified candidates from a qualified talent pool' },
  { label: 'Companies',          icon: Globe2,       desc: 'Build employer brand and attract top professionals' },
  { label: 'Colleges',           icon: Layers,       desc: 'Manage campus placements & connect students to employers' },
  { label: 'Training Providers', icon: BookOpen,     desc: 'Connect upskilled learners to career opportunities' },
];

const HOW_IT_WORKS = [
  { step: 'Discover',  desc: 'Find TalentXcel via search, word-of-mouth, or direct navigation' },
  { step: 'Build',     desc: 'Create your resume, career passport, or employer profile' },
  { step: 'Develop',   desc: 'Upskill through courses, learning paths, and career tools' },
  { step: 'Connect',   desc: 'Build your professional network and engage with peers' },
  { step: 'Apply / Hire', desc: 'Apply to verified jobs or hire from a qualified talent pool' },
  { step: 'Grow',      desc: 'Track career progress and reinvest insights into the next cycle' },
];

const REGIONAL_MARKETS = [
  { flag: '🇮🇳', name: 'India',         currency: 'INR (₹)', to: '/' },
  { flag: '🇦🇪', name: 'UAE',           currency: 'AED (د.إ)', to: '/uae' },
  { flag: '🇬🇧', name: 'UK',            currency: 'GBP (£)', to: '/uk' },
  { flag: '🇺🇸', name: 'USA',           currency: 'USD ($)', to: '/usa' },
  { flag: '🇪🇺', name: 'Europe',        currency: 'EUR (€)', to: '/europe' },
  { flag: '🌐', name: 'Rest of World',  currency: 'USD ($)', to: '/world' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function AboutTalentXcelAI() {
  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>About TalentXcel | AI Career Platform — Jobs, Resume, ATS & Employer Solutions</title>
        <meta
          name="description"
          content="TalentXcel is India's AI career platform. Search verified jobs, build ATS-ready resumes, discover colleges, upskill, and connect with employers across India, UAE, UK, USA and worldwide."
        />
        <link rel="canonical" href="https://talentxcel.in/about/talentxcel" />
        <meta property="og:title" content="About TalentXcel | AI Career Platform" />
        <meta property="og:description" content="TalentXcel connects job seekers, students, professionals, and employers through AI-powered career intelligence across India and global markets." />
        <meta property="og:url" content="https://talentxcel.in/about/talentxcel" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(SCHEMA_GRAPH)}</script>
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-8 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/30 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Official TalentXcel Platform
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            TalentXcel — AI-Powered Career &amp; Talent Platform
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TalentXcel connects job seekers, professionals, employers, and educational institutions through career tools, verified profiles, job discovery, hiring solutions, and learning pathways.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" /> 6 Regional Markets
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> 100,000+ Localized Hubs
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Verified Network
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" /> 10,250+ Colleges
            </span>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg px-4 py-2">
              <Link to="/jobs">Browse Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg px-4 py-2">
              <Link to="/resume">Build Resume</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg px-4 py-2">
              <Link to="/hire">Employer Hub</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg px-4 py-2">
              <Link to="/blog">Career Blog</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg px-4 py-2">
              <Link to="/news">News &amp; Research</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 py-10">

        {/* ── Product Ecosystem ────────────────────────────── */}
        <section>
          <div className="mb-2"><Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Product Ecosystem</Badge></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">What TalentXcel Offers</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-8">
            12 integrated career surfaces — all connected, all verified, all AI-powered.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PRODUCTS.map(({ icon: Icon, color, label, desc, to }) => (
              <Link
                key={label}
                to={to}
                className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all block"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${colorMap[color]}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{label}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{desc}</div>
                <div className="flex items-center gap-1 mt-2.5 text-[11px] text-blue-400 font-medium">
                  Open <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Who Uses TalentXcel ──────────────────────────── */}
        <section>
          <div className="mb-2"><Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">User Segments</Badge></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Who Uses TalentXcel</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-8">
            TalentXcel serves all sides of the career and hiring ecosystem.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {USER_SEGMENTS.map(({ label, icon: Icon, desc }) => (
              <div key={label} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <Icon className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section>
          <div className="mb-2"><Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30">Platform Journey</Badge></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">How TalentXcel Works</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-8">
            A simple, reinforcing career cycle — from discovery to sustained growth.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-0">
            {HOW_IT_WORKS.map(({ step, desc }, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center w-full sm:w-1/6 px-2">
                  <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold mb-2">
                    {i + 1}
                  </div>
                  <div className="text-sm font-semibold text-white">{step}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">{desc}</div>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:flex items-start pt-4 text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ── Global Markets ───────────────────────────────── */}
        <section className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="mb-2"><Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30">Global Presence</Badge></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">6 Regional Operating Markets</h2>
          <p className="text-slate-400 text-sm max-w-2xl mb-6">
            TalentXcel operates with native currency support, localized job discovery, and regional compliance in each market.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {REGIONAL_MARKETS.map(({ flag, name, currency, to }) => (
              <Link
                key={name}
                to={to}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors block text-center"
              >
                <div className="text-2xl">{flag}</div>
                <div className="text-xs font-bold text-white mt-1">{name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{currency}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Company Information ──────────────────────────── */}
        <section>
          <div className="mb-2"><Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">Company</Badge></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Official Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-semibold text-white">Legal Name:</span> TalentXcel Services Private Limited
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">HQ:</span> Noida, Uttar Pradesh, India
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Founded:</span> 2024
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Globe2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-white">Primary Domain:</span> talentxcel.in
              </div>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Also on:</span> talentxcel.co.in · talentxcel.net
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Network className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">Related brands:</span> Chatr (chatr.chat), ChatrChat (chatrchat.in)
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-white">Support:</span> support@talentxcel.in
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Link to="/contact" className="text-xs text-blue-400 hover:underline">Contact Us</Link>
                <span className="text-slate-700">·</span>
                <Link to="/news" className="text-xs text-blue-400 hover:underline">Editorial Newsroom (/news)</Link>
                <span className="text-slate-700">·</span>
                <Link to="/blog" className="text-xs text-purple-400 hover:underline">Career Blog (/blog)</Link>
                <span className="text-slate-700">·</span>
                <Link to="/privacypolicy" className="text-xs text-blue-400 hover:underline">Privacy Policy</Link>
                <span className="text-slate-700">·</span>
                <Link to="/terms" className="text-xs text-blue-400 hover:underline">Terms of Service</Link>
                <span className="text-slate-700">·</span>
                <Link to="/security" className="text-xs text-blue-400 hover:underline">Security</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Latest News & Research Publications ──────────────── */}
        <section>
          <div className="mb-2"><Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-xs">Editorial &amp; Publications Hub</Badge></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">TalentXcel Publications &amp; Guides</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-5 max-w-2xl">
            Official sector labor reports, industry benchmark studies, and practical career playbooks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/news"
              className="group p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                  <Newspaper className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-semibold">
                    News &amp; Research
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  TalentXcel Newsroom &amp; Reports (/news)
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Official corporate announcements, labor economics studies, sector benchmark reports, and regional talent mobility publications.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                Browse Publications <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/blog"
              className="group p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] uppercase font-semibold">
                    Career Blog
                  </Badge>
                  <span className="text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded-full font-mono">26 Articles</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  TalentXcel Career Blog &amp; Guides (/blog)
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  26 in-depth guides covering ATS resume optimization, tech salary negotiations, vector matching architectures, interview preparation, and career pathways.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                Read 26+ Blog Guides <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </section>

      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 TalentXcel Services Private Limited. All rights reserved.</p>
        <p className="mt-2 space-x-3">
          <span className="text-slate-400">Official Website:</span> <a href="https://talentxcel.in" className="text-blue-400 hover:underline">talentxcel.in</a>
          <span className="text-slate-700">·</span>
          <Link to="/news" className="text-blue-400 hover:underline">Newsroom (/news)</Link>
          <span className="text-slate-700">·</span>
          <Link to="/blog" className="text-purple-400 hover:underline">Career Blog (/blog)</Link>
          <span className="text-slate-700">·</span>
          <Link to="/jobs" className="text-blue-400 hover:underline">Jobs Matrix</Link>
          <span className="text-slate-700">·</span>
          <Link to="/colleges" className="text-blue-400 hover:underline">Colleges</Link>
        </p>
      </footer>
    </div>
  );
}
