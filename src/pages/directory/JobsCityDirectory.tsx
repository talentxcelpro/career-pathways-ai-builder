// src/pages/directory/JobsCityDirectory.tsx
// Mega-Directory: Jobs by City across 50 Tier-1, Tier-2, and Tier-3 Indian Hubs
// Dense link grid connecting all 50 cities to role-specific openings and local employer hubs

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Briefcase, Search, ArrowRight, Building2, Users } from 'lucide-react';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';
import { TOP_50_INDIAN_HUBS } from '@/data/tier2LocationsData';

const HIGH_DEMAND_ROLES = [
  { slug: 'software-engineer', name: 'Software Engineer' },
  { slug: 'frontend-developer', name: 'Frontend Developer' },
  { slug: 'backend-developer', name: 'Backend Developer' },
  { slug: 'data-analyst', name: 'Data Analyst' },
  { slug: 'qa-automation-engineer', name: 'QA Engineer' },
  { slug: 'devops-engineer', name: 'DevOps Engineer' },
  { slug: 'product-manager', name: 'Product Manager' },
  { slug: 'content-writer', name: 'Content Writer' }
];

export default function JobsCityDirectory() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const hubEntries = Object.entries(TOP_50_INDIAN_HUBS);
  const states = Array.from(new Set(hubEntries.map(([_, h]) => h.state))).sort();

  const filteredHubs = hubEntries.filter(([slug, hub]) => {
    const textMatch = !searchTerm || hub.name.toLowerCase().includes(searchTerm.toLowerCase()) || hub.state.toLowerCase().includes(searchTerm.toLowerCase());
    const stateMatch = selectedState === 'ALL' || hub.state === selectedState;
    return textMatch && stateMatch;
  });

  const pageTitle = 'India Jobs Directory by City (50+ Tier-1 & Tier-2 Hubs) | TalentXcel';
  const metaDesc = 'Explore active job vacancies, hiring companies, and salary benchmarks across 50 Indian cities including Indore, Bhopal, Patna, Varanasi, Lucknow, and Coimbatore.';
  const canonicalUrl = 'https://talentxcel.in/directory/jobs-by-city';

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
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono">Jobs by City</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/directory" className="text-slate-300 hover:text-white">Directory Hub</Link>
            <Link to="/directory/colleges-a-z" className="text-slate-300 hover:text-white">Colleges A-Z</Link>
            <Link to="/directory/salaries-by-role" className="text-slate-300 hover:text-white">Salaries by Role</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-slate-200">Home</Link>
            <span>/</span>
            <Link to="/directory" className="hover:text-slate-200">Directory</Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">Jobs by City</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Indian Employment Hubs: Jobs Across 50 Cities
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Direct gateway to verified employment, local IT parks, manufacturing corridors, and hiring startups across Tier-1 metros and rapidly expanding Tier-2 tech destinations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by city name or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All States ({states.length})</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Cities Grid with Direct Deep Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHubs.map(([slug, hub]) => (
            <div
              key={slug}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-4 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-purple-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {hub.name}, {hub.state}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                    {hub.stats.jobs}+ Openings
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Jobs &amp; Hiring in {hub.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {hub.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                  <span>🏢 {hub.stats.companies} Companies</span>
                  <span>•</span>
                  <span>💰 Avg {hub.stats.avgSalary}</span>
                </div>
              </div>

              {/* Role Sub-Links */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Top Role Portals</span>
                <div className="flex flex-wrap gap-1.5">
                  {HIGH_DEMAND_ROLES.slice(0, 4).map((r) => (
                    <Link
                      key={r.slug}
                      to={`/jobs/${r.slug}/${slug}`}
                      className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-[10px] text-slate-300 hover:text-white transition"
                    >
                      {r.name} in {hub.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={`/locations/${slug}`}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    View City Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/jobs?location=${slug}`}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                  >
                    All {hub.name} Jobs &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <RelatedSubdomainLinks currentDomain="jobs" />
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}
