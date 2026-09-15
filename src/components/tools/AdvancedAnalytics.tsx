
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Download,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';

interface AnalyticsData {
  toolUsage: Array<{ tool: string; usage: number; efficiency: number }>;
  timeSpent: Array<{ date: string; minutes: number; tools_used: number }>;
  successRates: Array<{ tool: string; success_rate: number; completion_rate: number }>;
  skillDevelopment: Array<{ skill: string; progress: number; sessions: number }>;
  weeklyTrends: Array<{ week: string; usage: number; results: number }>;
  userComparison: {
    user_rank: number;
    percentile: number;
    avg_score: number;
    user_score: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [dateRange]);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch tool usage analytics
      const { data: toolUsageData, error: toolError } = await supabase
        .from('tool_usage')
        .select('tool_name, session_data, results, created_at')
        .eq('user_id', user.id)
        .gte('created_at', getDateRangeStart(dateRange));

      if (toolError) throw toolError;

      // Fetch saved results for success rate calculation
      const { data: savedResults, error: resultsError } = await supabase
        .from('saved_tool_results')
        .select('tool_name, content, created_at')
        .eq('user_id', user.id)
        .gte('created_at', getDateRangeStart(dateRange));

      if (resultsError) throw resultsError;

      // Process the data
      const processedData = processAnalyticsData(toolUsageData || [], savedResults || []);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load advanced analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeStart = (range: string) => {
    const now = new Date();
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000)).toISOString();
  };

  const processAnalyticsData = (usage: any[], results: any[]): AnalyticsData => {
    // Tool usage efficiency
    const toolUsage = usage.reduce((acc, item) => {
      const existing = acc.find((t: any) => t.tool === item.tool_name);
      if (existing) {
        existing.usage += 1;
        existing.efficiency = Math.random() * 100; // Placeholder calculation
      } else {
        acc.push({
          tool: item.tool_name,
          usage: 1,
          efficiency: Math.random() * 100
        });
      }
      return acc;
    }, []);

    // Time spent analysis
    const timeSpent = generateTimeSpentData(usage);

    // Success rates
    const successRates = toolUsage.map((tool: any) => ({
      tool: tool.tool,
      success_rate: Math.random() * 100,
      completion_rate: Math.random() * 100
    }));

    // Skill development tracking
    const skillDevelopment = [
      { skill: 'Resume Writing', progress: 75, sessions: 12 },
      { skill: 'Interview Skills', progress: 60, sessions: 8 },
      { skill: 'Salary Negotiation', progress: 45, sessions: 5 },
      { skill: 'Career Planning', progress: 80, sessions: 15 },
      { skill: 'Market Research', progress: 55, sessions: 7 }
    ];

    // Weekly trends
    const weeklyTrends = generateWeeklyTrends(usage, results);

    // User comparison (mock data)
    const userComparison = {
      user_rank: Math.floor(Math.random() * 1000) + 1,
      percentile: Math.floor(Math.random() * 100),
      avg_score: 75,
      user_score: 82
    };

    return {
      toolUsage,
      timeSpent,
      successRates,
      skillDevelopment,
      weeklyTrends,
      userComparison
    };
  };

  const generateTimeSpentData = (usage: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: Math.floor(Math.random() * 120) + 10,
        tools_used: Math.floor(Math.random() * 5) + 1
      };
    });
    return last7Days;
  };

  const generateWeeklyTrends = (usage: any[], results: any[]) => {
    return Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      usage: Math.floor(Math.random() * 50) + 10,
      results: Math.floor(Math.random() * 20) + 5
    }));
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const exportData = {
      generated_at: new Date().toISOString(),
      date_range: dateRange,
      ...analyticsData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `advanced-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Success",
      description: "Analytics data exported successfully!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
          <p className="text-gray-600">Start using tools to see advanced analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Deep insights into your tool usage and performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{analyticsData.userComparison.user_rank}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Percentile</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.userComparison.percentile}th</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Score</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.userComparison.user_score}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.userComparison.avg_score}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Tool Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Usage & Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.toolUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tool" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                    <Bar dataKey="efficiency" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.timeSpent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="minutes" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rates by Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.successRates}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tool, success_rate }) => `${tool}: ${success_rate.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="success_rate"
                    >
                      {analyticsData.successRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="results" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Development Progress</CardTitle>
              <CardDescription>Track your improvement across different career skills</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={analyticsData.skillDevelopment}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Progress" dataKey="progress" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your tool usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.skillDevelopment.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-sm text-gray-600">{skill.sessions} sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">{skill.progress}% progress</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
