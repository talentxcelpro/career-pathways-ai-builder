import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  MessageCircle, 
  UserX, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  MapPin, 
  Bell, 
  Clock, 
  Check, 
  X, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Compass,
  TrendingUp,
  LayoutGrid,
  List
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkRelationships } from '@/hooks/useNetworkRelationships';
import { getStandardAvatarUrl } from '@/utils/avatarUtils';
import { getPublicProfilePath } from '@/utils/userProfileSlug';
import { formatDistanceToNow } from 'date-fns';
import { SEOHead } from '@/components/seo/SEOHead';

interface ProfileSummary {
  id: string;
  full_name: string;
  title?: string | null;
  headline?: string | null;
  profile_picture_url?: string | null;
  location?: string | null;
  current_company?: string | null;
  slug?: string | null;
  custom_profile_url?: string | null;
  username?: string | null;
  is_online?: boolean | null;
  last_seen?: string | null;
  skills?: string[] | null;
}

interface EnrichedConnectionItem {
  id: string;
  partnerId: string;
  status: string;
  created_at: string;
  connected_at: string | null;
  message?: string | null;
  profile: ProfileSummary;
}

export const Connections: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'connections';
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'online'>('recent');
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  const queryClient = useQueryClient();

  const {
    getRelationship,
    accept,
    decline,
    withdraw,
    removeConnection,
    toggleFollow,
    isAccepting,
    isDeclining,
    isWithdrawing,
    isRemoving,
    isTogglingFollow,
    connectedCount,
    pendingReceivedCount,
    pendingSentCount,
    followingCount,
    followersCount
  } = useNetworkRelationships();

  const handleTabChange = (val: string) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', val);
      return updated;
    }, { replace: true });
  };

  // 1. Fetch live connections table records
  const { data: rawConnections = [], isLoading: isConnectionsLoading } = useQuery({
    queryKey: ['connections-page-all-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('connections')
        .select('id, requester_id, recipient_id, status, created_at, connected_at, message')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        // INCIDENT-FIX: added query limit [date: 2026-11-21]
        .limit(100);

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  // 2. Fetch live follows table records
  const { data: rawFollows = { following: [], followers: [] }, isLoading: isFollowsLoading } = useQuery({
    queryKey: ['connections-page-all-follows', user?.id],
    queryFn: async () => {
      if (!user?.id) return { following: [], followers: [] };
      const [followingRes, followersRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select('id, following_id, created_at')
          .eq('follower_id', user.id)
          // INCIDENT-FIX: added query limit [date: 2026-11-21]
          .limit(100),
        supabase
          .from('user_follows')
          .select('id, follower_id, created_at')
          .eq('following_id', user.id)
          // INCIDENT-FIX: added query limit [date: 2026-11-21]
          .limit(100)
      ]);

      return {
        following: followingRes.data || [],
        followers: followersRes.data || []
      };
    },
    enabled: !!user?.id
  });

  // 3. Collect all partner IDs needing profile hydration
  const allPartnerIds = useMemo(() => {
    if (!user?.id) return [];
    const ids = new Set<string>();

    for (const conn of rawConnections) {
      const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
      if (otherId) ids.add(otherId);
    }

    for (const f of rawFollows.following) {
      if (f.following_id) ids.add(f.following_id);
    }

    for (const f of rawFollows.followers) {
      if (f.follower_id) ids.add(f.follower_id);
    }

    return Array.from(ids);
  }, [rawConnections, rawFollows, user?.id]);

  // 4. Batch fetch profiles in safe chunks of 100
  const { data: profilesMap = new Map<string, ProfileSummary>(), isLoading: isProfilesLoading } = useQuery({
    queryKey: ['connections-partner-profiles', allPartnerIds],
    queryFn: async () => {
      if (allPartnerIds.length === 0) return new Map<string, ProfileSummary>();

      const chunkSize = 100;
      const allProfiles: any[] = [];

      for (let i = 0; i < allPartnerIds.length; i += chunkSize) {
        const chunk = allPartnerIds.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, title, headline, profile_picture_url, location, current_company, slug, custom_profile_url, username, is_online, last_seen, skills')
          .in('id', chunk);

        if (error || !data || data.length === 0) {
          const { data: pubData } = await supabase
            .from('public_profiles')
            .select('id, full_name, title, headline, profile_picture_url, location, current_company, username')
            .in('id', chunk);
          if (pubData) allProfiles.push(...pubData);
        } else if (data) {
          allProfiles.push(...data);
        }
      }

      const map = new Map<string, ProfileSummary>();
      for (const p of allProfiles) {
        map.set(p.id, {
          id: p.id,
          full_name: p.full_name || 'TalentXcel Member',
          title: p.title || p.headline || 'Industry Professional',
          headline: p.headline,
          profile_picture_url: getStandardAvatarUrl(p.profile_picture_url),
          location: p.location,
          current_company: p.current_company,
          slug: p.slug,
          custom_profile_url: p.custom_profile_url,
          username: p.username,
          is_online: Boolean(p.is_online),
          last_seen: p.last_seen,
          skills: p.skills || []
        });
      }

      return map;
    },
    enabled: allPartnerIds.length > 0,
    staleTime: 30000
  });

  // 5. Partition into 5 distinct categorized lists
  const {
    acceptedConnections,
    receivedRequests,
    sentRequests,
    followingList,
    followersList
  } = useMemo(() => {
    if (!user?.id) {
      return {
        acceptedConnections: [],
        receivedRequests: [],
        sentRequests: [],
        followingList: [],
        followersList: []
      };
    }

    const accepted: EnrichedConnectionItem[] = [];
    const received: EnrichedConnectionItem[] = [];
    const sent: EnrichedConnectionItem[] = [];

    for (const conn of rawConnections) {
      const partnerId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
      const profile = profilesMap.get(partnerId) || {
        id: partnerId,
        full_name: 'TalentXcel Member',
        title: 'Professional',
        is_online: false
      };

      const item: EnrichedConnectionItem = {
        id: conn.id,
        partnerId,
        status: conn.status || 'pending',
        created_at: conn.created_at || new Date().toISOString(),
        connected_at: conn.connected_at,
        message: conn.message,
        profile
      };

      if (conn.status === 'accepted') {
        accepted.push(item);
      } else if (conn.status === 'pending') {
        if (conn.recipient_id === user.id) {
          received.push(item);
        } else if (conn.requester_id === user.id) {
          sent.push(item);
        }
      }
    }

    const following: { id: string; profile: ProfileSummary; created_at: string }[] = [];
    for (const f of rawFollows.following) {
      const profile = profilesMap.get(f.following_id) || {
        id: f.following_id,
        full_name: 'TalentXcel Member',
        title: 'Professional',
        is_online: false
      };
      following.push({ id: f.id, profile, created_at: f.created_at });
    }

    const followers: { id: string; profile: ProfileSummary; created_at: string }[] = [];
    for (const f of rawFollows.followers) {
      const profile = profilesMap.get(f.follower_id) || {
        id: f.follower_id,
        full_name: 'TalentXcel Member',
        title: 'Professional',
        is_online: false
      };
      followers.push({ id: f.id, profile, created_at: f.created_at });
    }

    return {
      acceptedConnections: accepted,
      receivedRequests: received,
      sentRequests: sent,
      followingList: following,
      followersList: followers
    };
  }, [rawConnections, rawFollows, profilesMap, user?.id]);

  // Helper filter and sorter for the active tab list
  const filterAndSortProfiles = <T extends { profile: ProfileSummary; created_at?: string; connected_at?: string | null }>(list: T[]): T[] => {
    return list
      .filter(item => {
        if (filterOnlineOnly && !item.profile.is_online) return false;
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase().trim();
        const p = item.profile;
        return (
          p.full_name.toLowerCase().includes(term) ||
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.current_company && p.current_company.toLowerCase().includes(term)) ||
          (p.location && p.location.toLowerCase().includes(term)) ||
          (p.skills && p.skills.some(s => s.toLowerCase().includes(term)))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.profile.full_name.localeCompare(b.profile.full_name);
        }
        if (sortBy === 'online') {
          return Number(b.profile.is_online) - Number(a.profile.is_online);
        }
        // default recent
        const timeA = new Date(a.connected_at || a.created_at || 0).getTime();
        const timeB = new Date(b.connected_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });
  };

  const filteredConnections = useMemo(() => filterAndSortProfiles(acceptedConnections), [acceptedConnections, searchTerm, sortBy, filterOnlineOnly]);
  const filteredReceived = useMemo(() => filterAndSortProfiles(receivedRequests), [receivedRequests, searchTerm, sortBy, filterOnlineOnly]);
  const filteredSent = useMemo(() => filterAndSortProfiles(sentRequests), [sentRequests, searchTerm, sortBy, filterOnlineOnly]);
  const filteredFollowing = useMemo(() => filterAndSortProfiles(followingList), [followingList, searchTerm, sortBy, filterOnlineOnly]);
  const filteredFollowers = useMemo(() => filterAndSortProfiles(followersList), [followersList, searchTerm, sortBy, filterOnlineOnly]);

  const initialsFor = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TX';
  };

  const formatTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background/95 py-6 px-3 sm:px-6 font-system">
      <SEOHead
        title="My Connections & Network Relationships · TalentXcel"
        description="Manage your verified professional connections, pending invitations, and follower graph in real time."
        canonical="https://talentxcel.in/network/connections"
      />

      <div className="max-w-7xl mx-auto space-y-5">
        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/network')}
              className="h-8 px-2.5 rounded-xl border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Network
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Connections &amp; Relationships
                <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200">
                  Live Sync
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time command center for your professional connections, pending invitations, and follower graph.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/network/discover')}
              className="text-xs h-8 px-3 rounded-xl font-bold border-slate-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Compass className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Discover People
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/network/verified')}
              className="text-xs h-8 px-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Verified Network
            </Button>
          </div>
        </div>

        {/* TOP 4 STATISTIC METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Connections */}
          <Card 
            className={`cursor-pointer transition-all border ${
              activeTab === 'connections'
                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                : 'border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:border-blue-300'
            } rounded-2xl overflow-hidden`}
            onClick={() => handleTabChange('connections')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground">My Connections</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{acceptedConnections.length}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <UserCheck className="h-2.5 w-2.5" />
                  Accepted peers
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Who Wants to Connect (Received Invitations) */}
          <Card 
            className={`cursor-pointer transition-all border ${
              activeTab === 'received'
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                : receivedRequests.length > 0
                  ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-card hover:border-emerald-400'
                  : 'border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:border-slate-300'
            } rounded-2xl overflow-hidden`}
            onClick={() => handleTabChange('received')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground">Wants to Connect</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                  {receivedRequests.length}
                  {receivedRequests.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold animate-pulse">
                      Action Needed
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Incoming invitations
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <UserPlus className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Invitations Sent (Pending Outgoing) */}
          <Card 
            className={`cursor-pointer transition-all border ${
              activeTab === 'sent'
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                : 'border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:border-amber-300'
            } rounded-2xl overflow-hidden`}
            onClick={() => handleTabChange('sent')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground">Invitations Sent</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{sentRequests.length}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Pending response
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Following & Followers */}
          <Card 
            className={`cursor-pointer transition-all border ${
              activeTab === 'following' || activeTab === 'followers'
                ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 shadow-xs'
                : 'border-slate-200/80 dark:border-border/60 bg-white dark:bg-card hover:border-purple-300'
            } rounded-2xl overflow-hidden`}
            onClick={() => handleTabChange('following')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground">Follower Graph</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{followingList.length}</span>
                  <span className="text-[10px] text-muted-foreground">Following</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{followersList.length}</span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Social reach
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PRIMARY RELATIONSHIP TABS */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            <TabsList className="bg-slate-100 dark:bg-muted p-1 rounded-xl h-auto flex flex-wrap gap-1">
              <TabsTrigger 
                value="connections" 
                className="text-xs font-bold py-1.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>My Connections</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                  {acceptedConnections.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger 
                value="received" 
                className="text-xs font-bold py-1.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Who Wants to Connect</span>
                {receivedRequests.length > 0 && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 ml-0.5 bg-emerald-600 text-white font-bold animate-pulse">
                    {receivedRequests.length}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="sent" 
                className="text-xs font-bold py-1.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Invitations Sent</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                  {sentRequests.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger 
                value="following" 
                className="text-xs font-bold py-1.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <span>Following</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                  {followingList.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger 
                value="followers" 
                className="text-xs font-bold py-1.5 px-3 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
              >
                <span>Followers</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                  {followersList.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* View Mode Switcher (Grid vs Compact) */}
            <div className="flex items-center gap-1.5">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setViewMode('compact')}
                title="Compact Row View"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* SEARCH & FILTERS CONTROLS BAR */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-border rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="h-8.5 w-[130px] text-xs rounded-xl border-slate-200 dark:border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="online">Online First</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filterOnlineOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
                className="h-8.5 text-xs rounded-xl font-bold border-slate-200 dark:border-border"
              >
                <span className={`h-2 w-2 rounded-full mr-1.5 ${filterOnlineOnly ? 'bg-white' : 'bg-emerald-500'}`} />
                Online Only
              </Button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: MY CONNECTIONS                                                     */}
          {/* ========================================================================= */}
          <TabsContent value="connections" className="mt-0 space-y-4">
            {isConnectionsLoading || isProfilesLoading ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-semibold">Loading your verified connections...</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <Users className="h-12 w-12 text-slate-300 dark:text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">
                  {searchTerm || filterOnlineOnly ? 'No matching connections found' : 'No connections established yet'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchTerm || filterOnlineOnly
                    ? 'Try adjusting your search criteria or clearing filters.'
                    : 'Discover industry leaders and colleagues across the TalentXcel professional graph.'}
                </p>
                <div className="pt-2">
                  <Button onClick={() => navigate('/network/discover')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-8">
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Discover People to Connect
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredConnections.map(({ id, partnerId, profile, connected_at }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);

                  return (
                    <div
                      key={id}
                      className="bg-white dark:bg-card border border-slate-200/90 dark:border-border/70 hover:border-blue-400 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="text-center space-y-2">
                        <Link to={profileLink} className="inline-block relative">
                          <Avatar className="w-14 h-14 mx-auto ring-2 ring-slate-100 dark:ring-muted group-hover:ring-blue-500/40 transition-all shadow-xs">
                            {profile.profile_picture_url ? (
                              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm">
                              {initialsFor(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {profile.is_online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-card rounded-full shadow-2xs" title="Online now" />
                          )}
                        </Link>

                        <div className="space-y-0.5">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 block truncate" title={profile.full_name}>
                            {profile.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium" title={profile.title || ''}>
                            {profile.title}
                          </p>
                          {profile.current_company && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center justify-center gap-1">
                              <Building2 className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{profile.current_company}</span>
                            </p>
                          )}
                          {profile.location && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center justify-center gap-1">
                              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{profile.location}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-1 flex items-center justify-center gap-1">
                          <Badge variant="outline" className="text-[9.5px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300">
                            Connected ✓
                          </Badge>
                          {connected_at && (
                            <span className="text-[9px] text-muted-foreground">
                              {formatTimeAgo(connected_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted"
                          onClick={() => navigate(profileLink)}
                        >
                          Profile
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs"
                          onClick={() => navigate(`/network/messages/new?userId=${partnerId}`)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[11px] h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => removeConnection(id, profile.full_name)}
                          disabled={isRemoving}
                          title="Remove Connection"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Compact Row View */
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl divide-y divide-slate-100 dark:divide-border/40 overflow-hidden shadow-xs">
                {filteredConnections.map(({ id, partnerId, profile, connected_at }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);

                  return (
                    <div key={id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="relative shrink-0">
                          <Avatar className="w-10 h-10 ring-1 ring-slate-200 dark:ring-muted">
                            {profile.profile_picture_url ? (
                              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                              {initialsFor(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {profile.is_online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 truncate block">
                            {profile.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">{profile.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {profile.current_company ? `${profile.current_company} • ` : ''}
                            {profile.location || 'India'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          Connected {formatTimeAgo(connected_at)}
                        </span>
                        <Button
                          size="sm"
                          className="text-[11px] h-7 px-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white"
                          onClick={() => navigate(`/network/messages/new?userId=${partnerId}`)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200"
                          onClick={() => navigate(profileLink)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-red-600"
                          onClick={() => removeConnection(id, profile.full_name)}
                          disabled={isRemoving}
                          title="Remove connection"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: WHO WANTS TO CONNECT (RECEIVED INCOMING PENDING REQUESTS)          */}
          {/* ========================================================================= */}
          <TabsContent value="received" className="mt-0 space-y-4">
            {filteredReceived.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <Check className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">You are all caught up!</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  No pending connection requests waiting for your review. When industry peers invite you to connect, they will appear right here with 1-click acceptance.
                </p>
                <div className="pt-2">
                  <Button onClick={() => navigate('/network/discover')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-8">
                    <Compass className="h-3.5 w-3.5 mr-1.5" />
                    Discover More Peers
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReceived.map(({ id, partnerId, profile, created_at, message }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);

                  return (
                    <Card key={id} className="border border-emerald-200/80 dark:border-emerald-900/50 bg-white dark:bg-card rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <Link to={profileLink} className="relative shrink-0">
                            <Avatar className="w-12 h-12 ring-2 ring-emerald-200 dark:ring-emerald-900 shadow-xs">
                              {profile.profile_picture_url ? (
                                <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                              ) : null}
                              <AvatarFallback className="bg-emerald-600 text-white font-black text-sm">
                                {initialsFor(profile.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            {profile.is_online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
                            )}
                          </Link>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={profileLink} className="font-extrabold text-sm text-foreground hover:text-emerald-600 transition-colors">
                                {profile.full_name}
                              </Link>
                              <Badge variant="outline" className="text-[9.5px] font-bold px-2 py-0.2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300">
                                Wants to Connect
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                Invited {formatTimeAgo(created_at)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-1">{profile.title}</p>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              {profile.current_company && <span>{profile.current_company}</span>}
                              {profile.current_company && profile.location && <span>•</span>}
                              {profile.location && <span>{profile.location}</span>}
                            </div>

                            {message && (
                              <div className="mt-1.5 p-2 bg-slate-50 dark:bg-muted/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-border/40">
                                "{message}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Accept & Decline Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs"
                            onClick={() => accept(id, profile.full_name)}
                            disabled={isAccepting}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                            onClick={() => decline(id, profile.full_name)}
                            disabled={isDeclining}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 px-2.5 rounded-xl text-slate-500"
                            onClick={() => navigate(profileLink)}
                          >
                            Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: INVITATIONS SENT (PENDING OUTGOING REQUESTS)                       */}
          {/* ========================================================================= */}
          <TabsContent value="sent" className="mt-0 space-y-4">
            {filteredSent.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <Clock className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-foreground">No outgoing pending invitations</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  When you send connection invitations to professionals on TalentXcel, you can track their status and manage or withdraw them here.
                </p>
                <div className="pt-2">
                  <Button onClick={() => navigate('/network/discover')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-8">
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Find People to Connect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSent.map(({ id, partnerId, profile, created_at, message }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);

                  return (
                    <Card key={id} className="border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-card rounded-2xl overflow-hidden shadow-xs">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <Link to={profileLink} className="relative shrink-0">
                            <Avatar className="w-12 h-12 ring-2 ring-amber-200 dark:ring-amber-900 shadow-xs">
                              {profile.profile_picture_url ? (
                                <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                              ) : null}
                              <AvatarFallback className="bg-amber-600 text-white font-black text-sm">
                                {initialsFor(profile.full_name)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link to={profileLink} className="font-extrabold text-sm text-foreground hover:text-blue-600 transition-colors">
                                {profile.full_name}
                              </Link>
                              <Badge variant="outline" className="text-[9.5px] font-bold px-2 py-0.2 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300">
                                <Clock className="h-2.5 w-2.5 mr-1" />
                                Pending Response
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                Sent {formatTimeAgo(created_at)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-1">{profile.title}</p>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              {profile.current_company && <span>{profile.current_company}</span>}
                              {profile.current_company && profile.location && <span>•</span>}
                              {profile.location && <span>{profile.location}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-3 rounded-xl border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            onClick={() => withdraw(id, profile.full_name)}
                            disabled={isWithdrawing}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Withdraw Invitation
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 px-2.5 rounded-xl text-slate-500"
                            onClick={() => navigate(profileLink)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: FOLLOWING                                                          */}
          {/* ========================================================================= */}
          <TabsContent value="following" className="mt-0 space-y-4">
            {filteredFollowing.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <TrendingUp className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-foreground">You are not following any members yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Follow industry professionals to keep up with their latest articles, career milestones, and reels in your network feed.
                </p>
                <div className="pt-2">
                  <Button onClick={() => navigate('/network/discover')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-8">
                    <Compass className="h-3.5 w-3.5 mr-1.5" />
                    Discover People
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredFollowing.map(({ id, profile, created_at }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);

                  return (
                    <div
                      key={id}
                      className="bg-white dark:bg-card border border-slate-200/90 dark:border-border/70 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="text-center space-y-2">
                        <Link to={profileLink} className="inline-block relative">
                          <Avatar className="w-14 h-14 mx-auto ring-2 ring-slate-100 shadow-xs">
                            {profile.profile_picture_url ? (
                              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-purple-600 text-white font-black text-sm">
                              {initialsFor(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="space-y-0.5">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 block truncate">
                            {profile.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{profile.title}</p>
                          {profile.current_company && (
                            <p className="text-[10px] text-slate-500 truncate">{profile.current_company}</p>
                          )}
                        </div>

                        <div className="pt-1">
                          <Badge variant="outline" className="text-[9.5px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                            Following ✓
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold border-slate-200"
                          onClick={() => navigate(profileLink)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold bg-slate-100 hover:bg-red-50 hover:text-red-600 group"
                          onClick={() => toggleFollow(profile.id, profile.full_name)}
                          disabled={isTogglingFollow}
                        >
                          <span className="group-hover:hidden">Following ✓</span>
                          <span className="hidden group-hover:inline">Unfollow</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 5: FOLLOWERS                                                          */}
          {/* ========================================================================= */}
          <TabsContent value="followers" className="mt-0 space-y-4">
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 p-6 space-y-3">
                <Users className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-foreground">No followers yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Publish articles, share career updates, and engage in communities to grow your professional following on TalentXcel.
                </p>
                <div className="pt-2">
                  <Button onClick={() => navigate('/network')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-8">
                    View Network Feed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredFollowers.map(({ id, profile }) => {
                  const profileSlug = profile.slug || profile.custom_profile_url || profile.username || profile.id;
                  const profileLink = getPublicProfilePath(profileSlug);
                  const rel = getRelationship(profile.id);

                  return (
                    <div
                      key={id}
                      className="bg-white dark:bg-card border border-slate-200/90 dark:border-border/70 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="text-center space-y-2">
                        <Link to={profileLink} className="inline-block relative">
                          <Avatar className="w-14 h-14 mx-auto ring-2 ring-slate-100 shadow-xs">
                            {profile.profile_picture_url ? (
                              <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-indigo-600 text-white font-black text-sm">
                              {initialsFor(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="space-y-0.5">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 block truncate">
                            {profile.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{profile.title}</p>
                          {profile.current_company && (
                            <p className="text-[10px] text-slate-500 truncate">{profile.current_company}</p>
                          )}
                        </div>

                        <div className="pt-1">
                          <Badge variant="outline" className="text-[9.5px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                            Follows you
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold border-slate-200"
                          onClick={() => navigate(profileLink)}
                        >
                          Profile
                        </Button>
                        <Button
                          size="sm"
                          className={`flex-1 text-[11px] h-7 px-2 rounded-lg font-bold ${
                            rel.isFollowing
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                          onClick={() => toggleFollow(profile.id, profile.full_name)}
                          disabled={isTogglingFollow}
                        >
                          {rel.isFollowing ? 'Following ✓' : 'Follow Back'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connections;
