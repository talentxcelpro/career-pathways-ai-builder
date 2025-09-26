import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Plus, Hash, TrendingUp, MessageSquare, Crown } from "lucide-react";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";

const CommunitiesHub = () => {
  const { user } = useAuth();
  const { communities, joinCommunity, createCommunity, isLoading, isProcessing } = useNetworking();
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommunityForm, setNewCommunityForm] = useState({
    name: '',
    description: '',
    industryCategory: '',
    isPrivate: false
  });

  // Mock communities data since table might not exist yet
  const mockCommunities = [
    {
      id: '1',
      name: 'Product Management Leaders',
      description: 'A community for product managers to share insights, best practices, and career advice.',
      industry_category: 'Product Management',
      member_count: 1247,
      post_count: 892,
      is_private: false,
      is_verified: true,
      cover_image_url: '/placeholder-community.png',
      recent_activity: '2 hours ago',
      top_contributors: ['Sarah J.', 'Mike R.', 'Lisa K.']
    },
    {
      id: '2',
      name: 'Frontend Developers United',
      description: 'Discuss React, Vue, Angular, and other frontend technologies. Share projects and get feedback.',
      industry_category: 'Software Development',
      member_count: 2156,
      post_count: 1534,
      is_private: false,
      is_verified: true,
      cover_image_url: '/placeholder-community.png',
      recent_activity: '1 hour ago',
      top_contributors: ['Alex C.', 'Emma W.', 'David L.']
    },
    {
      id: '3',
      name: 'Data Science Professionals',
      description: 'Machine learning, AI, data analytics, and everything data science related.',
      industry_category: 'Data Science',
      member_count: 3421,
      post_count: 2387,
      is_private: false,
      is_verified: true,
      cover_image_url: '/placeholder-community.png',
      recent_activity: '30 minutes ago',
      top_contributors: ['Dr. Smith', 'Anna P.', 'Tom H.']
    },
    {
      id: '4',
      name: 'UX/UI Design Circle',
      description: 'User experience, interface design, design systems, and creative inspiration.',
      industry_category: 'Design',
      member_count: 987,
      post_count: 654,
      is_private: false,
      is_verified: false,
      cover_image_url: '/placeholder-community.png',
      recent_activity: '4 hours ago',
      top_contributors: ['Maya S.', 'Chris B.', 'Zoe M.']
    },
    {
      id: '5',
      name: 'Startup Founders Network',
      description: 'Exclusive community for startup founders to share experiences and get advice.',
      industry_category: 'Entrepreneurship',
      member_count: 445,
      post_count: 298,
      is_private: true,
      is_verified: true,
      cover_image_url: '/placeholder-community.png',
      recent_activity: '1 hour ago',
      top_contributors: ['John D.', 'Rachel F.', 'Kevin L.']
    }
  ];

  const industryCategories = [
    'Technology', 'Product Management', 'Design', 'Marketing', 'Sales',
    'Data Science', 'Engineering', 'Finance', 'Healthcare', 'Education',
    'Entrepreneurship', 'Consulting', 'Human Resources', 'Operations'
  ];

  const filteredCommunities = mockCommunities.filter(community =>
    searchQuery === '' ||
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.industry_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await joinCommunity(communityId);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunityForm.name || !newCommunityForm.description || !newCommunityForm.industryCategory) {
      return;
    }

    try {
      await createCommunity({
        name: newCommunityForm.name,
        description: newCommunityForm.description,
        industryCategory: newCommunityForm.industryCategory,
        isPrivate: newCommunityForm.isPrivate
      });
      
      setNewCommunityForm({
        name: '',
        description: '',
        industryCategory: '',
        isPrivate: false
      });
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="communityName">Community Name</Label>
                <Input
                  id="communityName"
                  placeholder="Enter community name..."
                  value={newCommunityForm.name}
                  onChange={(e) => setNewCommunityForm({...newCommunityForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communityDescription">Description</Label>
                <Textarea
                  id="communityDescription"
                  placeholder="What is this community about?"
                  value={newCommunityForm.description}
                  onChange={(e) => setNewCommunityForm({...newCommunityForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industryCategory">Industry Category</Label>
                <Select 
                  value={newCommunityForm.industryCategory} 
                  onValueChange={(value) => setNewCommunityForm({...newCommunityForm, industryCategory: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry category" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newCommunityForm.isPrivate}
                  onChange={(e) => setNewCommunityForm({...newCommunityForm, isPrivate: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isPrivate">Make this community private</Label>
              </div>
              
              <Button 
                onClick={handleCreateCommunity} 
                disabled={!newCommunityForm.name || !newCommunityForm.description || !newCommunityForm.industryCategory || isProcessing}
                className="w-full"
              >
                Create Community
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Industry Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...industryCategories.slice(0, 6)].map((category) => (
          <Badge 
            key={category} 
            variant="outline" 
            className="cursor-pointer hover:bg-accent"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <Card key={community.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.cover_image_url} />
                    <AvatarFallback>
                      <Hash className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{community.name}</h3>
                      {community.is_verified && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {community.is_private && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{community.industry_category}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {community.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {community.member_count.toLocaleString()} members
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {community.post_count} posts
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Active Contributors</span>
                  <span>{community.recent_activity}</span>
                </div>
                <div className="flex gap-1">
                  {community.top_contributors.slice(0, 3).map((contributor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {contributor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handleJoinCommunity(community.id)}
                  disabled={isProcessing}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Community
                </Button>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <Hash className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No communities found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or create a new community
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CommunitiesHub;