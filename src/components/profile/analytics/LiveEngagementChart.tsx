import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LiveEngagementChartProps {
  period: '7d' | '30d' | '90d' | '1y';
  userId?: string;
}

export const LiveEngagementChart = ({ period, userId }: LiveEngagementChartProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['engagement-chart', userId, period],
    queryFn: async () => {
      if (!userId) return [];

      const daysToShow = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (daysToShow * 24 * 60 * 60 * 1000));

      // Get daily data points
      const dailyData = [];
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        const nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));

        // Fetch profile views for this day
        const { data: views } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact' })
          .eq('profile_id', userId)
          .gte('viewed_at', date.toISOString())
          .lt('viewed_at', nextDate.toISOString());

        // Fetch posts engagement for this day
        const { data: posts } = await supabase
          .from('posts')
          .select('likes_count, comments_count, views_count')
          .eq('author_id', userId)
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        const dayLikes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
        const dayComments = posts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
        const dayShares = Math.floor((views?.length || 0) * 0.02); // Estimate shares

        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date.toISOString().split('T')[0],
          views: views?.length || 0,
          likes: dayLikes,
          comments: dayComments,
          shares: dayShares,
          engagement: dayLikes + dayComments + dayShares
        });
      }

      return dailyData;
    },
    enabled: !!userId,
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Engagement Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Loading engagement data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalViews = chartData?.reduce((sum, day) => sum + day.views, 0) || 0;
  const totalLikes = chartData?.reduce((sum, day) => sum + day.likes, 0) || 0;
  const totalComments = chartData?.reduce((sum, day) => sum + day.comments, 0) || 0;
  const totalShares = chartData?.reduce((sum, day) => sum + day.shares, 0) || 0;

  const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Engagement Analytics
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Updates every minute
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">Views</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalViews}</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Likes</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{totalLikes}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Comments</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{totalComments}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Share2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-600">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{engagementRate}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="likes" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Likes"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="comments" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Comments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f9fafb', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="likes" fill="#ef4444" name="Likes" />
                  <Bar dataKey="comments" fill="#10b981" name="Comments" />
                  <Bar dataKey="shares" fill="#8b5cf6" name="Shares" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {chartData?.map((day, index) => {
                const intensity = day.engagement;
                const maxIntensity = Math.max(...(chartData?.map(d => d.engagement) || [1]));
                const opacity = Math.max(0.1, intensity / maxIntensity);
                
                return (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div
                      className="w-full h-12 rounded border border-muted cursor-pointer transition-all hover:scale-105"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {day.date.split(' ')[1]}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {day.date}: {day.engagement} interactions
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Less engagement</span>
              <div className="flex items-center gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded border border-muted"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span>More engagement</span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};