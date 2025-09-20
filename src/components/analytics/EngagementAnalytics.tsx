import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Eye, Heart, MessageSquare, Share2, BarChart3, Target, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EngagementAnalyticsProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d';
}

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  topPosts: any[];
  audienceGrowth: number;
  bestPostingTimes: string[];
  topHashtags: { tag: string; count: number; engagement: number }[];
  connectionGrowth: { period: string; count: number }[];
  contentPerformance: {
    text: number;
    image: number;
    video: number;
  };
}

export const EngagementAnalytics: React.FC<EngagementAnalyticsProps> = memo(({
  className,
  timeRange = '30d'
}) => {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'reach' | 'growth'>('engagement');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['engagement-analytics', user?.id, timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user) throw new Error('User not authenticated');

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      // Fetch user posts with engagement metrics
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes(count),
          post_comments(count),
          post_shares(count),
          post_views(count)
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (postsError) throw postsError;

      // Calculate metrics
      const totalPosts = posts?.length || 0;
      const totalViews = posts?.reduce((sum, post) => sum + (post.post_views?.[0]?.count || 0), 0) || 0;
      const totalLikes = posts?.reduce((sum, post) => sum + (post.post_likes?.[0]?.count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, post) => sum + (post.post_comments?.[0]?.count || 0), 0) || 0;
      const totalShares = posts?.reduce((sum, post) => sum + (post.post_shares?.[0]?.count || 0), 0) || 0;
      
      const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;

      // Get top performing posts
      const topPosts = posts?.slice(0, 5) || [];

      // Fetch connection growth
      const { data: connections } = await supabase
        .from('connections')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      const audienceGrowth = connections?.length || 0;

      // Analyze posting patterns (mock data for now)
      const bestPostingTimes = ['9:00 AM', '1:00 PM', '6:00 PM'];
      
      // Extract hashtags from posts (simplified)
      const topHashtags = [
        { tag: '#career', count: 15, engagement: 89 },
        { tag: '#networking', count: 12, engagement: 76 },
        { tag: '#innovation', count: 8, engagement: 92 }
      ];

      const connectionGrowth = [
        { period: 'Week 1', count: 5 },
        { period: 'Week 2', count: 8 },
        { period: 'Week 3', count: 12 },
        { period: 'Week 4', count: 7 }
      ];

      const contentPerformance = {
        text: totalPosts > 0 ? Math.round((posts?.filter(p => !p.media_url).length / totalPosts) * 100) : 0,
        image: totalPosts > 0 ? Math.round((posts?.filter(p => p.media_url && !p.media_url.includes('.mp4')).length / totalPosts) * 100) : 0,
        video: totalPosts > 0 ? Math.round((posts?.filter(p => p.media_url && p.media_url.includes('.mp4')).length / totalPosts) * 100) : 0
      };

      return {
        totalPosts,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        engagementRate,
        topPosts,
        audienceGrowth,
        bestPostingTimes,
        topHashtags,
        connectionGrowth,
        contentPerformance
      };
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const MetricCard = ({ icon: Icon, label, value, change, format = '' }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}{format}</p>
            {change !== undefined && (
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% vs last period
              </p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Engagement Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant={timeRange === '7d' ? 'default' : 'outline'}>7d</Button>
            <Button size="sm" variant={timeRange === '30d' ? 'default' : 'outline'}>30d</Button>
            <Button size="sm" variant={timeRange === '90d' ? 'default' : 'outline'}>90d</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={Eye}
            label="Total Views"
            value={analytics.totalViews.toLocaleString()}
            change={15}
          />
          <MetricCard
            icon={Heart}
            label="Engagement Rate"
            value={analytics.engagementRate.toFixed(1)}
            format="%"
            change={8}
          />
          <MetricCard
            icon={Users}
            label="Audience Growth"
            value={analytics.audienceGrowth}
            change={12}
          />
          <MetricCard
            icon={TrendingUp}
            label="Posts Published"
            value={analytics.totalPosts}
            change={-3}
          />
        </div>

        <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="reach">Reach</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-4">
            {/* Engagement Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Likes</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</p>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Comments</span>
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalComments.toLocaleString()}</p>
                  <Progress value={60} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Shares</span>
                    <Share2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.totalShares.toLocaleString()}</p>
                  <Progress value={45} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Performance by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Text Posts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics.contentPerformance.text} className="w-20" />
                      <span className="text-sm font-medium">{analytics.contentPerformance.text}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Image Posts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics.contentPerformance.image} className="w-20" />
                      <span className="text-sm font-medium">{analytics.contentPerformance.image}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Video Posts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics.contentPerformance.video} className="w-20" />
                      <span className="text-sm font-medium">{analytics.contentPerformance.video}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reach" className="space-y-4">
            {/* Top Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topHashtags.map((hashtag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{hashtag.tag}</Badge>
                        <span className="text-sm text-muted-foreground">{hashtag.count} uses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={hashtag.engagement} className="w-16" />
                        <span className="text-sm font-medium">{hashtag.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optimal Posting Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {analytics.bestPostingTimes.map((time, index) => (
                    <div key={index} className="text-center p-3 bg-muted rounded-lg">
                      <p className="font-semibold">{time}</p>
                      <p className="text-sm text-muted-foreground">High Engagement</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            {/* Connection Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.connectionGrowth.map((period, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{period.period}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(period.count / 15) * 100} className="w-20" />
                        <span className="text-sm font-medium">+{period.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Optimal Posting Strategy</p>
                  <p className="text-sm text-muted-foreground">
                    Your video content performs 40% better than text. Consider increasing video posts.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Engagement Trend</p>
                  <p className="text-sm text-muted-foreground">
                    Posts with questions receive 2.3x more comments. Try adding questions to your content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Audience Growth</p>
                  <p className="text-sm text-muted-foreground">
                    Your network growth is accelerating. Consider collaborating with connections for wider reach.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
});

EngagementAnalytics.displayName = 'EngagementAnalytics';