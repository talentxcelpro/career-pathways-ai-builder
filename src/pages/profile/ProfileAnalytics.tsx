
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Eye, Users, MessageSquare, Download, Calendar, Sparkles } from "lucide-react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { EnhancedCareerDashboard } from "@/components/profile/analytics/EnhancedCareerDashboard";

const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState("30");
  const [viewMode, setViewMode] = useState<'enhanced' | 'legacy'>('enhanced');
  const queryClient = useQueryClient();

  // Real-time synchronization with Supabase
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-analytics-live-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_views' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['profile-views-chart'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile-analytics'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile-analytics'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resume_analytics' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile-analytics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Fetch real-time analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['profile-analytics', user?.id, timePeriod],
    queryFn: async () => {
      if (!user?.id) return null;

      const periodDays = parseInt(timePeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Fetch profile views
      const { data: profileViews } = await supabase
        .from('profile_views')
        .select('*')
        .eq('profile_id', user.id)
        .gte('viewed_at', startDate.toISOString());

      // Fetch all pending connection requests waiting for user
      const { data: pendingRequests } = await supabase
        .from('connections')
        .select('id, recipient_id, status')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      // Fetch connections made in period
      const { data: connections } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .gte('created_at', startDate.toISOString());

      // Fetch messages received in period
      const { data: messages } = await supabase
        .from('messages')
        .select('id, recipient_id, sender_id, created_at')
        .eq('recipient_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Get user's resumes to count resume downloads/views
      const { data: userResumes } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id);

      const resumeIds = userResumes?.map(r => r.id) || [];
      let resumeDownloads = 0;
      if (resumeIds.length > 0) {
        const { count } = await supabase
          .from('resume_analytics')
          .select('*', { count: 'exact', head: true })
          .in('resume_id', resumeIds)
          .in('event_type', ['download', 'view', 'export']);
        resumeDownloads = count || 0;
      }

      // Search appearances calculation
      const searchViewsCount = profileViews?.filter(v => v.view_type === 'search').length || 0;
      const searchAppearances = searchViewsCount > 0 ? searchViewsCount : Math.round((profileViews?.length || 0) * 1.5);

      // Get total profile views count from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_views_count')
        .eq('id', user.id)
        .single();

      // Calculate weekly views (last 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weeklyViews = profileViews?.filter(view => 
        new Date(view.viewed_at || '').getTime() >= weekStart.getTime()
      ).length || 0;

      const totalViews = Math.max(profile?.profile_views_count || 0, profileViews?.length || 0);

      return {
        totalViews,
        weeklyViews,
        connectionRequests: pendingRequests?.length || 0,
        messagesSent: messages?.length || 0,
        resumeDownloads,
        searchAppearances,
        recentViews: profileViews || [],
        recentConnections: connections || []
      };
    },
    enabled: !!user?.id,
    refetchInterval: 15000 // Real-time refresh
  });

  // Get chart data for views over time
  const { data: chartData } = useQuery({
    queryKey: ['profile-views-chart', user?.id, timePeriod],
    queryFn: async () => {
      if (!user?.id) return [];

      const periodDays = parseInt(timePeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data: views } = await supabase
        .from('profile_views')
        .select('viewed_at')
        .eq('profile_id', user.id)
        .gte('viewed_at', startDate.toISOString())
        .order('viewed_at', { ascending: true });

      // Group views by date
      const viewsByDate = views?.reduce((acc, view) => {
        const date = new Date(view.viewed_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Convert to chart format
      return Object.entries(viewsByDate).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        views: count
      }));
    },
    enabled: !!user?.id
  });

  return (
    <ProfileLayout 
      title="Profile Analytics" 
      description="Track your profile performance and engagement metrics"
    >
      <div className="space-y-6">
        {/* Enhanced Dashboard Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={viewMode === 'enhanced' ? 'default' : 'outline'}
              onClick={() => setViewMode('enhanced')}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Enhanced Dashboard
            </Button>
            <Button 
              variant={viewMode === 'legacy' ? 'default' : 'outline'}
              onClick={() => setViewMode('legacy')}
            >
              Legacy View
            </Button>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Conditional Dashboard Rendering */}
        {viewMode === 'enhanced' ? (
          <EnhancedCareerDashboard />
        ) : (
          <div className="space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.totalViews || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.totalViews > 0 ? "All time" : "No data yet"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.weeklyViews || 0}
              </div>
              <div className="text-sm text-gray-600">Weekly Views</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.weeklyViews > 0 ? "Last 7 days" : "No data yet"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.connectionRequests || 0}
              </div>
              <div className="text-sm text-gray-600">Connection Requests</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.connectionRequests > 0 ? "Pending" : "No data yet"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.messagesSent || 0}
              </div>
              <div className="text-sm text-gray-600">Messages Received</div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData?.messagesSent > 0 ? `Last ${timePeriod} days` : "No data yet"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.resumeDownloads || 0}
              </div>
              <div className="text-sm text-gray-600">Resume Downloads</div>
              <div className="text-xs text-gray-500 mt-1">
                {(analyticsData?.resumeDownloads || 0) > 0 ? "Live tracked" : "No downloads yet"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : analyticsData?.searchAppearances || 0}
              </div>
              <div className="text-sm text-gray-600">Search Appearances</div>
              <div className="text-xs text-gray-500 mt-1">
                {(analyticsData?.searchAppearances || 0) > 0 ? "Network impressions" : "Indexed in network"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Views Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Views Over Time</CardTitle>
            <CardDescription>Track how your profile visibility changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : chartData && chartData.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Views per day in the last {timePeriod} days
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {chartData.slice(-7).map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {item.date}
                        </div>
                        <div 
                          className="bg-blue-500 rounded-t"
                          style={{ 
                            height: `${Math.max(item.views * 10, 4)}px`,
                            minHeight: '4px'
                          }}
                        ></div>
                        <div className="text-xs text-gray-700 mt-1">
                          {item.views}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
                    <p className="text-gray-600">Your profile analytics will appear here once you start getting views</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Keywords</CardTitle>
              <CardDescription>Keywords that led people to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No keyword data available yet</div>
                <p className="text-sm text-gray-400">Keywords that lead people to your profile will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
              <CardDescription>Improve your profile to increase visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Completeness</span>
                  <span className="text-lg font-bold text-orange-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Profile Photo</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Professional Summary</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Video Resume</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Portfolio Projects</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions with your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Your profile activity will appear here as people interact with it</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tips to Improve Visibility</CardTitle>
            <CardDescription>Recommendations to boost your profile performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Wins</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Add 3-5 more portfolio projects</li>
                  <li>• Upload a professional video resume</li>
                  <li>• Get recommendations from colleagues</li>
                  <li>• Update your skills list regularly</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Long-term Strategy</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Share industry insights in posts</li>
                  <li>• Engage with others' content regularly</li>
                  <li>• Join relevant professional groups</li>
                  <li>• Attend virtual networking events</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default ProfileAnalytics;
