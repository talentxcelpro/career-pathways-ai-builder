import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Briefcase, 
  Users, 
  Heart, 
  Search, 
  TrendingUp, 
  Sparkles, 
  UserPlus, 
  Check, 
  Play, 
  Zap, 
  ShieldCheck, 
  Award, 
  Share2, 
  Send, 
  Globe2, 
  X, 
  ArrowUpRight, 
  ChevronRight,
  UserCheck,
  Building2,
  ArrowRight
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
  domain: 'tech' | 'leadership' | 'product' | 'design' | 'finance' | 'marketing' | 'healthcare' | 'operations' | 'unknown';
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

const GLOBAL_SPOTLIGHT_LEADERS: GlobalTalentProfile[] = [];

const GLOBAL_HUBS = [
  { id: 'all', label: 'Worldwide' },
  { id: 'dubai', label: 'Dubai & MENA' },
  { id: 'us', label: 'Silicon Valley & US' },
  { id: 'europe', label: 'London & Europe' },
  { id: 'india', label: 'Bengaluru & India' },
  { id: 'apac', label: 'Singapore & APAC' },
  { id: 'remote', label: 'Global Remote' }
];

const DOMAIN_CATEGORIES = [
  { id: 'all', label: 'All Industries' },
  { id: 'tech', label: 'Technology & AI' },
  { id: 'leadership', label: 'Executive & Leadership' },
  { id: 'product', label: 'Product & Strategy' },
  { id: 'design', label: 'Design & Creative' },
  { id: 'finance', label: 'Finance & Banking' },
  { id: 'marketing', label: 'Marketing & Sales' },
  { id: 'healthcare', label: 'Healthcare & Life Sciences' },
  { id: 'operations', label: 'Operations & HR' }
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
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const parsedQuery = useMemo(() => {
    const locationMatch = searchTerm.match(/\bin\s+(.+)$/i);
    return locationMatch ? { location: locationMatch[1].trim() } : null;
  }, [searchTerm]);

  const suggestions = useMemo(() => searchTerm.trim() ? [] : [
    'Senior AI Engineer in Dubai',
    'Product Designer in London',
    'Cloud Architect in Bengaluru',
    'Finance Director in Singapore'
  ], [searchTerm]);

  const selectSuggestion = useCallback((suggestion: string) => setSearchTerm(suggestion), []);

  const queryClient = useQueryClient();

  // Fetch public profiles in newest-first order
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

  // Dynamic Realtime subscription
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
            toast.success(`${insertedProfile.full_name} joined the public directory.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Map public member profiles
  const enrichedProfiles = useMemo(() => {
    const mappedDbProfiles: GlobalTalentProfile[] = (dbProfiles || [])
      .filter((db) => db.profile_visibility === 'public' && Boolean(db.full_name) && Boolean(db.headline || db.title))
      .map((db) => {
        const name = db.full_name as string;
        const cleanHeadline = db.headline || db.title;
        const loc = db.location || '';
        
        let hub: GlobalTalentProfile['hub'] = 'unknown';
        const lowerLoc = loc.toLowerCase();
        if (lowerLoc.includes('dubai') || lowerLoc.includes('uae') || lowerLoc.includes('doha') || lowerLoc.includes('abu dhabi')) hub = 'dubai';
        else if (lowerLoc.includes('us') || lowerLoc.includes('california') || lowerLoc.includes('york') || lowerLoc.includes('francisco') || lowerLoc.includes('seattle') || lowerLoc.includes('austin')) hub = 'us';
        else if (lowerLoc.includes('uk') || lowerLoc.includes('london') || lowerLoc.includes('berlin') || lowerLoc.includes('europe') || lowerLoc.includes('germany') || lowerLoc.includes('paris')) hub = 'europe';
        else if (lowerLoc.includes('india') || lowerLoc.includes('bengaluru') || lowerLoc.includes('mumbai') || lowerLoc.includes('delhi') || lowerLoc.includes('hyderabad') || lowerLoc.includes('noida') || lowerLoc.includes('pune')) hub = 'india';
        else if (lowerLoc.includes('singapore') || lowerLoc.includes('tokyo') || lowerLoc.includes('seoul') || lowerLoc.includes('sydney')) hub = 'apac';
        else if (lowerLoc.includes('remote')) hub = 'remote';

        const rawSkills = Array.isArray(db.skills) && db.skills.length > 0 
          ? db.skills 
          : [];

        let domain: GlobalTalentProfile['domain'] = 'unknown';
        const lowerSearch = (cleanHeadline + ' ' + (db.title || '') + ' ' + rawSkills.join(' ')).toLowerCase();
        if (lowerSearch.includes('ai') || lowerSearch.includes('ml') || lowerSearch.includes('software') || lowerSearch.includes('engineer') || lowerSearch.includes('developer') || lowerSearch.includes('cloud') || lowerSearch.includes('devops') || lowerSearch.includes('security') || lowerSearch.includes('data')) {
          domain = 'tech';
        } else if (lowerSearch.includes('vp') || lowerSearch.includes('director') || lowerSearch.includes('head') || lowerSearch.includes('chief') || lowerSearch.includes('founder') || lowerSearch.includes('ceo') || lowerSearch.includes('lead') || lowerSearch.includes('executive')) {
          domain = 'leadership';
        } else if (lowerSearch.includes('product') || lowerSearch.includes('pm')) {
          domain = 'product';
        } else if (lowerSearch.includes('design') || lowerSearch.includes('ux') || lowerSearch.includes('ui') || lowerSearch.includes('creative')) {
          domain = 'design';
        } else if (lowerSearch.includes('finance') || lowerSearch.includes('banking') || lowerSearch.includes('invest') || lowerSearch.includes('fintech') || lowerSearch.includes('accounting')) {
          domain = 'finance';
        } else if (lowerSearch.includes('market') || lowerSearch.includes('sales') || lowerSearch.includes('growth') || lowerSearch.includes('brand')) {
          domain = 'marketing';
        } else if (lowerSearch.includes('health') || lowerSearch.includes('med') || lowerSearch.includes('pharma') || lowerSearch.includes('bio')) {
          domain = 'healthcare';
        } else if (lowerSearch.includes('hr') || lowerSearch.includes('talent') || lowerSearch.includes('recruit') || lowerSearch.includes('people') || lowerSearch.includes('operat')) {
          domain = 'operations';
        }

        const photo = db.profile_photo_url || db.profile_picture_url || undefined;

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

  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedHub, selectedDomain]);

  const paginatedProfiles = useMemo(() => {
    return filteredProfiles.slice(0, visibleCount);
  }, [filteredProfiles, visibleCount]);

  const handleConnect = useCallback(async (userId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to send connection requests.");
        navigate('/auth');
        return;
      }

      if (user.id === userId) {
        toast.info("You cannot connect with your own profile.");
        return;
      }

      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        recipient_id: userId,
        status: 'pending',
        message: `Hi ${userName}! I'd love to connect on the TalentXcel Professional Network.`
      });

      if (error) {
        if (error.code === '23505') {
          toast.info(`A connection request with ${userName} already exists.`);
        } else {
          throw error;
        }
      } else {
        toast.success(`Connection request sent to ${userName}!`);

        // Automatically dispatch Connection Request email to recipient
        Promise.all([
          supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('full_name, headline, current_job_title, current_company, location, profile_picture_url, avatar_url')
            .eq('id', user.id)
            .maybeSingle()
        ])
          .then(([{ data: recProfile }, { data: senderProfile }]) => {
            if (recProfile?.email) {
              const myName = senderProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'A TalentXcel Member';
              const myTitle = senderProfile?.headline || senderProfile?.current_job_title || '';
              const myCompany = senderProfile?.current_company || '';
              const myLocation = senderProfile?.location || '';
              const myAvatar = senderProfile?.avatar_url || senderProfile?.profile_picture_url || user.user_metadata?.avatar_url || '';
              const personalNote = `Hi ${userName}! I'd love to connect on the TalentXcel Professional Network.`;

              fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: recProfile.email,
                  recipientName: recProfile.full_name || userName,
                  template: 'connection_request',
                  priority: 1,
                  immediate: true,
                  variables: {
                    sender_name: myName,
                    senderName: myName,
                    inviter_name: myName,
                    sender_title: myTitle,
                    senderTitle: myTitle,
                    sender_company: myCompany,
                    senderCompany: myCompany,
                    sender_location: myLocation,
                    senderLocation: myLocation,
                    sender_avatar: myAvatar,
                    senderAvatar: myAvatar,
                    personal_note: personalNote,
                    name: recProfile.full_name || userName,
                    recipient_name: recProfile.full_name || userName
                  }
                })
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }

      setConnectedIds(prev => new Set(prev).add(userId));
    } catch (err: any) {
      console.error("Connection error:", err);
      toast.error(err.message || "Failed to send connection request. Please try again.");
    }
  }, [navigate]);

  const handleFollow = useCallback(async (userId: string, userName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.info("Please sign in to follow professionals.");
        navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const isAlreadyFollowing = followingIds.has(userId);
      if (isAlreadyFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        toast.info(`Unfollowed ${userName}`);
      } else {
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        setFollowingIds(prev => new Set(prev).add(userId));
        toast.success(`Now following ${userName}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to follow");
    }
  }, [followingIds, navigate]);

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

  const handleShareProfile = useCallback(async (person: GlobalTalentProfile) => {
    const profileUrl = `${window.location.origin}/profile/${person.username || person.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${person.full_name} on TalentXcel`,
          text: `View ${person.full_name}'s Career Passport on TalentXcel`,
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
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Apple-Style Minimalist Slim Hero Header ─────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Global Professional Directory</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{enrichedProfiles.length} Verified Profiles</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                Discover Global Talent & Leaders
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Connect with verified professionals across technology, leadership, finance, healthcare, and global industries.
              </p>
            </div>

            {/* Apple-style slim pill metrics */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 shadow-xs">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>{enrichedProfiles.length} Public Profiles</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 shadow-xs">
                <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Global Hubs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Verified Passports</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Spotlight Member Activity (if available) ───────────────── */}
        {spotlightLeaders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Featured Leaders
                </h2>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {spotlightLeaders.map((leader) => (
                <div
                  key={leader.id}
                  onClick={() => handleProfileView(leader)}
                  className="shrink-0 flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-xs"
                >
                  <Avatar className="w-9 h-9 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                    <AvatarImage src={leader.profile_photo_url} alt={leader.full_name} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-800 text-xs font-bold">
                      {generateInitials(leader.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                      {leader.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {leader.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Apple-Style Unified Search & Multi-Industry Filter Bar ─── */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
          {/* Sleek Search Pill */}
          <div className="relative flex items-center w-full bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-4 h-11 border border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-600 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, skills, company, or hub (e.g. 'AI Engineer', 'Product Lead Dubai', 'Cardiologist')..."
              className="w-full bg-transparent border-0 text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 mr-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                if (!searchTerm) setSearchTerm('Senior AI Engineer');
                toast.success('Filtered public profiles using your search.');
              }}
              className="h-8 px-4 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-xs shrink-0 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Global Hubs Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1.5 uppercase tracking-wider">
              Hub:
            </span>
            {GLOBAL_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                  selectedHub === hub.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-medium'
                    : 'bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/40'
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>

          {/* Cross-Industry Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1.5 uppercase tracking-wider">
              Industry:
            </span>
            {DOMAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedDomain(cat.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                  selectedDomain === cat.id
                    ? 'bg-blue-600 text-white shadow-xs font-medium'
                    : 'bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Popular Search Suggestions */}
          {suggestions.length > 0 && !searchTerm && (
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap text-[11px] text-slate-400">
              <span className="font-medium text-slate-400">Popular:</span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(sug)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/80 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Active Search Badge */}
          {searchTerm && (
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Showing {filteredProfiles.length} results for <strong>"{searchTerm}"</strong>
                </span>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Main Layout: 3 Columns Grid + 1 Column Sidebar ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Directory Content (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Apple Segmented Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
              <div className="flex items-center justify-between pb-1">
                <TabsList className="h-9 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 inline-flex">
                  <TabsTrigger 
                    value="verified" 
                    className="rounded-full text-xs font-medium px-4 h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs transition-all"
                  >
                    Member Profiles
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending" 
                    className="rounded-full text-xs font-medium px-4 h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs transition-all"
                  >
                    Recently Joined
                  </TabsTrigger>
                  <TabsTrigger 
                    value="creators" 
                    className="rounded-full text-xs font-medium px-4 h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs transition-all"
                  >
                    Video Creators
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hubs" 
                    className="rounded-full text-xs font-medium px-4 h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-xs transition-all"
                  >
                    Hubs
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Verified Profiles Content */}
              <TabsContent value="verified" className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {paginatedProfiles.map((person) => {
                    const isConnected = connectedIds.has(person.id);
                    const isFollowing = followingIds.has(person.id);
                    const isBookmarked = bookmarkedIds.has(person.id);

                    return (
                      <Card
                        key={person.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 p-5 overflow-hidden"
                      >
                        <div className="space-y-4">
                          {/* Card Top: Avatar + Micro Badges + Bookmark */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="relative">
                              <Avatar 
                                onClick={() => handleProfileView(person)}
                                className="w-13 h-13 rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-700 shadow-xs cursor-pointer group-hover:scale-102 transition-transform"
                              >
                                <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                                  {generateInitials(person.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <RealTimePresence userId={person.id} variant="dot" />
                            </div>

                            <div className="flex items-center gap-1.5">
                              {person.availability && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                                  {person.availability}
                                </span>
                              )}
                              {person.talent_score != null && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  {person.talent_score}
                                </span>
                              )}
                              <button
                                onClick={() => handleToggleBookmark(person.id)}
                                className={`p-1.5 rounded-full transition-colors ${
                                  isBookmarked
                                    ? 'bg-rose-50 text-rose-500'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Save Profile"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-500' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Identity & Headline */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <h3
                                onClick={() => handleProfileView(person)}
                                className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors tracking-tight truncate"
                              >
                                {person.full_name}
                              </h3>
                              {person.is_verified && (
                                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" title="Verified Professional" />
                              )}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                              {person.headline}
                            </p>

                            {person.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{person.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Skills Pills */}
                          {person.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {person.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-normal"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Bottom: Slim Apple Action Row */}
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                          {/* Connect, Follow, Passport Row */}
                          <div className="flex items-center gap-2">
                            {/* Connect Button */}
                            <Button
                              size="sm"
                              onClick={() => handleConnect(person.id, person.full_name)}
                              disabled={isConnected}
                              className={`flex-1 h-8 rounded-full text-xs font-medium transition-all shadow-xs ${
                                isConnected
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                            >
                              {isConnected ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Connect
                                </>
                              )}
                            </Button>

                            {/* Follow Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFollow(person.id, person.full_name)}
                              className={`h-8 px-3 rounded-full text-xs font-medium border-slate-200 dark:border-slate-700 transition-colors ${
                                isFollowing
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1 text-blue-600" />
                                  Following
                                </>
                              ) : (
                                'Follow'
                              )}
                            </Button>

                            {/* View Passport */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProfileView(person)}
                              className="h-8 px-3 rounded-full text-xs font-medium border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              Passport
                              <ArrowUpRight className="w-3 h-3 ml-1 text-slate-400" />
                            </Button>
                          </div>

                          {/* Quick Message & Share */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 px-0.5">
                            <button
                              onClick={() => handleMessage(person)}
                              className="flex items-center gap-1.5 hover:text-blue-600 text-slate-500 dark:text-slate-400 font-medium transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Message</span>
                            </button>

                            <button
                              onClick={() => handleShareProfile(person)}
                              className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 text-slate-400 transition-colors"
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

                {/* Load More Button */}
                {visibleCount < filteredProfiles.length && (
                  <div className="pt-6 pb-4 flex flex-col items-center justify-center gap-2">
                    <Button
                      onClick={() => setVisibleCount(prev => prev + 24)}
                      size="sm"
                      className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs px-6 h-9 rounded-full shadow-xs transition-all"
                    >
                      Load More Professionals ({filteredProfiles.length - visibleCount} remaining)
                    </Button>
                    <p className="text-[11px] text-slate-400">
                      Showing {Math.min(visibleCount, filteredProfiles.length)} of {filteredProfiles.length} profiles
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Recently Joined Tab */}
              <TabsContent value="trending" className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrichedProfiles.slice(0, 8).map((person) => (
                    <Card
                      key={person.id}
                      onClick={() => handleProfileView(person)}
                      className="p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                          <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                          <AvatarFallback className="text-xs font-bold">{generateInitials(person.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{person.full_name}</h4>
                            {person.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{person.headline}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(person.id, person.full_name);
                        }}
                        className="h-7 px-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shrink-0 ml-2"
                      >
                        Connect
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Video Creators Tab */}
              <TabsContent value="creators" className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-purple-600 fill-purple-600" />
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                        Technical Creators on TalentXcel Reels
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-400 font-normal">
                        Engineering breakdowns, system architecture deep-dives, and salary benchmarks.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/reels')}
                    size="sm"
                    className="h-8 px-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shrink-0"
                  >
                    Open Reels
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {enrichedProfiles.filter(p => p.activity_type === 'reel').map((person) => (
                    <Card
                      key={person.id}
                      onClick={() => navigate(`/reels`)}
                      className="group rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg cursor-pointer transition-all overflow-hidden"
                    >
                      <div className="h-24 bg-gradient-to-br from-slate-900 to-indigo-950 p-3 relative flex flex-col justify-between text-white">
                        <Badge className="w-fit bg-purple-600 text-white text-[10px] font-medium border-0">
                          Video Creator
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                          <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="truncate">{person.activity_snippet}</span>
                        </div>
                      </div>
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-9 h-9 rounded-xl">
                            <AvatarImage src={person.profile_photo_url} alt={person.full_name} className="object-cover" />
                            <AvatarFallback>{generateInitials(person.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white">{person.full_name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{person.location}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Hub Discovery Tab */}
              <TabsContent value="hubs" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { hub: 'Dubai & MENA', desc: 'Browse verified profiles in Dubai, UAE & Middle East', id: 'dubai' },
                    { hub: 'Silicon Valley & US', desc: 'Browse verified profiles in SF, NY, Seattle & Remote', id: 'us' },
                    { hub: 'London & Europe', desc: 'Browse verified profiles in London, Berlin & Paris', id: 'europe' },
                    { hub: 'Bengaluru & India', desc: 'Browse verified profiles in Bengaluru, Mumbai & Delhi', id: 'india' },
                    { hub: 'Singapore & APAC', desc: 'Browse verified profiles in Singapore, Tokyo & Sydney', id: 'apac' },
                    { hub: 'Global Remote', desc: 'Browse distributed professionals worldwide', id: 'remote' }
                  ].map((item, idx) => (
                    <Card
                      key={idx}
                      onClick={() => {
                        setSelectedHub(item.id);
                        setActiveTab('verified');
                      }}
                      className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-blue-500/50 cursor-pointer transition-all group"
                    >
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {item.hub}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 mb-3">{item.desc}</p>
                      <div className="flex items-center justify-between text-xs font-medium text-blue-600">
                        <span>Explore hub</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Apple-Style Slim Right Sidebar (1 Col) ───────────────── */}
          <div className="space-y-4">

            {/* Recruiter OS Widget */}
            <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold tracking-wide uppercase">
                <Briefcase className="w-3 h-3 text-blue-500" />
                Recruiter OS
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                  Hiring top candidates?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Search verified talent and manage candidate pipelines with integrated recruiter workflows.
                </p>
              </div>

              <Button
                onClick={() => navigate('/recruiters')}
                className="w-full h-8 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-xs transition-colors"
              >
                Launch Recruiter OS
              </Button>
            </Card>

            {/* Career Passport Widget */}
            <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                  Career Passport
                </h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Organize your verified skills, projects, and benchmarks into a shareable professional credential.
              </p>

              <Button
                variant="outline"
                onClick={() => navigate('/passport')}
                className="w-full h-8 rounded-full border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Build My Passport
              </Button>
            </Card>

            {/* Global In-Demand Radar */}
            <Card className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                  Global Hiring Radar
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { skill: 'Artificial Intelligence & ML', count: 'High Demand' },
                  { skill: 'Full-Stack & Cloud Systems', count: 'Active' },
                  { skill: 'Product & Systems Design', count: 'Trending' },
                  { skill: 'Executive & Technical Leadership', count: 'Active' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
                    <span className="text-slate-600 dark:text-slate-300 font-normal">{item.skill}</span>
                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">{item.count}</span>
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
