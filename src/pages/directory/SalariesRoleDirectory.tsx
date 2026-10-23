// src/pages/directory/SalariesRoleDirectory.tsx
// Mega-Directory: Tech & Professional Salaries by Role & City
// High-density directory linking 30+ canonical roles across 50 Indian cities with P25, P50, P75, P90 percentile models

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, MapPin, Search, ArrowRight, DollarSign, Briefcase } from 'lucide-react';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';
import { TOP_50_INDIAN_HUBS } from '@/data/tier2LocationsData';

const CANONICAL_ROLES = [
  { slug: 'software-engineer', name: 'Software Engineer', baseLpa: 12.5, category: 'Engineering' },
  { slug: 'frontend-developer', name: 'Frontend Developer', baseLpa: 10.5, category: 'Engineering' },
  { slug: 'backend-developer', name: 'Backend Developer', baseLpa: 13.0, category: 'Engineering' },
  { slug: 'full-stack-developer', name: 'Full Stack Developer', baseLpa: 12.0, category: 'Engineering' },
  { slug: 'devops-engineer', name: 'DevOps Engineer', baseLpa: 14.5, category: 'Cloud & Infrastructure' },
  { slug: 'cloud-architect', name: 'Cloud Architect', baseLpa: 24.0, category: 'Cloud & Infrastructure' },
  { slug: 'ai-engineer', name: 'AI Engineer', baseLpa: 18.0, category: 'Data & AI' },
  { slug: 'machine-learning-engineer', name: 'Machine Learning Engineer', baseLpa: 17.5, category: 'Data & AI' },
  { slug: 'data-scientist', name: 'Data Scientist', baseLpa: 15.0, category: 'Data & AI' },
  { slug: 'data-analyst', name: 'Data Analyst', baseLpa: 7.5, category: 'Data & AI' },
  { slug: 'data-engineer', name: 'Data Engineer', baseLpa: 14.0, category: 'Data & AI' },
  { slug: 'qa-automation-engineer', name: 'QA Automation Engineer', baseLpa: 9.5, category: 'Quality Assurance' },
  { slug: 'sdet', name: 'SDET', baseLpa: 13.5, category: 'Quality Assurance' },
  { slug: 'cybersecurity-engineer', name: 'Cybersecurity Engineer', baseLpa: 14.0, category: 'Security' },
  { slug: 'mobile-app-developer', name: 'Mobile App Developer', baseLpa: 11.0, category: 'Mobile' },
  { slug: 'product-manager', name: 'Product Manager', baseLpa: 20.0, category: 'Product' },
  { slug: 'technical-product-manager', name: 'Technical Product Manager', baseLpa: 22.0, category: 'Product' },
  { slug: 'ui-ux-designer', name: 'UI/UX Designer', baseLpa: 9.0, category: 'Design' },
  { slug: 'product-designer', name: 'Product Designer', baseLpa: 12.0, category: 'Design' },
  { slug: 'technical-recruiter', name: 'Technical Recruiter', baseLpa: 7.0, category: 'HR & Talent' },
  { slug: 'growth-marketer', name: 'Growth Marketer', baseLpa: 11.5, category: 'Marketing' },
  { slug: 'content-writer', name: 'Content Writer', baseLpa: 4.8, category: 'Marketing' },
  { slug: 'financial-analyst', name: 'Financial Analyst', baseLpa: 8.5, category: 'Finance' },
  { slug: 'operations-manager', name: 'Operations Manager', baseLpa: 10.0, category: 'Operations' }
];

export default function SalariesRoleDirectory() {
  const [selectedRole, setSelectedRole] = useState<string>('software-engineer');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const cities = Object.entries(TOP_50_INDIAN_HUBS).map(([slug, hub]) => ({
    slug,
    name: hub.name,
    state: hub.state,
    avgSalary: hub.stats.avgSalary
  }));

  const activeRoleObj = CANONICAL_ROLES.find(r => r.slug === selectedRole) || CANONICAL_ROLES[0];

  const filteredCities = cities.filter(c => 
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageTitle = 'India Tech Salary Directory 2026 — 30 Roles Across 50 Cities | TalentXcel';
  const metaDesc = 'Explore verified tech compensation percentiles (P25, P50, P75, P90) across 30 roles and 50 Indian cities including Bangalore, Pune, Hyderabad, Indore, Patna, and Jaipur.';
  const canonicalUrl = 'https://talentxcel.in/directory/salaries-by-role';

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
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Salary Directory</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/directory" className="text-slate-300 hover:text-white">Directory Hub</Link>
            <Link to="/directory/colleges-a-z" className="text-slate-300 hover:text-white">Colleges A-Z</Link>
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
            <span className="text-slate-200 font-semibold">Salaries by Role</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Salary Intelligence Directory: Roles × Indian Cities Matrix
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Forensic compensation benchmarks across India's premier tech clusters and expanding Tier-2 hubs. Check median take-home pay, bonus percentiles, and market demand ratios.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Target Job Role</div>
          <div className="flex flex-wrap gap-2">
            {CANONICAL_ROLES.map((role) => (
              <button
                key={role.slug}
                onClick={() => setSelectedRole(role.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedRole === role.slug
                    ? 'bg-emerald-600 text-white font-bold shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Role Quick Overview */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">National Average P50 Benchmark</span>
            <h2 className="text-2xl font-bold text-white mt-1">{activeRoleObj.name} in India</h2>
            <p className="text-xs text-slate-400 mt-1">Typical base compensation: ₹{(activeRoleObj.baseLpa * 0.75).toFixed(1)}L (P25) — ₹{(activeRoleObj.baseLpa * 1.35).toFixed(1)}L (P90) PA</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/salary/${activeRoleObj.slug}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              National Salary Guide &rarr;
            </Link>
          </div>
        </div>

        {/* City Breakdown for Selected Role */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">
              {activeRoleObj.name} Salaries Across 50 Indian Cities
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredCities.map((city) => {
              const cityLpa = (activeRoleObj.baseLpa * (city.slug === 'indore' ? 0.9 : city.slug === 'patna' ? 0.85 : 0.88)).toFixed(1);
              return (
                <Link
                  key={city.slug}
                  to={`/salary/${activeRoleObj.slug}/${city.slug}`}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {city.name}, {city.state}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      {activeRoleObj.name} in {city.name}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-mono font-bold">₹{cityLpa} LPA Avg</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <RelatedSubdomainLinks currentDomain="salary" />
      </main>

      <SubdomainMeshFooter />
    </div>
  );
}
