// src/components/network/GlobalDiscoveryAtlas.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  GLOBAL_COUNTRIES, 
  GLOBAL_DIVISIONS, 
  GLOBAL_CITIES 
} from '@/lib/geography/registry';
import { 
  getDivisionsForCountry, 
  getCitiesForDivision, 
  getCitiesForCountry,
  buildCanonicalGeographicUrl
} from '@/lib/geography/resolver';
import { 
  fetchIntelligentDiscoveryContext,
  IntelligentDiscoveryContext
} from '@/lib/network/discovery';
import { 
  Compass, 
  Search, 
  Globe2, 
  MapPin, 
  SlidersHorizontal, 
  ArrowRight, 
  Users, 
  Layers, 
  MessageSquare, 
  Calendar,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface GlobalDiscoveryAtlasProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenSearchDialog: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  userLocation?: string | null;
  className?: string;
}

export const GlobalDiscoveryAtlas: React.FC<GlobalDiscoveryAtlasProps> = ({
  searchTerm,
  onSearchChange,
  onOpenSearchDialog,
  activeFilter = 'discover',
  onFilterChange,
  userLocation,
  className = ''
}) => {
  const navigate = useNavigate();

  // Secondary Location Explorer Modal State (accessible on demand, never permanently dominating page)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalCountryId, setModalCountryId] = useState<string>('IN');
  const [modalDivisionId, setModalDivisionId] = useState<string>('');
  const [modalCitySlug, setModalCitySlug] = useState<string>('');

  // Backend-driven intelligent discovery query
  const { data: discoveryContext } = useQuery<IntelligentDiscoveryContext>({
    queryKey: ['intelligent-discovery-context', userLocation],
    queryFn: () => fetchIntelligentDiscoveryContext(userLocation),
    staleTime: 5 * 60 * 1000
  });

  // Dynamic divisions for modal
  const modalDivisions = modalCountryId 
    ? getDivisionsForCountry(modalCountryId) 
    : [];

  // Dynamic cities for modal
  const modalCities = modalDivisionId
    ? getCitiesForDivision(modalDivisionId)
    : (modalCountryId ? getCitiesForCountry(modalCountryId) : []);

  const handleModalCountryChange = (countryId: string) => {
    setModalCountryId(countryId);
    setModalDivisionId('');
    setModalCitySlug('');
  };

  const handleModalDivisionChange = (divisionId: string) => {
    setModalDivisionId(divisionId);
    setModalCitySlug('');
  };

  const handleModalNavigate = () => {
    if (!modalCountryId) return;
    const country = GLOBAL_COUNTRIES.find(c => c.id === modalCountryId);
    if (!country) return;

    const division = modalDivisionId ? GLOBAL_DIVISIONS.find(d => d.id === modalDivisionId) : undefined;
    const city = modalCitySlug ? GLOBAL_CITIES.find(c => c.slug === modalCitySlug && c.countryId === country.id) : undefined;

    const targetUrl = buildCanonicalGeographicUrl(country, division, city);
    setIsLocationModalOpen(false);
    navigate(targetUrl);
  };

  const handleNavClick = (tabId: string, path?: string) => {
    if (onFilterChange) {
      onFilterChange(tabId);
    }
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className={`space-y-3 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3.5 shadow-xs transition-all ${className}`}>
      
      {/* ========================================================================= */}
      {/* 1. DISCOVERY HEADER                                                       */}
      {/* ========================================================================= */}
      <div className="space-y-1 pb-0.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-foreground truncate">
              Explore your professional world
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors shrink-0"
            title="Browse all locations"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Discover professionals, communities, conversations and opportunities.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNIFIED SEARCH BAR                                                     */}
      {/* ========================================================================= */}
      <div className="relative">
        <div className="relative bg-slate-50/80 dark:bg-muted/40 border border-slate-200/90 dark:border-border/60 rounded-xl px-2.5 py-1.5 flex items-center gap-2 focus-within:bg-white dark:focus-within:bg-card focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-2xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            id="network-unified-discovery-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onOpenSearchDialog();
              }
            }}
            placeholder="Search professionals, communities, skills, discussions or opportunities..."
            className="border-0 bg-transparent text-xs text-foreground font-medium placeholder:text-muted-foreground focus:outline-hidden w-full h-5 p-0"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-0.5 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSearchDialog}
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Open Unified Discovery Modal"
          >
            Search
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DISCOVERY NAVIGATION TABS                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1 overflow-x-auto pt-0.5 pb-0.5 text-xs whitespace-nowrap">
        {[
          { id: 'discover', label: 'Discover', icon: Compass, path: '/network?tab=discover' },
          { id: 'people', label: 'People', icon: Users, path: '/network/people' },
          { id: 'communities', label: 'Communities', icon: Layers, path: '/network/communities' },
          { id: 'discussions', label: 'Discussions', icon: MessageSquare, path: '/network?tab=feed' },
          { id: 'events', label: 'Events', icon: Calendar, path: '/network/events' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavClick(tab.id, tab.path)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 dark:bg-muted/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-muted border border-slate-200/60 dark:border-border/40'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVE GEOGRAPHIC HUBS (COMPACT RESPONSIVE CHIPS)                      */}
      {/* ========================================================================= */}
      <div className="pt-2 border-t border-slate-100 dark:border-border/40 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 text-blue-600" />
            <span>Active Hubs:</span>
          </span>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            All hubs &rarr;
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { name: 'Noida', flag: '🇮🇳', path: '/network/india/uttar-pradesh/noida' },
            { name: 'Hyderabad', flag: '🇮🇳', path: '/network/india/telangana/hyderabad' },
            { name: 'Bengaluru', flag: '🇮🇳', path: '/network/india/karnataka/bengaluru' },
            { name: 'Chennai', flag: '🇮🇳', path: '/network/india/tamil-nadu/chennai' }
          ].map((hub) => (
            <button
              key={hub.name}
              type="button"
              onClick={() => navigate(hub.path)}
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-slate-50 dark:bg-muted/50 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-border/60 text-foreground font-bold text-[11px] transition-all cursor-pointer shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 active:scale-95"
            >
              <span className="text-xs leading-none">{hub.flag}</span>
              <span className="truncate">{hub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. LOCATION EXPLORER (ACCESSIBLE MODAL - BACKEND DISCOVERY ON DEMAND)     */}
      {/* ========================================================================= */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-white dark:bg-card border border-slate-200/90 dark:border-border/80 shadow-2xl p-5 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-black flex items-center gap-2 text-foreground">
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Location Explorer — Global Directory</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select country, state/region, and city to explore verified regional hubs across the TalentXcel Global Network.
            </DialogDescription>
          </DialogHeader>

          {/* 3-Tier Cascading Selectors */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                1. Country
              </label>
              <select
                value={modalCountryId}
                onChange={(e) => handleModalCountryChange(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl p-2 text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {GLOBAL_COUNTRIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                2. State / Region
              </label>
              <select
                value={modalDivisionId}
                onChange={(e) => handleModalDivisionChange(e.target.value)}
                disabled={modalDivisions.length === 0}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl p-2 text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-50"
              >
                <option value="">All States / Regions</option>
                {modalDivisions.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                3. City Hub
              </label>
              <select
                value={modalCitySlug}
                onChange={(e) => setModalCitySlug(e.target.value)}
                disabled={modalCities.length === 0}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl p-2 text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-50"
              >
                <option value="">All Cities in selected region</option>
                {modalCities.map(c => (
                  <option key={c.id} value={c.slug}>
                    {c.name} {c.isTechHub ? '⚡' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-border/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLocationModalOpen(false);
                navigate('/network');
              }}
              className="text-xs font-bold text-muted-foreground gap-1"
            >
              <Globe2 className="h-3.5 w-3.5" />
              <span>Reset to Global</span>
            </Button>
            <Button
              size="sm"
              onClick={handleModalNavigate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
            >
              <span>Explore Selected Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default GlobalDiscoveryAtlas;
