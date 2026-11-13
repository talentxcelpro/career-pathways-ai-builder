import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles, TrendingUp, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CANONICAL_ROLES, CANONICAL_CITIES } from '@/lib/seo/pseoTaxonomy';
import { Button } from '@/components/ui/button';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanRole = (currentRole || 'software-engineer').toLowerCase().replace(/[\s_]+/g, '-');
  const cleanCity = (currentCity || 'india').toLowerCase().replace(/[\s_]+/g, '-');

  const formatTitle = (s: string) =>
    s
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const roleTitle = formatTitle(cleanRole);
  const cityTitle = formatTitle(cleanCity);

  // Verified Regional Hiring Hubs (points to canonical /locations/:slug)
  const roleInCities = CANONICAL_CITIES.slice(0, 10).map((city) => ({
    name: `${city.name} Tech Hub`,
    subtext: `Verified ${city.name} Openings`,
    path: `/locations/${city.slug}`,
    location: city.name,
  }));

  // In-Demand Tech Roles (points to verified career pathway hubs)
  // Clean names prevent awkward ellipsis truncation
  const rolesInCity = CANONICAL_ROLES.slice(0, 10).map((role) => {
    const title = formatTitle(role);
    return {
      name: title,
      subtext: 'Career Pathway & Skills',
      path: `/colleges/career-pathway/${role}`,
      role: title,
    };
  });

  const visibleCities = isExpanded ? roleInCities : roleInCities.slice(0, 6);
  const visibleRoles = isExpanded ? rolesInCity : rolesInCity.slice(0, 6);

  return (
    <div className={`mt-10 ${className}`}>
      {/* Subtle section divider */}
      <div className="w-full border-t border-slate-800/80 mb-8" />

      {/* Programmatic Career Corridors Container (Visually Subordinate) */}
      <section className="py-6 px-5 sm:px-7 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-300">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-800/70">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Programmatic Career Corridors</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-200 tracking-tight">
                Popular Searches &amp; Hiring Corridors in India
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400/80 inline-block" />
              <span>Real-time verified indexing &bull; 0% Thin Doorway Pages</span>
            </div>
          </div>

          {/* 2-Column Grid with Standardized Card Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-xs">
            
            {/* Column 1: Adjacent City Corridors for this Role */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{roleTitle} Openings by Tech Hub</span>
                </h4>
                <span className="text-[11px] text-slate-400">{roleInCities.length} Locations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleCities.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all group text-slate-300 min-h-[52px]"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition-colors block truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {item.subtext}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: In-Demand Tech Roles for this Region */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Top In-Demand Roles &bull; {cityTitle}</span>
                </h4>
                <span className="text-[11px] text-slate-400">{rolesInCity.length} Pathways</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleRoles.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all group text-slate-300 min-h-[52px]"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-xs text-slate-200 group-hover:text-purple-400 transition-colors block truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {item.subtext}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Compact Expansion Toggle */}
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-4 rounded-xl text-xs font-semibold bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <span>{isExpanded ? 'Show Less Corridors' : `Explore All Corridors (+${roleInCities.length - 6} hubs & roles)`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Universal Discovery Footer Bar */}
          <div className="pt-4 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Over 2,293+ programmatic corridors synchronized with Google Sitemaps and IndexNow.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <Link to="/jobs" className="text-blue-400 hover:text-blue-300 transition-colors">All Jobs &rarr;</Link>
              <Link to="/colleges" className="text-blue-400 hover:text-blue-300 transition-colors">Colleges Directory &rarr;</Link>
              <Link to="/resume/ats-check" className="text-blue-400 hover:text-blue-300 transition-colors">ATS Resume Check &rarr;</Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
