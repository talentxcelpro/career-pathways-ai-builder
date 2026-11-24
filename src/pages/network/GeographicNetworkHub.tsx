// src/pages/network/GeographicNetworkHub.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  resolveHierarchyFromParams, 
  buildCanonicalGeographicUrl,
  getCitiesForDivision,
  getCitiesForCountry,
  getDivisionsForCountry 
} from '@/lib/geography/resolver';
import { 
  fetchDiscoverableProfiles, 
  fetchLocationCommunities, 
  fetchLocationDiscussions, 
  fetchLocationEvents, 
  fetchGeographicHubSummary,
  DiscoverableProfessional,
  DiscoverableCommunity,
  DiscoverableDiscussion,
  DiscoverableEvent
} from '@/lib/network/discovery';
import { 
  MapPin, 
  Users, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  Compass, 
  Search, 
  SlidersHorizontal,
  ArrowRight, 
  ChevronRight, 
  Globe2, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Flame, 
  CheckCircle2, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

export const GeographicNetworkHub: React.FC = () => {
  const navigate = useNavigate();
  const { country: countryParam, division: divisionParam, city: cityParam, facet: facetParam } = useParams<{
    country?: string;
    division?: string;
    city?: string;
    facet?: string;
  }>();

  // Resolve geographic hierarchy from route params
  const geo = useMemo(() => {
    return resolveHierarchyFromParams(countryParam, divisionParam, cityParam);
  }, [countryParam, divisionParam, cityParam]);

  const [activeTab, setActiveTab] = useState<string>(facetParam || 'overview');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [mentorsOnly, setMentorsOnly] = useState<boolean>(false);

  // If geographic entity not found, render not found fallback
  if (!geo.country) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col items-center justify-center p-6 text-center">
        <Compass className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
        <h1 className="text-2xl font-black text-foreground">Geographic Hub Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6">
          The requested network location does not exist in our global registry or has not been provisioned yet.
        </p>
        <Button onClick={() => navigate('/network')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
          Return to Global Network
        </Button>
      </div>
    );
  }

  // Canonical URL for this geographic hub
  const canonicalUrl = useMemo(() => {
    return `https://talentxcel.in${buildCanonicalGeographicUrl(geo.country!, geo.division, geo.city)}`;
  }, [geo]);

  // Fetch Hub Summary and Telemetry
  const { data: hubSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['geo-hub-summary', geo.country.slug, geo.division?.slug, geo.city?.slug],
    queryFn: () => fetchGeographicHubSummary(geo.country!.slug, geo.division?.slug, geo.city?.slug),
    staleTime: 5 * 60 * 1000
  });

  // Fetch Discoverable Professionals
  const { data: profilesData, isLoading: isProfilesLoading } = useQuery({
    queryKey: ['geo-hub-profiles', geo.country.slug, geo.division?.slug, geo.city?.slug, selectedIndustry, mentorsOnly, searchFilter],
    queryFn: () => fetchDiscoverableProfiles({
      countrySlug: geo.country!.slug,
      divisionSlug: geo.division?.slug,
      citySlug: geo.city?.slug,
      industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
      isMentor: mentorsOnly || undefined,
      query: searchFilter || undefined,
      pageSize: 36
    }),
    staleTime: 5 * 60 * 1000
  });

  // Fetch Local Communities
  const { data: communities = [] } = useQuery({
    queryKey: ['geo-hub-communities', geo.country.slug, geo.division?.slug, geo.city?.slug],
    queryFn: () => fetchLocationCommunities({
      countrySlug: geo.country!.slug,
      divisionSlug: geo.division?.slug,
      citySlug: geo.city?.slug
    }),
    staleTime: 10 * 60 * 1000
  });

  // Fetch Regional Discussions
  const { data: discussions = [] } = useQuery({
    queryKey: ['geo-hub-discussions', geo.country.slug, geo.division?.slug, geo.city?.slug],
    queryFn: () => fetchLocationDiscussions({
      countrySlug: geo.country!.slug,
      divisionSlug: geo.division?.slug,
      citySlug: geo.city?.slug
    }),
    staleTime: 5 * 60 * 1000
  });

  // Fetch Regional & Virtual Events
  const { data: events = [] } = useQuery({
    queryKey: ['geo-hub-events', geo.country.slug, geo.division?.slug, geo.city?.slug],
    queryFn: () => fetchLocationEvents({
      countrySlug: geo.country!.slug,
      divisionSlug: geo.division?.slug,
      citySlug: geo.city?.slug
    }),
    staleTime: 10 * 60 * 1000
  });

  // Sibling locations for exploration
  const siblingCities = useMemo(() => {
    if (geo.division) {
      return getCitiesForDivision(geo.division.id).filter(c => c.slug !== geo.city?.slug);
    }
    return getCitiesForCountry(geo.country!.id).filter(c => c.slug !== geo.city?.slug).slice(0, 10);
  }, [geo]);

  const siblingDivisions = useMemo(() => {
    return getDivisionsForCountry(geo.country!.id).filter(d => d.slug !== geo.division?.slug).slice(0, 8);
  }, [geo]);

  const professionals = profilesData?.professionals || [];
  const totalProfessionalsCount = profilesData?.totalCount || professionals.length;

  // JSON-LD Structured Data
  const jsonLdData = useMemo(() => {
    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: (hubSummary?.breadcrumbs || []).map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: geo.city?.name || geo.division?.name || geo.country!.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: geo.city?.name || undefined,
          addressRegion: geo.division?.name || undefined,
          addressCountry: geo.country!.id
        },
        description: hubSummary?.description || `Professional network in ${geo.city?.name || geo.country!.name}`
      }
    ];
    return schemas;
  }, [hubSummary, geo]);

  const isIndexable = hubSummary?.eligibility.isIndexable ?? false;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background/95 pb-20">
      {/* Dynamic SEO MetaTags with Indexation Governance */}
      <SEOHead
        title={hubSummary?.title || `${geo.city?.name || geo.country.name} Professional Network | TalentXcel`}
        description={hubSummary?.description || `Join verified professionals in ${geo.city?.name || geo.country.name} on TalentXcel.`}
        canonical={canonicalUrl}
        type="website"
      />
      {/* Indexation Governance: noindex for thin / sub-threshold pages */}
      {!isIndexable && (
        <meta name="robots" content="noindex, follow" />
      )}

      {/* JSON-LD Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* ========================================================================= */}
      {/* BREADCRUMBS BAR                                                           */}
      {/* ========================================================================= */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-border/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-muted-foreground">
            <Link to="/" className="hover:text-blue-600 font-medium">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <Link to="/network" className="hover:text-blue-600 font-medium">Network</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <Link to={`/network/${geo.country.slug}`} className="hover:text-blue-600 font-medium">
              {geo.country.flag} {geo.country.name}
            </Link>
            {geo.division && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <Link to={`/network/${geo.country.slug}/${geo.division.slug}`} className="hover:text-blue-600 font-medium">
                  {geo.division.name}
                </Link>
              </>
            )}
            {geo.city && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <span className="font-bold text-foreground">{geo.city.name}</span>
              </>
            )}
          </nav>

          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/network')}
            className="h-7 text-xs font-semibold gap-1 shrink-0 ml-2"
          >
            <Globe2 className="h-3.5 w-3.5 text-blue-600" />
            Global Discovery
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* GEOGRAPHIC HUB HERO BANNER                                                */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 border border-blue-900/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                {geo.city ? 'City Community Hub' : (geo.division ? 'Regional Network Hub' : 'National Professional Network')}
              </span>
              {geo.city?.isTechHub && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[11px] font-bold">
                  ⚡ Tier-{geo.city.tier} Technology Ecosystem
                </Badge>
              )}
              {geo.city?.metroArea && (
                <span className="text-xs text-blue-200/80 font-medium">
                  Part of {geo.city.metroArea}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{geo.country.flag}</span>
                <span>{geo.city?.name || geo.division?.name || geo.country.name}</span>
                <span className="text-blue-400 font-extrabold text-lg sm:text-2xl">Network</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Connect with verified professionals, participate in local technical discussions, join communities, attend events, and discover mentorship in {geo.city?.name || geo.division?.name || geo.country.name}.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                  <Users className="h-4 w-4" /> Discoverable
                </div>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {totalProfessionalsCount}+
                </div>
                <p className="text-[10px] text-slate-400">Verified members</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <Layers className="h-4 w-4" /> Communities
                </div>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {communities.length}
                </div>
                <p className="text-[10px] text-slate-400">Active circles</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <MessageSquare className="h-4 w-4" /> Discussions
                </div>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {discussions.length}
                </div>
                <p className="text-[10px] text-slate-400">Regional topics</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-pink-300 text-xs font-bold">
                  <Calendar className="h-4 w-4" /> Events
                </div>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {events.length}
                </div>
                <p className="text-[10px] text-slate-400">Upcoming meetups</p>
              </div>
            </div>

            {/* In-Hub Search Bar */}
            <div className="pt-2 max-w-xl">
              <div className="relative flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-1.5 focus-within:bg-white focus-within:text-slate-900 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search professionals, skills, or topics in ${geo.city?.name || geo.country.name}...`}
                  className="border-0 bg-transparent text-xs p-0 focus-visible:ring-0 placeholder:text-slate-400 focus:text-slate-900 h-7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MULTI-TAB DISCOVERY SURFACE                                               */}
        {/* ========================================================================= */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-white dark:bg-card p-1 rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs flex flex-wrap gap-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <Compass className="h-3.5 w-3.5" />
              Hub Overview
            </TabsTrigger>
            <TabsTrigger value="professionals" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <Users className="h-3.5 w-3.5" />
              Professionals ({professionals.length})
            </TabsTrigger>
            <TabsTrigger value="communities" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <Layers className="h-3.5 w-3.5" />
              Communities ({communities.length})
            </TabsTrigger>
            <TabsTrigger value="discussions" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <MessageSquare className="h-3.5 w-3.5" />
              Discussions ({discussions.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <Calendar className="h-3.5 w-3.5" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="mentors" className="rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Mentorship &amp; Advisory
            </TabsTrigger>
          </TabsList>

          {/* ======================================================================= */}
          {/* TAB 1: HUB OVERVIEW                                                     */}
          {/* ======================================================================= */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left 2 Cols: Featured Professionals & Recent Discussions */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Discoverable Professionals Card */}
                <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm text-foreground">
                          Discoverable Professionals in {geo.city?.name || geo.country.name}
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Verified members with public profile visibility
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('professionals')}
                      className="text-xs text-blue-600 font-bold hover:bg-blue-50"
                    >
                      View All ({professionals.length}) &rarr;
                    </Button>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {professionals.slice(0, 6).map((prof) => (
                      <div 
                        key={prof.id}
                        onClick={() => navigate(prof.canonicalPath || `/u/${prof.id}`)}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-card hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                          <AvatarImage src={prof.avatarUrl} />
                          <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                            {prof.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-xs text-foreground truncate group-hover:text-blue-600 transition-colors">
                              {prof.fullName}
                            </h3>
                            {prof.verificationStatus === 'verified' && (
                              <ShieldCheck className="h-3 w-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{prof.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {prof.skills.slice(0, 2).map((s, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 font-semibold">
                                {s}
                              </span>
                            ))}
                            {prof.isMentor && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold">
                                Mentor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {professionals.length === 0 && (
                      <div className="col-span-2 py-8 text-center text-xs text-muted-foreground">
                        No public profiles discovered in this location yet. Be the first to join!
                      </div>
                    )}
                  </div>
                </Card>

                {/* Regional Discussions Card */}
                <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="font-extrabold text-sm text-foreground">
                          Local &amp; Regional Discussions
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Discussions from engineers and leaders in this ecosystem
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('discussions')}
                      className="text-xs text-purple-600 font-bold hover:bg-purple-50"
                    >
                      All Discussions &rarr;
                    </Button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {discussions.slice(0, 4).map((disc) => (
                      <div 
                        key={disc.id}
                        onClick={() => navigate(disc.canonicalUrl)}
                        className="p-4 hover:bg-slate-50/60 dark:hover:bg-muted/40 transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground text-xs">{disc.authorName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(disc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {disc.headline && (
                          <h3 className="font-extrabold text-xs text-foreground line-clamp-1">{disc.headline}</h3>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {disc.content}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                          <span>❤️ {disc.likesCount} Likes</span>
                          <span>💬 {disc.commentsCount} Comments</span>
                          <span>🔁 {disc.sharesCount} Shares</span>
                        </div>
                      </div>
                    ))}
                    {discussions.length === 0 && (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No active discussions posted yet in this hub.
                      </div>
                    )}
                  </div>
                </Card>

              </div>

              {/* Right Col: Local Communities, Events & Neighboring Hubs */}
              <div className="space-y-6">

                {/* Communities Card */}
                <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      <span>Local Communities</span>
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">{communities.length} circles</Badge>
                  </div>
                  <div className="space-y-2">
                    {communities.slice(0, 4).map((comm) => (
                      <div 
                        key={comm.id}
                        onClick={() => navigate('/network/communities')}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-card cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-foreground">{comm.name}</h4>
                          <span className="text-[10px] text-muted-foreground font-semibold">{comm.memberCount} members</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{comm.headline}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Upcoming Events Card */}
                <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-pink-600" />
                      <span>Upcoming Events</span>
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">{events.length} events</Badge>
                  </div>
                  <div className="space-y-2">
                    {events.slice(0, 3).map((evt) => (
                      <div 
                        key={evt.id}
                        onClick={() => navigate(evt.canonicalUrl)}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-700 bg-white dark:bg-card cursor-pointer transition-all space-y-1"
                      >
                        <h4 className="font-bold text-xs text-foreground">{evt.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{new Date(evt.startTime).toLocaleDateString()}</span>
                          <span className="font-semibold text-pink-600">{evt.isVirtual ? 'Virtual Event' : evt.location}</span>
                        </div>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">No upcoming events scheduled.</p>
                    )}
                  </div>
                </Card>

                {/* Explore Neighboring Hubs */}
                <Card className="rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-xs p-4 space-y-3">
                  <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Explore Neighboring Hubs</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {siblingCities.map((sc) => (
                      <Link 
                        key={sc.id}
                        to={buildCanonicalGeographicUrl(geo.country!, geo.division, sc)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                      >
                        {sc.name}
                      </Link>
                    ))}
                    {siblingDivisions.map((sd) => (
                      <Link 
                        key={sd.id}
                        to={`/network/${geo.country!.slug}/${sd.slug}`}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold transition-colors"
                      >
                        {sd.name}
                      </Link>
                    ))}
                  </div>
                </Card>

              </div>

            </div>
          </TabsContent>

          {/* ======================================================================= */}
          {/* TAB 2: PROFESSIONALS DIRECTORY                                          */}
          {/* ======================================================================= */}
          <TabsContent value="professionals" className="space-y-4 mt-0">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  variant={!mentorsOnly ? 'default' : 'outline'}
                  onClick={() => setMentorsOnly(false)}
                  className="h-8 text-xs font-bold"
                >
                  All Professionals ({totalProfessionalsCount})
                </Button>
                <Button 
                  size="sm"
                  variant={mentorsOnly ? 'default' : 'outline'}
                  onClick={() => setMentorsOnly(true)}
                  className="h-8 text-xs font-bold text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Available Mentors
                </Button>
              </div>

              <span className="text-xs text-muted-foreground font-medium">
                Showing verified profiles matching privacy controls
              </span>
            </div>

            {/* Professionals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {professionals.map((prof) => (
                <Card 
                  key={prof.id}
                  onClick={() => navigate(prof.canonicalPath || `/u/${prof.id}`)}
                  className="rounded-2xl border border-slate-200/80 dark:border-border/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer p-4 space-y-3 group bg-white dark:bg-card"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700 shrink-0">
                      <AvatarImage src={prof.avatarUrl} />
                      <AvatarFallback className="bg-slate-800 text-white font-extrabold text-sm">
                        {prof.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-sm text-foreground truncate group-hover:text-blue-600 transition-colors">
                          {prof.fullName}
                        </h3>
                        {prof.verificationStatus === 'verified' && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 shrink-0">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{prof.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{prof.location}</span>
                      </p>
                    </div>
                  </div>

                  {prof.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prof.skills.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-border/60 flex items-center justify-between text-xs">
                    {prof.isMentor ? (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Open to Mentoring
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Open to Connect</span>
                    )}
                    <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Profile &rarr;
                    </span>
                  </div>
                </Card>
              ))}
              {professionals.length === 0 && (
                <div className="col-span-3 py-16 text-center text-sm text-muted-foreground">
                  No public profiles found for this location filter.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ======================================================================= */}
          {/* TAB 3: COMMUNITIES                                                      */}
          {/* ======================================================================= */}
          <TabsContent value="communities" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((comm) => (
                <Card 
                  key={comm.id}
                  onClick={() => navigate('/network/communities')}
                  className="rounded-2xl border border-slate-200/80 dark:border-border/60 p-4 hover:shadow-md transition-all cursor-pointer space-y-3 bg-white dark:bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{comm.category}</span>
                    <Badge variant="outline" className="text-[10px]">{comm.memberCount} members</Badge>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-foreground">{comm.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comm.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {comm.tags.map((t, i) => (
                      <span key={i} className="text-[10px] text-slate-500 font-semibold">#{t.replace(/^#/, '')}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ======================================================================= */}
          {/* TAB 4: DISCUSSIONS                                                      */}
          {/* ======================================================================= */}
          <TabsContent value="discussions" className="space-y-4 mt-0">
            <div className="max-w-3xl mx-auto space-y-3">
              {discussions.map((disc) => (
                <Card 
                  key={disc.id}
                  onClick={() => navigate(disc.canonicalUrl)}
                  className="rounded-2xl border border-slate-200/80 dark:border-border/60 p-4 hover:shadow-md transition-all cursor-pointer space-y-2.5 bg-white dark:bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{disc.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(disc.createdAt).toLocaleDateString()}</span>
                  </div>
                  {disc.headline && (
                    <h3 className="font-extrabold text-sm text-foreground">{disc.headline}</h3>
                  )}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {disc.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-slate-100 dark:border-border/60">
                    <span>❤️ {disc.likesCount} Likes</span>
                    <span>💬 {disc.commentsCount} Comments</span>
                    <span>🔁 {disc.sharesCount} Shares</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ======================================================================= */}
          {/* TAB 5: EVENTS                                                           */}
          {/* ======================================================================= */}
          <TabsContent value="events" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((evt) => (
                <Card 
                  key={evt.id}
                  onClick={() => navigate(evt.canonicalUrl)}
                  className="rounded-2xl border border-slate-200/80 dark:border-border/60 p-4 hover:shadow-md transition-all cursor-pointer space-y-3 bg-white dark:bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">{evt.eventType}</span>
                    <Badge variant="outline" className="text-[10px]">{evt.currentAttendees} attending</Badge>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-foreground">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evt.description}</p>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    📅 {new Date(evt.startTime).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ======================================================================= */}
          {/* TAB 6: MENTORSHIP & ADVISORY                                            */}
          {/* ======================================================================= */}
          <TabsContent value="mentors" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.filter(p => p.isMentor).map((prof) => (
                <Card 
                  key={prof.id}
                  onClick={() => navigate(prof.canonicalPath || `/u/${prof.id}`)}
                  className="rounded-2xl border-2 border-amber-300/60 dark:border-amber-700/60 p-4 hover:shadow-md transition-all cursor-pointer space-y-3 bg-white dark:bg-card"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-amber-400 shrink-0">
                      <AvatarImage src={prof.avatarUrl} />
                      <AvatarFallback className="bg-amber-600 text-white font-bold">{prof.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-foreground truncate">{prof.fullName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{prof.title}</p>
                      <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold mt-1">
                        Verified Mentor
                      </Badge>
                    </div>
                  </div>
                  {prof.mentorshipAreas && prof.mentorshipAreas.length > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold">Areas:</span> {prof.mentorshipAreas.join(', ')}
                    </div>
                  )}
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl">
                    Request Guidance
                  </Button>
                </Card>
              ))}
              {professionals.filter(p => p.isMentor).length === 0 && (
                <div className="col-span-3 py-16 text-center text-sm text-muted-foreground">
                  No mentors currently listed in this hub.
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
};

export default GeographicNetworkHub;
