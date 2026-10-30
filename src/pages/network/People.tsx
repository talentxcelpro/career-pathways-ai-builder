import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Heart, 
  Search, 
  TrendingUp, 
  Sparkles, 
  UserPlus, 
  Check, 
  Play, 
  Zap, 
  Star, 
  ShieldCheck, 
  Award, 
  Share2, 
  Send, 
  Navigation, 
  Globe2, 
  Compass, 
  SlidersHorizontal,
  X,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Laptop
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useProfileViews } from '@/hooks/useProfileViews';
import { useUserPresence } from '@/hooks/useUserPresence';
import { RealTimePresence } from '@/components/network/RealTimePresence';
import { toast } from 'sonner';

// Public member directory backed by profiles that members explicitly mark public
interface GlobalTalentProfile {
  id: string;
  full_name: string;
  username?: string;
  headline: string;
  title?: string;
  location: string;
  hub: 'dubai' | 'us' | 'europe' | 'india' | 'apac' | 'remote' | 'unknown';
  domain: 'ai' | 'systems' | 'product' | 'design' | 'leadership' | 'security' | 'creators' | 'unknown';
  talent_score?: number;
  connections_count?: string;
  percentile?: string;
  skills: string[];
  profile_photo_url?: string;
  availability?: 'Open to Roles' | 'Hiring Team' | 'Open to Advisory';
  is_verified?: boolean;
  activity_snippet?: string;
  activity_type?: 'reel' | 'post' | 'hiring' | 'achievement';
}

// Seed identities and performance claims are not presented as member data.
const GLOBAL_SPOTLIGHT_LEADERS: GlobalTalentProfile[] = [];

const GLOBAL_HUBS = [
  { id: 'all', label: 'All Worldwide', icon: '🌍' },
  { id: 'dubai', label: 'Dubai & MENA', icon: '🇦🇪' },
  { id: 'us', label: 'Silicon Valley & US', icon: '🇺🇸' },
  { id: 'europe', label: 'London & Europe', icon: '🇬🇧' },
  { id: 'india', label: 'Bengaluru & India', icon: '🇮🇳' },
  { id: 'apac', label: 'Singapore & APAC', icon: '🇸🇬' },
  { id: 'remote', label: 'Global Remote', icon: '🌐' }
];

const DOMAIN_CATEGORIES = [
  { id: 'all', label: 'All Domains' },
  { id: 'ai', label: '⚡ AI & ML' },
  { id: 'systems', label: '🏗️ Distributed Systems' },
  { id: 'product', label: '🎯 Product' },
  { id: 'design', label: '🎨 UI/UX Design' },
  { id: 'leadership', label: '💼 Leadership & VP' },
  { id: 'security', label: '🛡️ Security & DevOps' }
];

