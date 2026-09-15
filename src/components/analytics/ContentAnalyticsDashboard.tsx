import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Share2,
  Clock,
  BarChart3,
  Calendar,
  Globe,
  Zap
} from 'lucide-react';

interface ContentMetrics {
  totalViews: number;
  totalShares: number;
  totalComments: number;
  averageReadTime: number;
  topCategories: Array<{
    name: string;
    views: number;
    engagement: number;
  }>;
  weeklyStats: Array<{
    day: string;
    views: number;
    engagement: number;
  }>;
  topPerformingContent: Array<{
    title: string;
    views: number;
    engagementRate: number;
    category: string;
  }>;
}

export const ContentAnalyticsDashboard: React.FC = () => {
  // Mock analytics data - in production, this would come from your analytics service
  const metrics: ContentMetrics = {
    totalViews: 12547,
    totalShares: 892,
    totalComments: 456,
    averageReadTime: 4.2,
    topCategories: [
      { name: 'Technology', views: 4567, engagement: 78 },
      { name: 'Career Development', views: 3456, engagement: 82 },
      { name: 'Business', views: 2890, engagement: 71 },
      { name: 'Leadership', views: 1634, engagement: 85 }
    ],
    weeklyStats: [
      { day: 'Mon', views: 1890, engagement: 76 },
      { day: 'Tue', views: 2156, engagement: 81 },
      { day: 'Wed', views: 1743, engagement: 73 },
      { day: 'Thu', views: 2234, engagement: 79 },
      { day: 'Fri', views: 1923, engagement: 77 },
      { day: 'Sat', views: 1456, engagement: 68 },
      { day: 'Sun', views: 1145, engagement: 72 }
    ],
    topPerformingContent: [
      {
        title: 'The Future of AI in Professional Development',
        views: 2456,
        engagementRate: 89,
        category: 'Technology'
      },
      {
        title: 'Remote Leadership: Building Strong Virtual Teams',
        views: 2234,
        engagementRate: 85,
        category: 'Leadership'
      },
      {
        title: 'Career Pivoting in the Digital Age',
        views: 1987,
        engagementRate: 82,
        category: 'Career'
      }
    ]
  };

  const maxViews = Math.max(...metrics.weeklyStats.map(stat => stat.views));
  const totalEngagement = metrics.totalShares + metrics.totalComments;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Views</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {metrics.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">+12% from last week</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Engagement</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {totalEngagement.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+8% from last week</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Avg. Read Time</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {metrics.averageReadTime}m
                </p>
                <p className="text-xs text-orange-600">+0.3m from last week</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Shares</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {metrics.totalShares.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600">+15% from last week</p>
              </div>
              <Share2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between h-40 gap-2">
              {metrics.weeklyStats.map((stat) => (
                <div key={stat.day} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full">
                    <div 
                      className="bg-primary rounded-t-sm w-full transition-all duration-300 group-hover:bg-primary/80"
                      style={{ 
                        height: `${(stat.views / maxViews) * 120}px`,
                        minHeight: '8px'
                      }}
                    />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.views}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{stat.day}</span>
                  <span className="text-xs text-primary font-medium">{stat.engagement}%</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Engagement Rate (%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topCategories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{category.views.toLocaleString()} views</div>
                    <div className="text-xs text-muted-foreground">{category.engagement}% engagement</div>
                  </div>
                </div>
                <Progress value={category.engagement} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topPerformingContent.map((content, index) => (
              <div key={content.title} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <Badge variant="outline">{content.category}</Badge>
                    </div>
                    <h4 className="font-semibold line-clamp-2">{content.title}</h4>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{content.views.toLocaleString()}</span>
                      <span className="text-muted-foreground">views</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{content.engagementRate}%</span>
                      <span className="text-muted-foreground">engagement</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={content.engagementRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Insights */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Real-time Insights
            <Badge variant="secondary" className="animate-pulse">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">23</div>
              <div className="text-sm text-muted-foreground">Active readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-sm text-muted-foreground">Avg. session time (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">89%</div>
              <div className="text-sm text-muted-foreground">Content completion rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};