import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Flame,
  Eye,
  MessageSquare,
  Share2,
  Heart,
  Bookmark,
  Clock,
  Users,
  Briefcase,
  BookOpen,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';

interface TrendingItem {
  id: string;
  type: 'post' | 'job' | 'course' | 'person';
  title: string;
  description: string;
  author?: string;
  authorAvatar?: string;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  timeAgo: string;
  badge?: string;
  trending: boolean;
}

};
  const navigate = useNavigate();

  const trendingItems: TrendingItem[] = [
    {
      id: '1',
      type: 'post',
      title: 'How I landed a job at Google in 30 days',
      description: 'Complete roadmap and strategies that actually work...',
      author: 'Alex Chen',
      authorAvatar: '',
      engagement: { views: 25400, likes: 1200, comments: 89, shares: 156 },
      timeAgo: '2h ago',
      badge: 'Hot',
      trending: true
    },
    {
      id: '2',
      type: 'job',
      title: 'Senior React Developer',
      description: 'Remote position at fast-growing startup with great benefits...',
      author: 'TechCorp',
      engagement: { views: 5600, likes: 234, comments: 12, shares: 45 },
      timeAgo: '4h ago',
      badge: 'New',
      trending: true
    },
    {
      id: '3',
      type: 'course',
      title: 'Complete DevOps Bootcamp 2024',
      description: 'Master Docker, Kubernetes, AWS, and CI/CD pipelines...',
      author: 'DevOps Academy',
      engagement: { views: 12300, likes: 890, comments: 45, shares: 123 },
      timeAgo: '6h ago',
      badge: 'Popular',
      trending: true
    },
    {
      id: '4',
      type: 'person',
      title: 'Sarah Johnson - Tech Lead at Microsoft',
      description: 'Just shared insights about scaling microservices...',
      author: 'Sarah Johnson',
      engagement: { views: 3400, likes: 567, comments: 23, shares: 67 },
      timeAgo: '8h ago',
      trending: true
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="w-4 h-4" />;
      case 'job': return <Briefcase className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'person': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-600';
      case 'job': return 'bg-green-100 text-green-600';
      case 'course': return 'bg-purple-100 text-purple-600';
      case 'person': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MobileNavWrapper>
      <ScrollArea className="h-[calc(100vh-80px)] ios-scroll">
        <div className="px-4 py-6 space-y-6 pb-20 native-app-style safe-area-top">
          {/* Header */}
          <div className="native-card p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Trending Now</h1>
            <p className="text-sm text-gray-600">
              Most popular content in your network
            </p>
          </div>

          {/* Trending Categories */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 native-card">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
              <TabsTrigger value="courses" className="text-xs">Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {trendingItems.map((item) => (
                <Card key={item.id} className="native-card touch-feedback">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(item.type)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.trending && (
                            <Flame className="w-4 h-4 text-orange-500" />
                          )}
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {item.author && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={item.authorAvatar} />
                              <AvatarFallback className="text-xs">
                                {item.author.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{item.author}</span>
                            <Clock className="w-3 h-3 text-gray-400 ml-auto" />
                            <span className="text-xs text-gray-500">{item.timeAgo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(item.engagement.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{formatNumber(item.engagement.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{item.engagement.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          <span>{item.engagement.shares}</span>
                        </div>
                      </div>
                      <Bookmark className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 touch-feedback">
                        <Heart className="w-3 h-3 mr-1" />
                        Like
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 touch-feedback">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Comment
                      </Button>
                      <Button size="sm" variant="outline" className="touch-feedback">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Other tab contents would be filtered versions */}
            <TabsContent value="posts" className="space-y-4 mt-4">
              {trendingItems.filter(item => item.type === 'post').map((item) => (
                <Card key={item.id} className="native-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Post content here...</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </MobileNavWrapper>
  );
};
