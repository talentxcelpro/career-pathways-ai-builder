import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Search, 
  Loader2, 
  Clock, 
  Check, 
  X, 
  Sparkles,
  ExternalLink,
  UserX
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useNetworkRelationships } from '@/hooks/useNetworkRelationships';
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { getStandardAvatarUrl } from '@/utils/avatarUtils';
import { getPublicProfilePath } from '@/utils/userProfileSlug';

interface ProfileSummary {
  id: string;
  full_name: string;
  profile_picture_url?: string | null;
  title?: string | null;
  headline?: string | null;
  location?: string | null;
  current_company?: string | null;
  slug?: string | null;
  custom_profile_url?: string | null;
  username?: string | null;
  is_online?: boolean | null;
}

export function FollowingFollowersList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'received' | 'sent' | 'following' | 'followers'>('connections');

  const {
    currentUser,
    isLoading: isRelLoading,
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

  // 1. Fetch raw connections
  const { data: rawConnections = [], isLoading: isConnectionsLoading } = useQuery({
    queryKey: ['following-followers-connections', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from('connections')
        .select('id, requester_id, recipient_id, status, created_at, connected_at, message')
        .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`);

      if (error) return [];
      return data || [];
    },
    enabled: !!currentUser?.id
  });

  // 2. Fetch raw follows
  const { data: rawFollows = { following: [], followers: [] }, isLoading: isFollowsLoading } = useQuery({
    queryKey: ['following-followers-follows', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { following: [], followers: [] };
      const [followingRes, followersRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select('id, following_id, created_at')
          .eq('follower_id', currentUser.id),
        supabase
          .from('user_follows')
          .select('id, follower_id, created_at')
          .eq('following_id', currentUser.id)
      ]);

      return {
        following: followingRes.data || [],
        followers: followersRes.data || []
      };
    },
    enabled: !!currentUser?.id
  });

  // 3. Batch fetch partner profiles
  const partnerIds = useMemo(() => {
    if (!currentUser?.id) return [];
    const set = new Set<string>();

    for (const c of rawConnections) {
      const other = c.requester_id === currentUser.id ? c.recipient_id : c.requester_id;
      if (other) set.add(other);
    }
    for (const f of rawFollows.following) {
      if (f.following_id) set.add(f.following_id);
    }
    for (const f of rawFollows.followers) {
      if (f.follower_id) set.add(f.follower_id);
    }
    return Array.from(set);
  }, [rawConnections, rawFollows, currentUser?.id]);

  const { data: profilesMap = new Map<string, ProfileSummary>() } = useQuery({
    queryKey: ['following-followers-partner-profiles', partnerIds],
    queryFn: async () => {
      if (partnerIds.length === 0) return new Map<string, ProfileSummary>();

      const chunkSize = 100;
      const allProfiles: any[] = [];
      for (let i = 0; i < partnerIds.length; i += chunkSize) {
        const chunk = partnerIds.slice(i, i + chunkSize);
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, title, headline, location, current_company, slug, custom_profile_url, username, is_online')
          .in('id', chunk);
        if (data) allProfiles.push(...data);
      }

      const map = new Map<string, ProfileSummary>();
      for (const p of allProfiles) {
        map.set(p.id, {
          id: p.id,
          full_name: p.full_name || 'TalentXcel Member',
          title: p.title || p.headline || 'Professional',
          headline: p.headline,
          profile_picture_url: getStandardAvatarUrl(p.profile_picture_url),
          location: p.location,
          current_company: p.current_company,
          slug: p.slug,
          custom_profile_url: p.custom_profile_url,
          username: p.username,
          is_online: Boolean(p.is_online)
        });
      }
      return map;
    },
    enabled: partnerIds.length > 0
  });

  // Filtered lists
  const {
    connectionsList,
    receivedList,
    sentList,
    followingList,
    followersList
  } = useMemo(() => {
    if (!currentUser?.id) {
      return { connectionsList: [], receivedList: [], sentList: [], followingList: [], followersList: [] };
    }

    const conn: any[] = [];
    const rec: any[] = [];
    const sent: any[] = [];

    for (const c of rawConnections) {
      const otherId = c.requester_id === currentUser.id ? c.recipient_id : c.requester_id;
      const profile = profilesMap.get(otherId) || { id: otherId, full_name: 'Member', is_online: false };
      const item = { ...c, profile };

      if (c.status === 'accepted') {
        conn.push(item);
      } else if (c.status === 'pending') {
        if (c.recipient_id === currentUser.id) rec.push(item);
        else if (c.requester_id === currentUser.id) sent.push(item);
      }
    }

    const following = rawFollows.following.map(f => ({
      ...f,
      profile: profilesMap.get(f.following_id) || { id: f.following_id, full_name: 'Member', is_online: false }
    }));

    const followers = rawFollows.followers.map(f => ({
      ...f,
      profile: profilesMap.get(f.follower_id) || { id: f.follower_id, full_name: 'Member', is_online: false }
    }));

    const searchFilter = (list: any[]) => {
      if (!searchTerm.trim()) return list;
      const q = searchTerm.toLowerCase().trim();
      return list.filter(item => 
        item.profile.full_name.toLowerCase().includes(q) ||
        (item.profile.title && item.profile.title.toLowerCase().includes(q)) ||
        (item.profile.location && item.profile.location.toLowerCase().includes(q))
      );
    };

    return {
      connectionsList: searchFilter(conn),
      receivedList: searchFilter(rec),
      sentList: searchFilter(sent),
      followingList: searchFilter(following),
      followersList: searchFilter(followers)
    };
  }, [rawConnections, rawFollows, profilesMap, currentUser?.id, searchTerm]);

  const initials = (name?: string) => {
    return (name || 'TX')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'recently';
    try {
      return formatDistanceToNow(new Date(dateStr)) + ' ago';
    } catch {
      return 'recently';
    }
  };

  const isLoading = isRelLoading || isConnectionsLoading || isFollowsLoading;

  if (isLoading && !currentUser) {
    return (
      <Card className="rounded-2xl border-slate-200/80 dark:border-border/60">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground mt-2 font-medium">Loading relationships...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-border/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-foreground">
            <Users className="h-4.5 w-4.5 text-blue-600" />
            <span>Connections &amp; Follower Graph</span>
          </CardTitle>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by name, title, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8.5 h-8 text-xs bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-border rounded-xl"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-slate-100 dark:bg-muted rounded-xl gap-1">
            <TabsTrigger value="connections" className="text-xs font-bold py-1.5 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <UserCheck className="h-3.5 w-3.5 mr-1 text-blue-600" />
              <span>Connected ({connectionsList.length})</span>
            </TabsTrigger>

            <TabsTrigger value="received" className="text-xs font-bold py-1.5 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              <span>Wants to Connect ({receivedList.length})</span>
            </TabsTrigger>

            <TabsTrigger value="sent" className="text-xs font-bold py-1.5 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
              <span>Pending ({sentList.length})</span>
            </TabsTrigger>

            <TabsTrigger value="following" className="text-xs font-bold py-1.5 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <span>Following ({followingList.length})</span>
            </TabsTrigger>

            <TabsTrigger value="followers" className="text-xs font-bold py-1.5 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
              <span>Followers ({followersList.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CONNECTIONS */}
          <TabsContent value="connections" className="space-y-2.5 mt-3">
            {connectionsList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <UserCheck className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-foreground">
                  {searchTerm.trim() ? `No connections matching "${searchTerm}"` : 'No connections found'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {searchTerm.trim()
                    ? 'Try searching the global talent directory to connect with them.'
                    : 'Discover verified professionals to expand your circle.'}
                </p>
                <Button size="sm" onClick={() => navigate(searchTerm.trim() ? `/talent?q=${encodeURIComponent(searchTerm.trim())}` : '/network/discover')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-7.5 rounded-lg mt-1">
                  {searchTerm.trim() ? 'Search All Platform Members' : 'Discover People'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {connectionsList.map((item) => {
                  const p = item.profile;
                  const slug = p.slug || p.custom_profile_url || p.username || p.id;
                  const profileLink = getPublicProfilePath(slug);

                  return (
                    <div key={item.id} className="p-3 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="relative shrink-0">
                          <Avatar className="h-10 w-10 ring-1 ring-slate-200">
                            {p.profile_picture_url ? <AvatarImage src={p.profile_picture_url} /> : null}
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                              {initials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {p.is_online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 truncate block">
                            {p.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.location || 'India'} • Connected {formatAgo(item.connected_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          className="h-7 px-3 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                          onClick={() => navigate(`/network/messages/new?userId=${p.id}`)}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 rounded-lg"
                          onClick={() => removeConnection(item.id, p.full_name)}
                          disabled={isRemoving}
                          title="Remove connection"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: WANTS TO CONNECT */}
          <TabsContent value="received" className="space-y-2.5 mt-3">
            {receivedList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Check className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No pending incoming invitations</h4>
                <p className="text-xs text-muted-foreground">You are fully up to date on all requests.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedList.map((item) => {
                  const p = item.profile;
                  const slug = p.slug || p.custom_profile_url || p.username || p.id;
                  const profileLink = getPublicProfilePath(slug);

                  return (
                    <div key={item.id} className="p-3.5 bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="relative shrink-0">
                          <Avatar className="h-11 w-11 ring-2 ring-emerald-300">
                            {p.profile_picture_url ? <AvatarImage src={p.profile_picture_url} /> : null}
                            <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                              {initials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-emerald-600 truncate block">
                              {p.full_name}
                            </Link>
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-300">
                              Wants to connect
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{p.title}</p>
                          <span className="text-[10px] text-slate-400">Invited {formatAgo(item.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          className="h-7 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-2xs"
                          onClick={() => accept(item.id, p.full_name)}
                          disabled={isAccepting}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
                          onClick={() => decline(item.id, p.full_name)}
                          disabled={isDeclining}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: PENDING SENT */}
          <TabsContent value="sent" className="space-y-2.5 mt-3">
            {sentList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No outgoing pending invitations</h4>
                <p className="text-xs text-muted-foreground">Invitations you send will be tracked here until accepted.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sentList.map((item) => {
                  const p = item.profile;
                  const slug = p.slug || p.custom_profile_url || p.username || p.id;
                  const profileLink = getPublicProfilePath(slug);

                  return (
                    <div key={item.id} className="p-3 bg-amber-50/20 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="shrink-0">
                          <Avatar className="h-10 w-10 ring-1 ring-amber-300">
                            {p.profile_picture_url ? <AvatarImage src={p.profile_picture_url} /> : null}
                            <AvatarFallback className="bg-amber-600 text-white font-bold text-xs">
                              {initials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 truncate block">
                              {p.full_name}
                            </Link>
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 bg-amber-50 text-amber-800 border-amber-300">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{p.title}</p>
                          <span className="text-[10px] text-slate-400">Sent {formatAgo(item.created_at)}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-[11px] font-bold border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg shrink-0"
                        onClick={() => withdraw(item.id, p.full_name)}
                        disabled={isWithdrawing}
                      >
                        Withdraw
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: FOLLOWING */}
          <TabsContent value="following" className="space-y-2.5 mt-3">
            {followingList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-foreground">Not following anyone yet</h4>
                <p className="text-xs text-muted-foreground">Follow industry leaders to see their updates.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {followingList.map((item) => {
                  const p = item.profile;
                  const slug = p.slug || p.custom_profile_url || p.username || p.id;
                  const profileLink = getPublicProfilePath(slug);

                  return (
                    <div key={item.id} className="p-3 bg-white dark:bg-card border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="shrink-0">
                          <Avatar className="h-10 w-10 ring-1 ring-slate-200">
                            {p.profile_picture_url ? <AvatarImage src={p.profile_picture_url} /> : null}
                            <AvatarFallback className="bg-purple-600 text-white font-bold text-xs">
                              {initials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0">
                          <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 truncate block">
                            {p.full_name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">{p.title}</p>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 px-3 text-[11px] font-bold bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg group shrink-0"
                        onClick={() => toggleFollow(p.id, p.full_name)}
                        disabled={isTogglingFollow}
                      >
                        <span className="group-hover:hidden">Following ✓</span>
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 5: FOLLOWERS */}
          <TabsContent value="followers" className="space-y-2.5 mt-3">
            {followersList.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-foreground">No followers yet</h4>
                <p className="text-xs text-muted-foreground">Post articles and engage with peers to grow your followers.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {followersList.map((item) => {
                  const p = item.profile;
                  const slug = p.slug || p.custom_profile_url || p.username || p.id;
                  const profileLink = getPublicProfilePath(slug);
                  const rel = getRelationship(p.id);

                  return (
                    <div key={item.id} className="p-3 bg-white dark:bg-card border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link to={profileLink} className="shrink-0">
                          <Avatar className="h-10 w-10 ring-1 ring-slate-200">
                            {p.profile_picture_url ? <AvatarImage src={p.profile_picture_url} /> : null}
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                              {initials(p.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link to={profileLink} className="font-extrabold text-xs text-foreground hover:text-blue-600 truncate block">
                              {p.full_name}
                            </Link>
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                              Follows you
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{p.title}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className={`h-7 px-3 text-[11px] font-bold rounded-lg shrink-0 ${
                          rel.isFollowing
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                        onClick={() => toggleFollow(p.id, p.full_name)}
                        disabled={isTogglingFollow}
                      >
                        {rel.isFollowing ? 'Following ✓' : 'Follow Back'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FollowingFollowersList;