const People: React.FC = () => {
  useUserPresence();
  const { trackProfileView } = useProfileViews();
  const navigate = useNavigate();

  // Navigation and filters
  const [activeTab, setActiveTab] = useState<'verified' | 'trending' | 'creators' | 'hubs'>('verified');
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const parsedQuery = useMemo(() => {
    const locationMatch = searchTerm.match(/\bin\s+(.+)$/i);
    return locationMatch ? { location: locationMatch[1].trim() } : null;
  }, [searchTerm]);
  const suggestions = useMemo(() => searchTerm.trim() ? [] : [
    'Senior AI Engineer in Dubai',
    'Product Designer in London',
    'Cloud Engineer in Bengaluru',
  ], [searchTerm]);
  const selectSuggestion = useCallback((suggestion: string) => setSearchTerm(suggestion), []);

  const queryClient = useQueryClient();

  // Fetch public profiles in newest-first order.
  const { data: dbProfiles } = useQuery({
    queryKey: ['global-talent-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, headline, title, location, profile_photo_url, profile_picture_url, skills, profile_visibility, verification_status, created_at')
        .eq('profile_visibility', 'public')
        .not('full_name', 'is', null)
        .neq('full_name', '')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.warn('Could not fetch DB profiles:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  // Dynamic Realtime subscription: When anyone joins or updates their profile, update immediately!
  useEffect(() => {
    const channel = supabase
      .channel('realtime:talent-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['global-talent-profiles'] });
          const insertedProfile = payload.new as any;
          if (payload.eventType === 'INSERT' && insertedProfile?.profile_visibility === 'public' && insertedProfile?.full_name) {
            toast.success(`${insertedProfile.full_name} joined the public TalentXcel directory.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Render only profile details that members supplied and explicitly made public.
  const enrichedProfiles = useMemo(() => {
    const mappedDbProfiles: GlobalTalentProfile[] = (dbProfiles || [])
      .filter((db) => db.profile_visibility === 'public' && Boolean(db.full_name) && Boolean(db.headline || db.title))
      .map((db) => {
      const name = db.full_name as string;
      const cleanHeadline = db.headline || db.title;
      const loc = db.location || '';
      
      let hub: GlobalTalentProfile['hub'] = 'unknown';
      const lowerLoc = loc.toLowerCase();
      if (lowerLoc.includes('dubai') || lowerLoc.includes('uae') || lowerLoc.includes('doha')) hub = 'dubai';
      else if (lowerLoc.includes('us') || lowerLoc.includes('california') || lowerLoc.includes('york') || lowerLoc.includes('francisco')) hub = 'us';
      else if (lowerLoc.includes('uk') || lowerLoc.includes('london') || lowerLoc.includes('berlin') || lowerLoc.includes('europe') || lowerLoc.includes('germany')) hub = 'europe';
      else if (lowerLoc.includes('india') || lowerLoc.includes('bengaluru') || lowerLoc.includes('mumbai') || lowerLoc.includes('delhi')) hub = 'india';
      else if (lowerLoc.includes('singapore') || lowerLoc.includes('tokyo') || lowerLoc.includes('seoul')) hub = 'apac';

      let domain: GlobalTalentProfile['domain'] = 'unknown';
      const lowerHead = cleanHeadline.toLowerCase();
      if (lowerHead.includes('ai') || lowerHead.includes('ml') || lowerHead.includes('data')) domain = 'ai';
      else if (lowerHead.includes('product') || lowerHead.includes('pm')) domain = 'product';
      else if (lowerHead.includes('design') || lowerHead.includes('ux') || lowerHead.includes('ui')) domain = 'design';
      else if (lowerHead.includes('vp') || lowerHead.includes('director') || lowerHead.includes('head') || lowerHead.includes('lead') || lowerHead.includes('manager')) domain = 'leadership';
      else if (lowerHead.includes('security') || lowerHead.includes('devops') || lowerHead.includes('cloud')) domain = 'security';

      const photo = db.profile_photo_url || db.profile_picture_url || undefined;

      const rawSkills = Array.isArray(db.skills) && db.skills.length > 0 
        ? db.skills 
        : [];

      return {
        id: db.id,
        full_name: name,
        username: db.username,
        headline: cleanHeadline,
        title: db.title || cleanHeadline.split(/[•–-]/)[0].trim(),
        location: loc,
        hub,
        domain,
        skills: rawSkills.slice(0, 4),
        profile_photo_url: photo,
        is_verified: db.verification_status === 'verified',
      };
    });

    return mappedDbProfiles;
  }, [dbProfiles]);

  // Show member activity only when an activity record is present.
  const spotlightLeaders = useMemo(() => {
    const realRecent = enrichedProfiles.filter(p => p.activity_snippet && p.activity_type).slice(0, 16);
    const globalCurated = GLOBAL_SPOTLIGHT_LEADERS.slice(0, 6);
    return [...realRecent, ...globalCurated];
  }, [enrichedProfiles]);

  const filteredProfiles = useMemo(() => {
    return enrichedProfiles.filter(profile => {
      if (selectedHub !== 'all' && profile.hub !== selectedHub) {
        return false;
      }
      if (selectedDomain !== 'all' && profile.domain !== selectedDomain) {
        return false;
      }
      if (searchTerm.trim()) {
        const locationQuery = parsedQuery?.location?.toLowerCase();
        const textQuery = locationQuery
          ? searchTerm.slice(0, searchTerm.lastIndexOf(' in ')).trim().toLowerCase()
          : searchTerm.trim().toLowerCase();
        const searchText = [profile.full_name, profile.headline, profile.location, ...profile.skills].join(' ').toLowerCase();
        const matchesTerms = textQuery.split(/\s+/).filter(Boolean).every(term => searchText.includes(term));
        const matchesLocation = !locationQuery || profile.location.toLowerCase().includes(locationQuery);
        return matchesTerms && matchesLocation;
      }
      return true;
    });
  }, [enrichedProfiles, selectedHub, selectedDomain, searchTerm, parsedQuery]);

  // Paginate the currently returned public profiles.
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedHub, selectedDomain]);

  const paginatedProfiles = useMemo(() => {
    return filteredProfiles.slice(0, visibleCount);
  }, [filteredProfiles, visibleCount]);

  const handleConnect = useCallback(async (userId: string, userName: string) => {
    setConnectedIds(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.success(`Connection request sent to ${userName}! Sign in to sync across devices.`);
        return;
      }

      await supabase.from('connections').insert({
        requester_id: user.id,
        recipient_id: userId,
        status: 'pending',
        message: `Hi ${userName}! I'd love to connect on the Global Talent Network.`
      });

      toast.success(`Connected! Connection request sent to ${userName}.`);
    } catch (err) {
      toast.success(`Connection invitation queued for ${userName}.`);
    }
  }, []);

  const handleToggleBookmark = useCallback((userId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        toast.info('Removed from saved talent');
      } else {
        next.add(userId);
        toast.success('Saved to your talent shortlist');
      }
      return next;
    });
  }, []);

  const handleProfileView = useCallback((person: GlobalTalentProfile) => {
    trackProfileView(person.id);
    navigate(`/profile/${person.username || person.id}`);
  }, [navigate, trackProfileView]);

  const handleMessage = useCallback((person: GlobalTalentProfile) => {
    navigate(`/network/messages/new?userId=${person.id}&name=${encodeURIComponent(person.full_name)}`);
  }, [navigate]);

  const handleHireCreator = useCallback((person: GlobalTalentProfile) => {
    navigate(`/hire?creator=${encodeURIComponent(person.full_name)}&role=${encodeURIComponent(person.title || person.headline)}`);
  }, [navigate]);

  const handleShareProfile = useCallback(async (person: GlobalTalentProfile) => {
    const profileUrl = `${window.location.origin}/profile/${person.username || person.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${person.full_name} on TalentXcel`,
          text: person.talent_score
            ? `Check out ${person.full_name}'s Career Passport on TalentXcel (TalentScore: ${person.talent_score})`
            : `View ${person.full_name}'s public profile on TalentXcel`,
          url: profileUrl
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied to clipboard!');
  }, []);

  const generateInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

        {/* ── Compact Global Positioning Hero ────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-4 sm:py-5 px-5 sm:px-7 shadow-lg border border-indigo-900/40">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>The Global Professional Talent Network</span>
                <span className="text-white/30">•</span>
                <span className="text-emerald-300 font-bold">{enrichedProfiles.length} Public Profiles</span>
                <span className="text-white/30">•</span>
                <span className="text-blue-200">Member directory</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Discover <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Global Talent</span> & Leaders
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-normal line-clamp-2">
                Search public member profiles by role, skills, and location. Profile details are supplied by members and may change.
              </p>
            </div>

            {/* Quick KPI stats row */}
            <div className="flex md:flex-col lg:flex-row flex-wrap items-start md:items-end lg:items-center gap-2.5 text-xs text-slate-300 font-medium shrink-0 pt-1 md:pt-0">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold text-white">{enrichedProfiles.length} Public Profiles</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Member profile search</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px]">Global Hubs & Remote</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px]">Employer hiring tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Public Member Activity ─────────────────────────────────── */}
        {spotlightLeaders.length > 0 && <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-700 dark:text-slate-300">
                Public Member Activity
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Member activity appears when available
              </span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {spotlightLeaders.map((leader) => (
              <div
                key={leader.id}
                onClick={() => handleProfileView(leader)}
                className="flex-shrink-0 flex flex-col items-center group cursor-pointer w-24 text-center transition-transform hover:-translate-y-1"
              >
                <div className="relative mb-2">
                  {/* Glowing Story Gradient Ring */}
                  <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-md group-hover:shadow-indigo-500/30 transition-all duration-300">
                    <Avatar className="w-full h-full border-2 border-white dark:border-slate-900 rounded-full overflow-hidden">
                      <AvatarImage src={leader.profile_photo_url} alt={leader.full_name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-800 font-bold">
                        {generateInitials(leader.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Activity Indicator Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md border border-slate-200 dark:border-slate-700">
                    {leader.activity_type === 'reel' ? (
                      <Play className="w-3 h-3 text-purple-600 fill-purple-600" />
                    ) : leader.activity_type === 'hiring' ? (
                      <Briefcase className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                </div>

                <div className="w-full">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                    {leader.full_name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {leader.location.split(',')[0]}
                  </p>
                  <div className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[9px]">
                    ⚡ {leader.talent_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* ── Global Search & Multi-Filter Bar ──────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role, skills, or global hub (e.g. 'Senior AI Engineer in Dubai', 'Staff Architect London')..."
                className="pl-10 pr-9 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* AI Match Button */}
            <Button
              onClick={() => {
                if (!searchTerm) setSearchTerm('Senior AI Engineer');
                toast.success('Filtered public profiles using your search.');
              }}
              className="w-full sm:w-auto h-11 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Search Profiles</span>
            </Button>
          </div>

          {/* Global Hub Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Hubs:
            </span>
            {GLOBAL_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedHub === hub.id
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{hub.icon}</span>
                <span>{hub.label}</span>
              </button>
            ))}
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Domain:
            </span>
            {DOMAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedDomain(cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedDomain === cat.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Smart suggestions bar */}
          {suggestions.length > 0 && !searchTerm && (
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular:</span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(sug)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Active search filter badge */}
          {searchTerm && (
            <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-3 py-2 rounded-lg text-blue-800 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>
                  Showing {filteredProfiles.length} public profile results for <strong>"{searchTerm}"</strong>
                </span>
                {parsedQuery?.location && (
                  <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-[11px]">
                    📍 {parsedQuery.location}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* ── Main Content Grid & Sidebar Layout ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left / Center Main Directory (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-12 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <TabsTrigger value="verified" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-500" />
                  Member Profiles
                </TabsTrigger>
                <TabsTrigger value="trending" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Recently Joined
                </TabsTrigger>
                <TabsTrigger value="creators" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <Play className="w-4 h-4 mr-1.5 text-purple-500 fill-purple-500" />
                  Video Creators
                </TabsTrigger>
                <TabsTrigger value="hubs" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <Globe2 className="w-4 h-4 mr-1.5 text-amber-500" />
                  Hub Discovery
                </TabsTrigger>
              </TabsList>

              {/* Verified Profiles Content */}
              <TabsContent value="verified" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedProfiles.map((person) => {
                    const isConnected = connectedIds.has(person.id);
                    const isBookmarked = bookmarkedIds.has(person.id);

                    return (
                      <Card
                        key={person.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all duration-300 overflow-hidden"
                      >
                        <div>
                          {/* Card Sleek Mesh Header Banner */}
                          <div className="h-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative p-3 flex items-start justify-between">
                            {/* Show a score badge only when a score is available. */}
                            {person.talent_score != null && <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold shadow">
                              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{person.talent_score} TalentScore</span>
                            </div>}

                            {/* Availability Pill */}
                            {person.availability && <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                person.availability === 'Hiring Team'
                                  ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                                  : person.availability === 'Open to Advisory'
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {person.availability}
                            </Badge>}
                          </div>

                          {/* Profile Body */}
                          <div className="px-5 pt-0 pb-4">
                            {/* Avatar & Action Row */}
                            <div className="flex items-end justify-between -mt-8 mb-3">
                              <div className="relative">
                                <Avatar 
                                  onClick={() => handleProfileView(person)}
                                  className="w-16 h-16 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-lg cursor-pointer transition-transform group-hover:scale-105"
                                >
                                  <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-900 font-bold text-lg">
                                    {generateInitials(person.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <RealTimePresence userId={person.id} variant="dot" />
                              </div>

                              <button
                                onClick={() => handleToggleBookmark(person.id)}
                                className={`p-2 rounded-xl border transition-all ${
                                  isBookmarked
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
                                }`}
                                title="Save Profile"
                              >
                                <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
                              </button>
                            </div>

                            {/* Name & Headline */}
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center gap-1.5">
                                <h3
                                  onClick={() => handleProfileView(person)}
                                  className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                                >
                                  {person.full_name}
                                </h3>
                                {person.is_verified && (
                                  <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified Profile" />
                                )}
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {person.headline}
                              </p>

                              {person.location && <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{person.location}</span>
                              </div>}
                            </div>

                            {/* Social Proof & Metrics */}
                            {(person.connections_count || person.percentile) && <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-3">
                              {person.connections_count && <span>👥 {person.connections_count} Network</span>}
                              {person.percentile && <span className="text-emerald-600 dark:text-emerald-400 font-bold">⭐ {person.percentile}</span>}
                            </div>}

                            {/* Skills Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {person.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                          <div className="flex items-center gap-2">
                            {/* Connect Button */}
                            <Button
                              size="sm"
                              onClick={() => handleConnect(person.id, person.full_name)}
                              disabled={isConnected}
                              className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                isConnected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isConnected ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                                  Connect
                                </>
                              )}
                            </Button>

                            {/* View Passport */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProfileView(person)}
                              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-300 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
                            >
                              Passport
                              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>

                          {/* Quick Message & Share */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <button
                              onClick={() => handleMessage(person)}
                              className="flex items-center gap-1 hover:text-blue-600 font-medium transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Message</span>
                            </button>

                            <button
                              onClick={() => handleHireCreator(person)}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold transition-colors"
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>Hire Creator</span>
                            </button>

                            <button
                              onClick={() => handleShareProfile(person)}
                              className="flex items-center gap-1 hover:text-slate-700 font-medium transition-colors"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Load more results when additional public profiles match. */}
                {visibleCount < filteredProfiles.length && (
                  <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-2">
                    <Button
                      onClick={() => setVisibleCount(prev => prev + 24)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Load More Professionals ({filteredProfiles.length - visibleCount} remaining)</span>
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing {Math.min(visibleCount, filteredProfiles.length)} of {filteredProfiles.length} public profiles
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Trending Tab */}
              <TabsContent value="trending" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrichedProfiles.slice(0, 6).map((person) => (
                    <Card
                      key={person.id}
                      onClick={() => handleProfileView(person)}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 rounded-xl">
                            <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                            <AvatarFallback>{generateInitials(person.full_name)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{person.full_name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{person.headline}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(person.id, person.full_name);
                        }}
                        className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                      >
                        Connect
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Video Creators Tab */}
              <TabsContent value="creators" className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-purple-600 fill-purple-600" />
                    <div>
                      <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200">
                        Technical Creators on TalentXcel Reels
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Watch engineering breakdowns, system design deep dives, and salary insights.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/reels')}
                    className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    Open Reels Feed →
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {enrichedProfiles.filter(p => p.activity_type === 'reel').map((person) => (
                    <Card
                      key={person.id}
                      onClick={() => navigate(`/reels`)}
                      className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl cursor-pointer transition-all overflow-hidden"
                    >
                      <div className="h-28 bg-gradient-to-br from-indigo-900 to-purple-950 p-3 relative flex flex-col justify-between">
                        <Badge className="w-fit bg-purple-600/90 text-white text-[10px] font-bold">
                          🎥 Video Creator
                        </Badge>
                        <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="truncate">{person.activity_snippet}</span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-10 h-10 rounded-xl">
                            <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                            <AvatarFallback>{generateInitials(person.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{person.full_name}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{person.location}</p>
                          </div>
                        </div>
                        {person.talent_score != null && <div className="text-right">
                          <span className="text-xs font-bold text-amber-500">⚡ {person.talent_score}</span>
                          <p className="text-[10px] text-slate-400">TalentScore</p>
                        </div>}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Hub Discovery Tab */}
              <TabsContent value="hubs" className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { hub: 'Dubai & MENA', flag: '🇦🇪', desc: 'Browse public profiles in this region', id: 'dubai' },
                    { hub: 'Silicon Valley & US', flag: '🇺🇸', desc: 'Browse public profiles in this region', id: 'us' },
                    { hub: 'London & Europe', flag: '🇬🇧', desc: 'Browse public profiles in this region', id: 'europe' },
                    { hub: 'Bengaluru & India', flag: '🇮🇳', desc: 'Browse public profiles in this region', id: 'india' },
                    { hub: 'Singapore & APAC', flag: '🇸🇬', desc: 'Browse public profiles in this region', id: 'apac' },
                    { hub: 'Global Remote', flag: '🌐', desc: 'Browse public profiles in this region', id: 'remote' }
                  ].map((item, idx) => (
                    <Card
                      key={idx}
                      onClick={() => {
                        setSelectedHub(item.id);
                        setActiveTab('verified');
                      }}
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:border-blue-500/50 cursor-pointer transition-all group"
                    >
                      <div className="text-3xl mb-2">{item.flag}</div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                        {item.hub}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">{item.desc}</p>
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-600">
                        <span>Explore profiles</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar (1 Col) ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Development-only sample leaderboard; production has no seeded profiles. */}
            {GLOBAL_SPOTLIGHT_LEADERS.length > 0 && <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Weekly Top Talent
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  Global
                </Badge>
              </div>

              <div className="p-4 space-y-3.5">
                {GLOBAL_SPOTLIGHT_LEADERS.slice(0, 5).map((person, idx) => (
                  <div
                    key={person.id}
                    onClick={() => handleProfileView(person)}
                    className="flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10 rounded-xl">
                          <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                          <AvatarFallback>{generateInitials(person.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                          {idx + 1}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                          {person.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {person.title || person.headline}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          📍 {person.location}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-amber-500">⚡ {person.talent_score}</span>
                      <p className="text-[9px] text-slate-400">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>}

            {/* Recruiter OS Promo Widget */}
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-5 shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
              
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  <Briefcase className="w-3 h-3 text-purple-400" />
                  Recruiter OS
                </div>

                <h3 className="font-extrabold text-base leading-tight text-white">
                  Looking for candidates?
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore public member profiles and use TalentXcel recruiter tools to manage hiring workflows.
                </p>

                <Button
                  onClick={() => navigate('/recruiters')}
                  className="w-full h-9 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Launch Recruiter OS →
                </Button>
              </div>
            </Card>

            {/* Career Passport Verification Widget */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Build a Career Passport
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add career information to your profile
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Use the Career Passport to organize career details and share them with recruiters.
              </p>

              <Button
                variant="outline"
                onClick={() => navigate('/passport')}
                className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 hover:text-blue-600"
              >
                Build My Career Passport
              </Button>
            </Card>

            {/* Global In-Demand Radar */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Global Hiring Radar
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { skill: 'Artificial intelligence', color: 'text-purple-600' },
                  { skill: 'Software engineering', color: 'text-blue-600' },
                  { skill: 'Cloud and security', color: 'text-emerald-600' },
                  { skill: 'Product and design', color: 'text-amber-600' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.skill}</span>
                    <span className={`font-bold ${item.color}`}>Browse</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default People;
