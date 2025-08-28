import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Plus, X, ExternalLink } from 'lucide-react';
import { ConnectionSuggestions } from './ConnectionSuggestions';

export const RightSidebar: React.FC = () => {
  // Mock trending data
  const trendingTopics = [
    { hashtag: '#AI', posts: 234, growth: '+12%' },
    { hashtag: '#RemoteWork', posts: 189, growth: '+8%' },
    { hashtag: '#WebDevelopment', posts: 156, growth: '+15%' },
    { hashtag: '#CareerGrowth', posts: 143, growth: '+5%' },
    { hashtag: '#TechJobs', posts: 128, growth: '+20%' },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Tech Career Fair 2024',
      date: 'Dec 15',
      attendees: 245,
      type: 'Virtual',
    },
    {
      id: '2',
      title: 'AI & Machine Learning Summit',
      date: 'Dec 20',
      attendees: 567,
      type: 'Hybrid',
    },
    {
      id: '3',
      title: 'Startup Pitch Night',
      date: 'Dec 22',
      attendees: 89,
      type: 'In-person',
    },
  ];

  const followSuggestions = [
    {
      id: '1',
      name: 'TechCorp',
      type: 'Company',
      followers: '12.5K',
      avatar: '/api/placeholder/40/40',
      description: 'Leading technology solutions',
    },
    {
      id: '2',
      name: 'AI Research Lab',
      type: 'Organization',
      followers: '8.3K',
      avatar: '/api/placeholder/40/40',
      description: 'Advancing AI research',
    },
    {
      id: '3',
      name: 'Career Growth Hub',
      type: 'Community',
      followers: '24.1K',
      avatar: '/api/placeholder/40/40',
      description: 'Professional development tips',
    },
  ];

  const newsItems = [
    {
      id: '1',
      title: 'Tech Industry Sees 25% Growth in Remote Positions',
      source: 'TechNews',
      time: '2h ago',
      readers: '1.2K',
    },
    {
      id: '2',
      title: 'New AI Tools Transform Software Development',
      source: 'DevWeekly',
      time: '4h ago',
      readers: '856',
    },
    {
      id: '3',
      title: 'Startup Funding Reaches All-Time High',
      source: 'StartupDaily',
      time: '6h ago',
      readers: '2.1K',
    },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Connection Suggestions */}
      <ConnectionSuggestions />

      {/* Trending Topics */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-primary cursor-pointer hover:underline">
                    {topic.hashtag}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topic.posts} posts
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs text-green-600 bg-green-50">
                  {topic.growth}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
            See all trends
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border-l-2 border-primary/20 pl-3">
                <h4 className="font-medium text-sm text-foreground cursor-pointer hover:text-primary">
                  {event.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{event.date}</span>
                  <span>{event.attendees} attending</span>
                </div>
                <Badge variant="outline" className="text-xs mt-1">
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Discover events
          </Button>
        </CardContent>
      </Card>

      {/* Follow Suggestions */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Suggested for you</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {followSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestion.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {suggestion.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {suggestion.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {suggestion.followers} followers
                    </span>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        Follow
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News & Insights */}
      <Card className="bg-card/95 backdrop-blur-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Latest News</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {newsItems.map((news) => (
              <div key={news.id} className="group">
                <h4 className="font-medium text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary cursor-pointer">
                  {news.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{news.source}</span>
                  <span>{news.time}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {news.readers} readers
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
            See more news
          </Button>
        </CardContent>
      </Card>

      {/* Advertisement */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4 text-center">
          <h4 className="font-semibold text-sm text-foreground mb-2">
            Boost Your Career
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Get premium tools and insights to accelerate your professional growth
          </p>
          <Button size="sm" className="w-full text-xs">
            Try Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};