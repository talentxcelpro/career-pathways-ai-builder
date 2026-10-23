// src/pages/directory/CollegesAzDirectory.tsx
// Mega-Directory: All Indian Colleges & Universities A-Z grouped by Alphabet & State
// Delivers high-density crawlable links directly to colleges.talentxcel.in/colleges/[slug]

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, MapPin, Search, ArrowRight, Award, ExternalLink } from 'lucide-react';
import { INDIAN_INSTITUTIONS_CATALOG } from '@/data/indianInstitutionsCatalog';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';

export default function CollegesAzDirectory() {
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const states = Array.from(
    new Set(INDIAN_INSTITUTIONS_CATALOG.map((i) => i.location?.state).filter(Boolean))
  ).sort() as string[];

  const filteredInstitutions = INDIAN_INSTITUTIONS_CATALOG.filter((inst) => {
    const nameMatch = !searchTerm || inst.name.toLowerCase().includes(searchTerm.toLowerCase());
    const letterMatch =
      selectedLetter === 'ALL' || inst.name.trim().toUpperCase().startsWith(selectedLetter);
    const stateMatch =
      selectedState === 'ALL' || inst.location?.state === selectedState;
    return nameMatch && letterMatch && stateMatch;
  });

  const pageTitle = 'Indian Colleges & Universities Directory A-Z (10,250+ Institutions) | TalentXcel';
  const metaDesc = 'Complete A-Z directory of 10,250+ accredited Indian colleges and universities. Explore fees, NIRF rankings, highest placements, cutoffs, and campus details.';
  const canonicalUrl = 'https://talentxcel.in/directory/colleges-a-z';

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
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">Colleges A-Z</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/directory" className="text-slate-300 hover:text-white">Directory Hub</Link>
            <Link to="/directory/salaries-by-role" className="text-slate-300 hover:text-white">Salaries</Link>
            <Link to="/directory/jobs-by-city" className="text-slate-300 hover:text-white">Jobs by City</Link>
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
            <span className="text-slate-200 font-semibold">Colleges A-Z</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Higher Education Directory: 10,250+ Indian Colleges A-Z
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Browse accredited universities, national institutes (IITs, NITs, IIMs, AIIMS), state colleges, and private universities across all 36 States &amp; Union Territories of India.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search college name, city, or discipline..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All States / UTs ({states.length})</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Alphabet Tabs */}
          <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
            {ALPHABETS.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition ${
                  selectedLetter === letter
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing <strong className="text-white">{filteredInstitutions.slice(0, 100).length}</strong> of {filteredInstitutions.length.toLocaleString()} institutions</span>
          <span className="font-mono text-blue-400">Partitioned Crawl Mesh</span>
        </div>

        {/* Dense Institutional Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredInstitutions.slice(0, 120).map((inst) => {
            const slug = inst.slug || inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const feeMin = inst.costs?.annualTuition || 100000;
            const avgCtc = inst.outcomes?.averagePackageLpa || 6.5;
            return (
              <Link
                key={inst.id || slug}
                to={`/colleges/${slug}`}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {inst.location?.city || 'India'}, {inst.location?.state || ''}
                    </span>
                    {inst.accreditation?.nirfRank && (
                      <span className="text-blue-400 font-bold font-mono">#{inst.accreditation.nirfRank}</span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition line-clamp-2">
                    {inst.name}
                  </h3>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold">₹{(feeMin / 100000).toFixed(1)}L/yr</span>
                  <span className="text-amber-400 font-semibold">{avgCtc} LPA</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* State Directory Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white">Browse Colleges by State &amp; Region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedState(st);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span className="truncate">{st}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {INDIAN_INSTITUTIONS_CATALOG.filter((i) => i.location?.state === st).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <RelatedSubdomainLinks currentDomain="colleges" />
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}
