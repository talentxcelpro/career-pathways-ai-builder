import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Filter,
  Search,
  Plus,
  Video,
  Image,
  FileText,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SocialPost {
  id: string;
  type: 'text' | 'image' | 'video' | 'reel' | 'story';
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  media?: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  engagement: {
    rate: number;
    trend: 'up' | 'down' | 'stable';
  };
  createdAt: string;
  isPromoted: boolean;
  tags: string[];
}

interface SocialFeedManagerProps {
  className?: string;
}

export const SocialFeedManager: React.FC<SocialFeedManagerProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const [posts] = useState<SocialPost[]>([
    {
      id: 'post-1',
      type: 'text',
      content: 'Just launched my new course on advanced React patterns! 🚀 Excited to share my knowledge with the community.',
      author: {
        id: 'user-1',
        name: 'Sarah Developer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60e9077?w=150&h=150&fit=crop',
        verified: true
      },
      stats: {
        likes: 142,
        comments: 23,
        shares: 18
      },
      engagement: {
        rate: 8.5,
        trend: 'up'
      },
      createdAt: '2024-01-12T10:30:00Z',
      isPromoted: true,
      tags: ['#ReactJS', '#WebDevelopment', '#OnlineLearning']
    },
    {
      id: 'post-2',
      type: 'video',
      content: 'Quick tutorial on implementing dark mode in your React app ✨',
      author: {
        id: 'user-2',
        name: 'Alex Designer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        verified: false
      },
      media: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop'],
      stats: {
        likes: 89,
        comments: 12,
        shares: 7,
        views: 1245
      },
      engagement: {
        rate: 6.2,
        trend: 'stable'
      },
      createdAt: '2024-01-11T15:45:00Z',
      isPromoted: false,
      tags: ['#UIDesign', '#DarkMode', '#Tutorial']
    },
    {
      id: 'post-3',
      type: 'reel',
      content: '30-second career tip: How to network effectively at tech events 💼',
      author: {
        id: 'user-3',
        name: 'Maya Career Coach',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        verified: true
      },
      stats: {
        likes: 234,
        comments: 45,
        shares: 67,
        views: 3420
      },
      engagement: {
        rate: 12.8,
        trend: 'up'
      },
      createdAt: '2024-01-10T09:20:00Z',
      isPromoted: true,
      tags: ['#CareerTips', '#Networking', '#ProfessionalGrowth']
    }
  ]);

  const [stats] = useState({
    totalPosts: 1247,
    totalEngagement: 45600,
    activeUsers: 8920,
    growthRate: 15.3
  });

  const contentTypes = [
    { id: 'all', label: 'All Content', icon: FileText },
    { id: 'text', label: 'Text Posts', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'reel', label: 'Reels', icon: Video }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || post.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handlePromotePost = useCallback((postId: string) => {
    toast.success('Post promoted successfully!');
  }, []);

  const handleCreateContent = useCallback((type: string) => {
    toast.info(`Create ${type} feature coming soon!`);
  }, []);

  const getEngagementTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Social Feed Manager</h2>
          <p className="text-muted-foreground">Manage and analyze your social content</p>
        </div>
        <Button onClick={() => handleCreateContent('post')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                  <p className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold">+{stats.growthRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Recent High-Performing Posts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
            <div className="space-y-4">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{post.author.name}</p>
                      <Badge variant={post.type === 'reel' ? 'default' : 'secondary'}>
                        {post.type}
                      </Badge>
                      {post.isPromoted && (
                        <Badge variant="outline" className="text-primary">
                          Promoted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.stats.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.stats.comments}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.stats.shares}</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        {getEngagementTrendIcon(post.engagement.trend)}
                        <span>{post.engagement.rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {contentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedFilter === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(type.id)}
                  className="whitespace-nowrap"
                >
                  <type.icon className="w-4 h-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={post.type === 'reel' ? 'default' : 'secondary'}>
                      {post.type}
                    </Badge>
                    {post.isPromoted && (
                      <Badge variant="outline" className="text-primary">
                        Promoted
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm mb-4 line-clamp-3">{post.content}</p>

                {post.media && post.media.length > 0 && (
                  <div className="mb-4">
                    <img 
                      src={post.media[0]} 
                      alt="Post media"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.stats.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.stats.comments}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{post.stats.shares}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEngagementTrendIcon(post.engagement.trend)}
                    <span className="text-sm font-medium">{post.engagement.rate}%</span>
                  </div>
                </div>

                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePromotePost(post.id)}
                  >
                    Promote
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Analytics</h3>
            <p className="text-muted-foreground">
              Detailed analytics dashboard coming soon! Track your content performance, 
              engagement rates, audience insights, and more.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Scheduler</h3>
            <div className="flex items-center space-x-4 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">Schedule your content</p>
                <p className="text-sm text-muted-foreground">
                  Plan and schedule your posts for optimal engagement
                </p>
              </div>
            </div>
            <Button onClick={() => handleCreateContent('scheduled')}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule New Post
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};