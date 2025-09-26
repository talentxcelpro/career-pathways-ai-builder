import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Globe,
  Lock,
  Crown,
  Star,
  Activity
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  is_private: boolean;
  created_at: string;
  avatar_url?: string;
  is_featured?: boolean;
  activity_level?: string;
  recent_activity?: string;
}

const Communities: React.FC = () => {
  const { user } = useAuth();
  const { joinInterestCommunity, loading } = useAdvancedNetworking();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
    if (user?.id) {
      fetchMyCommunities();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('communities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities'
        },
        () => {
          fetchCommunities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_memberships'
        },
        () => {
          if (user?.id) {
            fetchMyCommunities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });
      
      if (error) throw error;
      
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          *,
          communities (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      
      setMyCommunities(data?.map(membership => membership.communities).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching my communities:', error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    const result = await joinInterestCommunity(communityId);
    if (result.success) {
      fetchMyCommunities();
    }
  };

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(communities.map(c => c.category))];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-6">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Professional Communities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join interest-based communities and connect with like-minded professionals
          </p>
          <Button className="apple-button text-lg px-8 py-4 smooth-bounce bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Plus className="h-5 w-5 mr-2" />
            Create Community
          </Button>
        </div>

        <Tabs defaultValue="discover" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
              <TabsTrigger value="discover" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Discover
              </TabsTrigger>
              <TabsTrigger value="my-communities" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                My Communities ({myCommunities.length})
              </TabsTrigger>
              <TabsTrigger value="featured" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Featured
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="discover" className="space-y-8">
          {/* Search and Filters */}
          <div className="apple-card">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="apple-input pl-12 text-lg"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="apple-input"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {community.avatar_url ? (
                        <img 
                          src={community.avatar_url} 
                          alt={community.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        {community.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                        {community.is_private && <Lock className="h-4 w-4 text-gray-500" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {community.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.member_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getActivityIcon(community.activity_level || 'low')}
                        <span>{community.recent_activity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleJoinCommunity(community.id)}
                      disabled={loading}
                    >
                      {loading ? 'Joining...' : 'Join'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-communities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCommunities.map((community) => (
              <Card key={community.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{community.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Member
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {myCommunities.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No communities joined yet</h3>
                <p className="text-muted-foreground mb-4">Discover communities that match your interests</p>
                <Button>Explore Communities</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.filter(c => c.is_featured).map((community) => (
              <Card key={community.id} className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                      <Badge className="text-xs">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.member_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getActivityIcon(community.activity_level || 'low')}
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Communities;