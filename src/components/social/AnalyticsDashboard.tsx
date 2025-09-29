import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, Heart, MessageSquare, Share2, Calendar } from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, isLoading } = useAnalyticsDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{analytics.viewsGrowth}%</span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{analytics.totalFollowers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{analytics.followersGrowth}%</span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analytics.engagementRate}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{analytics.engagementGrowth}%</span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts This Month</p>
                <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm text-muted-foreground">
                {analytics.avgPostsPerWeek} per week average
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <div>
                    <h3 className="font-semibold truncate max-w-md">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments}
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    {post.shares}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.audienceDemographics.map((demo) => (
                <div key={demo.category} className="flex items-center justify-between">
                  <span className="font-medium">{demo.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{demo.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Activity Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.peakHours.map((hour) => (
                <div key={hour.time} className="flex items-center justify-between">
                  <span className="text-sm">{hour.time}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${hour.activity}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{hour.activity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};