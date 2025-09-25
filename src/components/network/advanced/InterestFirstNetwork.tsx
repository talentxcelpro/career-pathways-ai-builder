import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { Search, Users, Sparkles, Hash, TrendingUp, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export const InterestFirstNetwork = () => {
  const { user } = useAuth();
  const { joinInterestCommunity, loading } = useAdvancedNetworking();
  const [communities, setCommunities] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
    if (user) fetchUserInterests();
  }, [user]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('interest_communities')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('community_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserInterests(data?.map(item => item.community_id) || []);
    } catch (error) {
      console.error('Error fetching user interests:', error);
    }
  };

  const filteredCommunities = communities.filter((community: any) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleJoinCommunity = async (communityId: string) => {
    const result = await joinInterestCommunity(communityId);
    if (result.success) {
      fetchUserInterests();
      fetchCommunities(); // Refresh to update member count
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) throw error;
      toast.success('Left community successfully');
      fetchUserInterests();
      fetchCommunities();
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  };

  const getCommunityIcon = (category: string) => {
    switch (category) {
      case 'technology': return '💻';
      case 'design': return '🎨';
      case 'business': return '💼';
      case 'marketing': return '📈';
      case 'finance': return '💰';
      case 'health': return '🏥';
      case 'education': return '📚';
      case 'sports': return '⚽';
      case 'music': return '🎵';
      case 'travel': return '✈️';
      default: return '🌟';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interest-First Professional Network</h2>
          <p className="text-muted-foreground">Connect with professionals who share your passions</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {userInterests.length} Communities Joined
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search communities by name, topic, or hashtag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* My Communities */}
      {userInterests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Communities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities
              .filter((community: any) => userInterests.includes(community.id))
              .map((community: any) => (
                <Card key={community.id} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getCommunityIcon(community.category)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{community.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {community.member_count} members
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {community.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Hash className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleLeaveCommunity(community.id)}
                      >
                        Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Discover Communities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Discover Communities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities
            .filter((community: any) => !userInterests.includes(community.id))
            .map((community: any) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCommunityIcon(community.category)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{community.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {community.member_count} members
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {community.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {community.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Hash className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {community.tags?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{community.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleJoinCommunity(community.id)}
                    disabled={loading}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {loading ? 'Joining...' : 'Join Community'}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        {filteredCommunities.filter((community: any) => !userInterests.includes(community.id)).length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'New communities will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};