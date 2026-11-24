// src/components/network/GlobalDiscoveryBar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GLOBAL_COUNTRIES, 
  GLOBAL_DIVISIONS, 
  GLOBAL_CITIES 
} from '@/lib/geography/registry';
import { 
  getDivisionsForCountry, 
  getCitiesForDivision, 
  getCitiesForCountry,
  buildCanonicalGeographicUrl,
  searchLocations
} from '@/lib/geography/resolver';
import { GeographicCountry, GeographicDivision, GeographicCity } from '@/lib/geography/types';
import { 
  MapPin, 
  Globe2, 
  Compass, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GlobalDiscoveryBarProps {
  onFilterChange?: (mode: string) => void;
  className?: string;
}

export const GlobalDiscoveryBar: React.FC<GlobalDiscoveryBarProps> = ({
  onFilterChange,
  className = ''
}) => {
  const navigate = useNavigate();

  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>('');
  const [autocompleteQuery, setAutocompleteQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamic divisions for selected country
  const availableDivisions = selectedCountryId 
    ? getDivisionsForCountry(selectedCountryId) 
    : [];

  // Dynamic cities for selected division or country
  const availableCities = selectedDivisionId
    ? getCitiesForDivision(selectedDivisionId)
    : (selectedCountryId ? getCitiesForCountry(selectedCountryId) : []);

  // Quick Autocomplete suggestions
  const searchResults = autocompleteQuery.trim().length >= 2 
    ? searchLocations(autocompleteQuery, 6) 
    : [];

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedDivisionId('');
    setSelectedCitySlug('');
  };

  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedCitySlug('');
  };

  const handleGoToHub = () => {
    if (!selectedCountryId) {
      navigate('/network');
      return;
    }

    const country = GLOBAL_COUNTRIES.find(c => c.id === selectedCountryId);
    if (!country) return;

    const division = selectedDivisionId ? GLOBAL_DIVISIONS.find(d => d.id === selectedDivisionId) : undefined;
    const city = selectedCitySlug ? GLOBAL_CITIES.find(c => c.slug === selectedCitySlug && c.countryId === country.id) : undefined;

    const targetUrl = buildCanonicalGeographicUrl(country, division, city);
    navigate(targetUrl);
  };

  const POPULAR_HUBS = [
    { label: 'Noida', flag: '🇮🇳', url: '/network/india/uttar-pradesh/noida' },
    { label: 'Bengaluru', flag: '🇮🇳', url: '/network/india/karnataka/bengaluru' },
    { label: 'Mumbai', flag: '🇮🇳', url: '/network/india/maharashtra/mumbai' },
    { label: 'San Francisco', flag: '🇺🇸', url: '/network/united-states/california/san-francisco' },
    { label: 'New York', flag: '🇺🇸', url: '/network/united-states/new-york/new-york' },
    { label: 'London', flag: '🇬🇧', url: '/network/united-kingdom/london' },
    { label: 'Dubai', flag: '🇦🇪', url: '/network/united-arab-emirates/dubai' },
    { label: 'Toronto', flag: '🇨🇦', url: '/network/canada/ontario/toronto' },
    { label: 'Singapore', flag: '🇸🇬', url: '/network/singapore/singapore' },
  ];

  return (
    <div className={`space-y-2.5 bg-white dark:bg-card border border-slate-200/90 dark:border-border/60 rounded-2xl p-3 sm:p-4 shadow-xs ${className}`}>
      
      {/* Top Header: Badge & Quick Hub Jumper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-black text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <span>Global Professional Discovery Atlas</span>
              <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200 font-extrabold uppercase">
                Geographic
              </Badge>
            </h2>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
              Discover professionals, discussions, events, and communities by location
            </p>
          </div>
        </div>

        {/* Quick Search Dropdown / Autocomplete */}
        <div className="relative w-full sm:w-64">
          <div className="relative flex items-center bg-slate-50 dark:bg-muted/50 border border-slate-200/80 dark:border-border/60 rounded-xl px-2.5 py-1">
            <Search className="h-3.5 w-3.5 text-muted-foreground mr-1.5 shrink-0" />
            <input
              type="text"
              value={autocompleteQuery}
              onChange={(e) => {
                setAutocompleteQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Jump to city, state, country..."
              className="w-full bg-transparent border-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-slate-200/90 dark:border-border/60 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setIsSearchOpen(false);
                    setAutocompleteQuery('');
                    navigate(res.canonicalPath);
                  }}
                  className="p-2.5 hover:bg-slate-50 dark:hover:bg-muted cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-xs">{res.displayName}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{res.level} hub</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Tier Geographic Selector: Country -> State/Division -> City */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 items-center">
        
        {/* Country Select */}
        <div className="sm:col-span-4">
          <select
            value={selectedCountryId}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted/50 border border-slate-200/80 dark:border-border/60 rounded-xl px-2.5 py-1.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">🌐 Select Country...</option>
            {GLOBAL_COUNTRIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Division / State Select */}
        <div className="sm:col-span-4">
          <select
            value={selectedDivisionId}
            onChange={(e) => handleDivisionChange(e.target.value)}
            disabled={!selectedCountryId || availableDivisions.length === 0}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted/50 border border-slate-200/80 dark:border-border/60 rounded-xl px-2.5 py-1.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="">📍 Select State / Region...</option>
            {availableDivisions.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="sm:col-span-3">
          <select
            value={selectedCitySlug}
            onChange={(e) => setSelectedCitySlug(e.target.value)}
            disabled={availableCities.length === 0}
            className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted/50 border border-slate-200/80 dark:border-border/60 rounded-xl px-2.5 py-1.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="">🏙️ Select City...</option>
            {availableCities.map(c => (
              <option key={c.id} value={c.slug}>
                {c.name} {c.isTechHub ? '⚡' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="sm:col-span-1">
          <Button
            size="sm"
            onClick={handleGoToHub}
            disabled={!selectedCountryId}
            className="w-full h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
          >
            Explore &rarr;
          </Button>
        </div>

      </div>

      {/* Popular City Hub Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 whitespace-nowrap">
        <span className="text-[10px] font-black uppercase text-muted-foreground mr-1 shrink-0">
          Featured Hubs:
        </span>
        {POPULAR_HUBS.map((hub, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => navigate(hub.url)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100/90 dark:bg-muted hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-border/40 transition-all shrink-0 active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>{hub.flag}</span>
            <span>{hub.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default GlobalDiscoveryBar;
