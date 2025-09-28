import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, Loader2 } from "lucide-react";
import { UserFollowButton } from "@/components/social/UserFollowButton";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from "date-fns";

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

export function FollowingFollowersList() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
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

      // Get following list
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

      // Get followers list
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
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFollowing = following.filter(f =>
    f.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFollowers = followers.filter(f =>
    f.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Tabs defaultValue="following" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Following ({filteredFollowing.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers ({filteredFollowers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4 mt-6">
            {filteredFollowing.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No matching connections' : 'Not following anyone yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Start following people to build your professional network'
                  }
                </p>
              </div>
            ) : (
              filteredFollowing.map((follow) => (
                <UserCard key={follow.id} follow={follow} isFollowing={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4 mt-6">
            {filteredFollowers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No matching followers' : 'No followers yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Share great content to attract followers to your profile'
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