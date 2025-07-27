
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Eye, Users, MessageSquare, Download, Calendar } from "lucide-react";
import ProfileLayout from "@/components/profile/ProfileLayout";
import { MetricsCards } from "@/components/profile/analytics/MetricsCards";
import { ProfileViewsChart } from "@/components/profile/analytics/ProfileViewsChart";
import { KeywordsInsight } from "@/components/profile/analytics/KeywordsInsight";
import { ProfileCompleteness } from "@/components/profile/analytics/ProfileCompleteness";
import { useProfileStats } from "@/hooks/useProfileStats";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ProfileAnalytics = () => {
  const { user } = useAuth();
  const { data: profileStats } = useProfileStats(user?.id);

  // Fetch additional analytics data
  const { data: connectionRequests } = useQuery({
    queryKey: ['connection-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('status', 'pending');
      return count || 0;
    },
    enabled: !!user?.id
  });

  // Fetch resume downloads (mock data for now)
  const { data: resumeDownloads } = useQuery({
    queryKey: ['resume-downloads', user?.id],
    queryFn: async () => {
      // Mock data - in real implementation this would come from resume analytics
      return Math.floor(Math.random() * 50) + 10;
    },
    enabled: !!user?.id
  });

  // Fetch weekly views (calculate from profile_views)
  const { data: weeklyViews } = useQuery({
    queryKey: ['weekly-views', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .gte('viewed_at', weekAgo.toISOString());
      return count || 0;
    },
    enabled: !!user?.id
  });

  const analyticsData = {
    totalViews: profileStats?.profileViews || 0,
    weeklyViews: weeklyViews || 0,
    connectionRequests: connectionRequests || 0,
    messagesSent: 0, // Would need to implement messages tracking
    resumeDownloads: resumeDownloads || 0,
    searchAppearances: Math.floor((profileStats?.profileViews || 0) * 0.3) // Estimated based on views
  };

  // Generate chart data based on recent views
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
    views: Math.floor(Math.random() * (profileStats?.profileViews || 10)) + 5,
    connections: Math.floor(Math.random() * 10) + 2
  }));

  return (
    <ProfileLayout 
      title="Profile Analytics" 
      description="Track your profile performance and engagement metrics"
    >
      <div className="space-y-6">
        {/* Time Period Filter */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select defaultValue="30">
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
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <MetricsCards analyticsData={analyticsData} />

        {/* Profile Views Chart */}
        <ProfileViewsChart chartData={chartData} />

        {/* Engagement Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KeywordsInsight />
          <ProfileCompleteness />
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
    </ProfileLayout>
  );
};

export default ProfileAnalytics;
