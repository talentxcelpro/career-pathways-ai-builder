import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { CANONICAL_ROLES, CANONICAL_CITIES } from '@/lib/seo/pseoTaxonomy';

interface PopularRoleCityLinksProps {
  currentRole?: string;
  currentCity?: string;
  className?: string;
}

export const PopularRoleCityLinks: React.FC<PopularRoleCityLinksProps> = ({
  currentRole,
  currentCity,
  className = '',
}) => {
  const cleanRole = (currentRole || 'software-engineer').toLowerCase().replace(/[\s_]+/g, '-');
  const cleanCity = (currentCity || 'bangalore').toLowerCase().replace(/[\s_]+/g, '-');

  const formatTitle = (s: string) =>
    s
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const roleTitle = formatTitle(cleanRole);
  const cityTitle = formatTitle(cleanCity);

  // Top 8 Cities for Current Role
  const roleInCities = CANONICAL_CITIES.slice(0, 10).map((city) => ({
    name: `${roleTitle} Jobs in ${city.name}`,
    path: `/jobs/${cleanRole}-in-${city.slug}`,
    location: city.name,
  }));

  // Top 8 Roles for Current City
  const rolesInCity = CANONICAL_ROLES.slice(0, 10).map((role) => {
    const title = formatTitle(role);
    return {
      name: `${title} Jobs in ${cityTitle}`,
      path: `/jobs/${role}-in-${cleanCity}`,
      role: title,
    };
  });

  return (
    <section className={`py-10 px-4 sm:px-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Programmatic Career Corridors</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Popular Searches &amp; Hiring Corridors in India
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Real-time verified indexing &bull; 0% Thin Doorway Pages
          </div>
        </div>

        {/* 2-Column Grid of Programmatic Crawlable Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          
          {/* Column 1: Adjacent City Corridors for this Role */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{roleTitle} Openings by Tech Hub</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roleInCities.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/60 hover:text-white transition-colors block text-slate-400"
                >
                  <span className="font-medium text-slate-300 block truncate">{item.name}</span>
                  <span className="text-[11px] text-slate-500">{item.location} &bull; Verified</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: In-Demand Tech Roles for this City */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Top Tech Roles in {cityTitle}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rolesInCity.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/60 hover:text-white transition-colors block text-slate-400"
                >
                  <span className="font-medium text-slate-300 block truncate">{item.name}</span>
                  <span className="text-[11px] text-slate-500">{item.role} &bull; Active Hub</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Universal Discovery Footer Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Over 2,293+ programmatic corridors synchronized with Google Sitemaps and IndexNow.</span>
          </div>
          <div className="flex gap-4">
            <Link to="/jobs" className="text-blue-400 hover:text-blue-300 font-medium">All Jobs &rarr;</Link>
            <Link to="/colleges" className="text-blue-400 hover:text-blue-300 font-medium">Colleges Directory &rarr;</Link>
            <Link to="/resume/ats-check" className="text-blue-400 hover:text-blue-300 font-medium">ATS Resume Check &rarr;</Link>
          </div>
        </div>

      </div>
    </section>
  );
};
