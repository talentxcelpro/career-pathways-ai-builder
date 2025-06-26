
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Target, 
  Activity,
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface ToolUsageData {
  tool_name: string;
  usage_count: number;
  last_used: string;
}

interface UsageStats {
  totalSessions: number;
  totalResults: number;
  favoriteCount: number;
  mostUsedTool: string;
  averageSessionTime: number;
  weeklyUsage: Array<{ day: string; count: number }>;
  toolDistribution: Array<{ name: string; value: number; color: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const ToolsAnalyticsDashboard = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch tool usage data
      const { data: usageData, error: usageError } = await supabase
        .from('tool_usage')
        .select('tool_name, created_at, session_data');

      if (usageError) throw usageError;

      // Fetch saved results
      const { data: resultsData, error: resultsError } = await supabase
        .from('saved_tool_results')
        .select('tool_name, is_favorite, created_at');

      if (resultsError) throw resultsError;

      // Process the data
      const processedStats = processAnalyticsData(usageData || [], resultsData || []);
      setStats(processedStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (usageData: any[], resultsData: any[]): UsageStats => {
    // Tool usage distribution
    const toolCounts = usageData.reduce((acc, item) => {
      acc[item.tool_name] = (acc[item.tool_name] || 0) + 1;
      return acc;
    }, {});

    const toolDistribution = Object.entries(toolCounts).map(([name, value], index) => ({
      name: getToolDisplayName(name as string),
      value: value as number,
      color: COLORS[index % COLORS.length]
    }));

    // Most used tool
    const mostUsedTool = Object.entries(toolCounts).reduce((a, b) => 
      toolCounts[a[0]] > toolCounts[b[0]] ? a : b
    )[0];

    // Weekly usage (last 7 days)
    const weeklyUsage = generateWeeklyUsage(usageData);

    // Favorite count
    const favoriteCount = resultsData.filter(r => r.is_favorite).length;

    return {
      totalSessions: usageData.length,
      totalResults: resultsData.length,
      favoriteCount,
      mostUsedTool: getToolDisplayName(mostUsedTool),
      averageSessionTime: 12, // Placeholder - would calculate from session data
      weeklyUsage,
      toolDistribution
    };
  };

  const generateWeeklyUsage = (usageData: any[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: days[date.getDay()],
        count: usageData.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate.toDateString() === date.toDateString();
        }).length
      };
    });
    return last7Days;
  };

  const getToolDisplayName = (toolName: string) => {
    const nameMap: { [key: string]: string } = {
      'resume-check': 'Resume Checker',
      'cover-letter': 'Cover Letter',
      'salary-analyzer': 'Salary Analyzer',
      'interview-prep': 'Interview Prep',
      'ai-assistant': 'AI Assistant',
      'profile-score': 'Profile Score',
      'market-insights': 'Market Insights'
    };
    return nameMap[toolName] || toolName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start using tools to see your analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Results</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResults}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favoriteCount}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Most Used Tool</p>
                <p className="text-lg font-semibold text-gray-900">{stats.mostUsedTool}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="tools">Tool Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Usage</CardTitle>
              <CardDescription>Your tool usage over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.weeklyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tool Distribution</CardTitle>
              <CardDescription>Usage breakdown by tool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.toolDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.toolDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.toolDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Session Time</span>
                  <span className="text-sm text-gray-600">{stats.averageSessionTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-gray-600">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Try Interview Prep</p>
                    <p className="text-xs text-gray-600">Based on your profile activity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Update your salary analysis</p>
                    <p className="text-xs text-gray-600">Market data has been updated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolsAnalyticsDashboard;
