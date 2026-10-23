// src/pages/directory/DirectoryIndex.tsx
// Master High-Density HTML Directory Hub for Apex talentxcel.in
// Groups all 10,252 Colleges, 550+ Job/Salary hubs, and 50 Tier-2 cities so every catalog URL is <= 2 hops from apex root.

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  Building2,
  TrendingUp,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen
} from 'lucide-react';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';

export default function DirectoryIndex() {
  const pageTitle = 'TalentXcel Comprehensive Directory — Colleges, Salaries, Jobs & City Hubs (2026)';
  const metaDesc = 'Master directory for TalentXcel. Explore 10,252 accredited Indian colleges, compensation percentiles for 30+ tech roles, active job hubs across 50 Tier-2 cities, and career roadmaps.';
  const canonicalUrl = 'https://talentxcel.in/directory';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-500 font-black">Talent</span>Xcel
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">Master Directory</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/directory/colleges-a-z" className="text-slate-300 hover:text-white">Colleges A-Z</Link>
            <Link to="/directory/salaries-by-role" className="text-slate-300 hover:text-white">Salaries by Role</Link>
            <Link to="/directory/jobs-by-city" className="text-slate-300 hover:text-white">Jobs by City</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            12,450+ Verified Entities • Zero-Hop Crawler Navigation
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            TalentXcel Comprehensive Directory
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Forensic directory indexing every accredited institution, salary curve, localized job hub, and skill certification across India and global markets.
          </p>
        </div>

        {/* 3 Major Directory Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colleges Portal */}
          <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Higher Education &amp; Colleges A-Z</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Over 10,250 accredited colleges and universities in India. Browse annual tuition fees, NIRF 2024-2025 rankings, verified highest &amp; average CTC placement records, and entrance exam cutoffs.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Catalog Inventory</span>
                <span className="font-mono font-bold text-white">10,250+</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tuition-Free Global Degrees</span>
                <span className="font-mono font-bold text-emerald-400">100+</span>
              </div>
              <Link
                to="/directory/colleges-a-z"
                className="w-full py-2.5 text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                Browse Colleges Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Salary Intelligence Portal */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Salary Benchmarks by Role &amp; City</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empirical tech salary curves for 30+ software engineering, AI, DevOps, data science, and product roles cross-matched with 50 Indian cities and global tech hubs.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Canonical Job Roles</span>
                <span className="font-mono font-bold text-white">30+ Roles</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Percentile Models</span>
                <span className="font-mono font-bold text-emerald-400">P25, P50, P75, P90</span>
              </div>
              <Link
                to="/directory/salaries-by-role"
                className="w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                Browse Salary Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Jobs & City Hubs Portal */}
          <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Jobs by City &amp; Tier-2 Hubs</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Localized job hubs across 50 Tier-2 and Tier-3 Indian cities including Indore, Bhopal, Patna, Varanasi, Coimbatore, and Surat. Verified active openings and hiring companies.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Indexed City Hubs</span>
                <span className="font-mono font-bold text-white">50 Cities</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Active Vacancies Catalog</span>
                <span className="font-mono font-bold text-purple-400">1,500+ Links</span>
              </div>
              <Link
                to="/directory/jobs-by-city"
                className="w-full py-2.5 text-center bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                Browse City Job Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Cross-Reference Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">Top Programmatic Portals &amp; Open Datasets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <Link to="/benchmarks/india-tech-salary-report-2026" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              📊 India Tech Salary Report 2026
            </Link>
            <Link to="/benchmarks/tier2-city-jobs-index-2026" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              🏙️ Tier-2 City Jobs Index 2026
            </Link>
            <Link to="/colleges/global-programs" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              🌍 €0 Tuition Global Degrees
            </Link>
            <Link to="/colleges/scholarships" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              🎓 Global Scholarships Directory
            </Link>
            <Link to="/resume/ats-check" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              ⚡ Free ATS Resume Score
            </Link>
            <Link to="/colleges/pathway" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              🧭 6-Step Career Roadmap
            </Link>
            <Link to="/network" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              🌐 Professional Talent Network
            </Link>
            <Link to="/hire" className="p-3 bg-slate-950 rounded-xl hover:text-blue-400 transition">
              💼 Recruiter OS Hiring Engine
            </Link>
          </div>
        </div>

        <RelatedSubdomainLinks currentDomain="core" />
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}
