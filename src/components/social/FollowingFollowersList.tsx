import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck, MessageCircle, Search, Loader2 } from "lucide-react";
import { UserFollowButton } from "@/components/social/UserFollowButton";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface User {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  title?: string;
  location?: string;
  followers_count?: number;
  following_count?: number;
}

interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  user?: User;
}

interface ConnectionItem {
  id: string;
  connected_at: string;
  user: User;
}

export function FollowingFollowersList() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUser(user.id);

      // 1. Get real connections from connections table
      try {
        const { data: connectionsData } = await supabase
          .from('connections')
          .select(`
            id,
            requester_id,
            recipient_id,
            status,
            connected_at,
            created_at
          `)
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .order('connected_at', { ascending: false });

        if (connectionsData && connectionsData.length > 0) {
          const otherUserIds = connectionsData.map(c => 
            c.requester_id === user.id ? c.recipient_id : c.requester_id
          ).filter(Boolean);

          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url, title, location, current_company')
            .in('id', otherUserIds);

          const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

          const mappedConnections: ConnectionItem[] = connectionsData.map(c => {
            const otherId = c.requester_id === user.id ? c.recipient_id : c.requester_id;
            const p = profileMap.get(otherId);
            return {
              id: c.id,
              connected_at: c.connected_at || c.created_at,
              user: {
                id: otherId,
                full_name: p?.full_name || 'Professional Member',
                profile_picture_url: p?.profile_picture_url,
                title: p?.title || (p?.current_company ? `Professional at ${p.current_company}` : 'TalentXcel Member'),
                location: p?.location
              }
            };
          });

          setConnections(mappedConnections);
        }
      } catch (connErr) {
        console.warn('Could not load connections table:', connErr);
      }

      // 2. Get following list
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          following:following_id!inner (
            id,
            full_name,
            profile_picture_url,
            title,
            location
          )
        `)
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      // 3. Get followers list
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          follower:follower_id!inner (
            id,
            full_name,
            profile_picture_url,
            title,
            location
          )
        `)
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      setFollowing(followingData?.map(f => ({
        ...f,
        user: Array.isArray(f.following) ? f.following[0] : f.following
      })) || []);

      setFollowers(followersData?.map(f => ({
        ...f,
        user: Array.isArray(f.follower) ? f.follower[0] : f.follower
      })) || []);

    } catch (error) {
      console.error('Error loading follow data:', error);
      // Non-blocking error handling
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConnections = connections.filter(c =>
    c.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowing = following.filter(f =>
    f.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowers = followers.filter(f =>
    f.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ConnectionCard = ({ connection }: { connection: ConnectionItem }) => {
    if (!connection.user) return null;

    return (
      <Card className="hover:border-blue-200 transition-colors">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/network/people/${connection.user.id}`}>
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 hover:scale-105 transition-transform shrink-0">
                  <AvatarImage src={connection.user.profile_picture_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                    {connection.user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <Link to={`/network/people/${connection.user.id}`} className="hover:text-blue-600 transition-colors">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{connection.user.full_name}</h4>
                </Link>
                {connection.user.title && (
                  <p className="text-xs text-muted-foreground truncate">{connection.user.title}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  {connection.user.location && <span className="truncate">{connection.user.location} &bull;</span>}
                  <span className="shrink-0">Connected {formatDistanceToNow(new Date(connection.connected_at))} ago</span>
                </div>
              </div>
            </div>
            <Link to={`/network/messages/new?userId=${connection.user.id}`} className="shrink-0">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Message</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserCard = ({ follow, isFollowing = false }: { follow: Follow; isFollowing?: boolean }) => {
    if (!follow.user) return null;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={follow.user.profile_picture_url} />
                <AvatarFallback>
                  {follow.user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{follow.user.full_name}</h4>
                {follow.user.title && (
                  <p className="text-sm text-muted-foreground">{follow.user.title}</p>
                )}
                {follow.user.location && (
                  <p className="text-xs text-muted-foreground">{follow.user.location}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isFollowing ? 'Following since' : 'Follower since'} {formatDistanceToNow(new Date(follow.created_at))} ago
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <UserFollowButton 
                userId={follow.user.id} 
                size="sm" 
                followersCount={follow.user.followers_count}
                showFollowersCount={false}
              />
              {(follow.user.followers_count || follow.user.following_count) && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {follow.user.followers_count && (
                    <span>{follow.user.followers_count} followers</span>
                  )}
                  {follow.user.following_count && (
                    <span>{follow.user.following_count} following</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Network
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections" className="flex items-center gap-1.5 text-xs font-bold">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Connections ({filteredConnections.length})</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-1.5 text-xs font-bold">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Following ({filteredFollowing.length})</span>
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-1.5 text-xs font-bold">
              <Users className="h-3.5 w-3.5" />
              <span>Followers ({filteredFollowers.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-3 mt-4">
            {filteredConnections.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">
                  {searchTerm ? 'No matching connections' : 'No connections yet'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Start connecting with people to build your executive network'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredConnections.map((conn) => (
                  <ConnectionCard key={conn.id} connection={conn} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-3 mt-4">
            {filteredFollowing.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">
                  {searchTerm ? 'No matching people' : 'Not following anyone yet'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Follow leaders and innovators in your industry to stay updated'
                  }
                </p>
              </div>
            ) : (
              filteredFollowing.map((follow) => (
                <UserCard key={follow.id} follow={follow} isFollowing={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-3 mt-4">
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">
                  {searchTerm ? 'No matching followers' : 'No followers yet'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Publish insightful articles and posts to attract followers'
                  }
                </p>
              </div>
            ) : (
              filteredFollowers.map((follow) => (
                <UserCard key={follow.id} follow={follow} isFollowing={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}