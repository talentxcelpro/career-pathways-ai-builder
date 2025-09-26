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
  }, [user?.id]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll create mock communities since the table might not exist yet
      const mockCommunities: Community[] = [
        {
          id: '1',
          name: 'AI & Machine Learning',
          description: 'Discuss the latest in artificial intelligence, machine learning, and data science',
          category: 'Technology',
          member_count: 12547,
          is_private: false,
          created_at: new Date().toISOString(),
          is_featured: true,
          activity_level: 'high',
          recent_activity: '5 min ago'
        },
        {
          id: '2',
          name: 'Startup Founders',
          description: 'Connect with fellow entrepreneurs and startup founders',
          category: 'Business',
          member_count: 8934,
          is_private: false,
          created_at: new Date().toISOString(),
          is_featured: true,
          activity_level: 'high',
          recent_activity: '12 min ago'
        },
        {
          id: '3',
          name: 'UI/UX Designers',
          description: 'Share designs, get feedback, and discuss design trends',
          category: 'Design',
          member_count: 15632,
          is_private: false,
          created_at: new Date().toISOString(),
          activity_level: 'medium',
          recent_activity: '1 hour ago'
        },
        {
          id: '4',
          name: 'Remote Workers',
          description: 'Tips, tools, and community for remote work professionals',
          category: 'Career',
          member_count: 23156,
          is_private: false,
          created_at: new Date().toISOString(),
          activity_level: 'high',
          recent_activity: '30 min ago'
        },
        {
          id: '5',
          name: 'Product Managers',
          description: 'Product management strategies, frameworks, and best practices',
          category: 'Product',
          member_count: 9876,
          is_private: false,
          created_at: new Date().toISOString(),
          activity_level: 'medium',
          recent_activity: '2 hours ago'
        },
        {
          id: '6',
          name: 'Elite Leaders Circle',
          description: 'Exclusive community for C-level executives and senior leaders',
          category: 'Leadership',
          member_count: 456,
          is_private: true,
          created_at: new Date().toISOString(),
          activity_level: 'low',
          recent_activity: '1 day ago'
        }
      ];

      setCommunities(mockCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    try {
      // Mock user communities
      const mockMyCommunities = communities.slice(0, 2);
      setMyCommunities(mockMyCommunities);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Professional Communities</h1>
          <p className="text-muted-foreground">Join interest-based communities and connect with like-minded professionals</p>
        </div>
        
        <Button className="mt-4 lg:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-communities">My Communities ({myCommunities.length})</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

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
  );
};

export default Communities;