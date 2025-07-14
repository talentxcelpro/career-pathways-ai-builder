import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Date picker imports - using standard date inputs for now
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, Zap, Download } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface UsageStats {
  total_requests: number;
  total_cost: number;
  avg_response_time: number;
  unique_users: number;
  success_rate: number;
  popular_tools: Array<{ tool_slug: string; count: number; cost: number }>;
  daily_usage: Array<{ date: string; requests: number; cost: number }>;
  user_activity: Array<{ user_id: string; requests: number; cost: number }>;
}

interface FeedbackStats {
  total_feedback: number;
  avg_rating: number;
  rating_distribution: Array<{ rating: number; count: number }>;
  feedback_by_tool: Array<{ tool_slug: string; avg_rating: number; feedback_count: number }>;
}

export function AIUsageAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedTool]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch usage statistics
      const usageQuery = supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (selectedTool !== 'all') {
        usageQuery.eq('tool_slug', selectedTool);
      }

      const { data: usageData, error: usageError } = await usageQuery;
      if (usageError) throw usageError;

      // Fetch feedback statistics
      const feedbackQuery = supabase
        .from('ai_feedback_system')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (selectedTool !== 'all') {
        feedbackQuery.eq('tool_slug', selectedTool);
      }

      const { data: feedbackData, error: feedbackError } = await feedbackQuery;
      if (feedbackError) throw feedbackError;

      // Process usage data
      const processedUsageStats = processUsageData(usageData || []);
      const processedFeedbackStats = processFeedbackData(feedbackData || []);

      setUsageStats(processedUsageStats);
      setFeedbackStats(processedFeedbackStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processUsageData = (data: any[]): UsageStats => {
    const totalRequests = data.length;
    const totalCost = data.reduce((sum, item) => sum + (item.cost_estimate || 0), 0);
    const avgResponseTime = data.reduce((sum, item) => sum + (item.response_time || 0), 0) / totalRequests || 0;
    const uniqueUsers = new Set(data.map(item => item.user_id)).size;
    const successfulRequests = data.filter(item => item.success).length;
    const successRate = (successfulRequests / totalRequests) * 100 || 0;

    // Popular tools
    const toolStats = data.reduce((acc, item) => {
      const tool = item.tool_slug || 'unknown';
      if (!acc[tool]) {
        acc[tool] = { count: 0, cost: 0 };
      }
      acc[tool].count++;
      acc[tool].cost += item.cost_estimate || 0;
      return acc;
    }, {});

    const popularTools = Object.entries(toolStats)
      .map(([tool_slug, stats]: [string, any]) => ({
        tool_slug,
        count: stats.count,
        cost: stats.cost,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily usage
    const dailyStats = data.reduce((acc, item) => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { requests: 0, cost: 0 };
      }
      acc[date].requests++;
      acc[date].cost += item.cost_estimate || 0;
      return acc;
    }, {});

    const dailyUsage = Object.entries(dailyStats)
      .map(([date, stats]: [string, any]) => ({
        date,
        requests: stats.requests,
        cost: stats.cost,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // User activity
    const userStats = data.reduce((acc, item) => {
      const userId = item.user_id;
      if (!acc[userId]) {
        acc[userId] = { requests: 0, cost: 0 };
      }
      acc[userId].requests++;
      acc[userId].cost += item.cost_estimate || 0;
      return acc;
    }, {});

    const userActivity = Object.entries(userStats)
      .map(([user_id, stats]: [string, any]) => ({
        user_id,
        requests: stats.requests,
        cost: stats.cost,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 20);

    return {
      total_requests: totalRequests,
      total_cost: totalCost,
      avg_response_time: avgResponseTime,
      unique_users: uniqueUsers,
      success_rate: successRate,
      popular_tools: popularTools,
      daily_usage: dailyUsage,
      user_activity: userActivity,
    };
  };

  const processFeedbackData = (data: any[]): FeedbackStats => {
    const totalFeedback = data.length;
    const avgRating = data.reduce((sum, item) => sum + (item.rating || 0), 0) / totalFeedback || 0;

    // Rating distribution
    const ratingDist = data.reduce((acc, item) => {
      const rating = item.rating || 0;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: ratingDist[i + 1] || 0,
    }));

    // Feedback by tool
    const toolFeedback = data.reduce((acc, item) => {
      const tool = item.tool_slug;
      if (!acc[tool]) {
        acc[tool] = { ratings: [], count: 0 };
      }
      if (item.rating) {
        acc[tool].ratings.push(item.rating);
      }
      acc[tool].count++;
      return acc;
    }, {});

    const feedbackByTool = Object.entries(toolFeedback)
      .map(([tool_slug, stats]: [string, any]) => ({
        tool_slug,
        avg_rating: stats.ratings.length > 0 
          ? stats.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stats.ratings.length 
          : 0,
        feedback_count: stats.count,
      }))
      .sort((a, b) => b.feedback_count - a.feedback_count);

    return {
      total_feedback: totalFeedback,
      avg_rating: avgRating,
      rating_distribution: ratingDistribution,
      feedback_by_tool: feedbackByTool,
    };
  };

  const exportData = () => {
    const csvData = usageStats?.daily_usage.map(item => ({
      Date: item.date,
      Requests: item.requests,
      Cost: item.cost.toFixed(4),
    })) || [];

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-usage-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Usage Analytics</h2>
          <p className="text-muted-foreground">Monitor AI tool performance and user engagement</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              <SelectItem value="resume-tailor">Resume Tailor</SelectItem>
              <SelectItem value="cover-letter">Cover Letter</SelectItem>
              <SelectItem value="career-pathfinder">Career Pathfinder</SelectItem>
              <SelectItem value="job-match">Job Match GPT</SelectItem>
              <SelectItem value="interview-qa">Interview Q&A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <input
              type="date"
              value={format(dateRange.from, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({...dateRange, from: new Date(e.target.value)})}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="date"
              value={format(dateRange.to, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({...dateRange, to: new Date(e.target.value)})}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.total_requests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${usageStats?.total_cost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.avg_response_time.toFixed(0)}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.unique_users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.success_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="tools">Tool Performance</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
              <CardDescription>Request volume and costs over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={usageStats?.daily_usage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Requests"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Tools</CardTitle>
                <CardDescription>By request volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageStats?.popular_tools.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tool_slug" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>By tool usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageStats?.popular_tools.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tool_slug, percent }) => `${tool_slug} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {usageStats?.popular_tools.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Overall user satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{feedbackStats?.avg_rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={feedbackStats?.rating_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool Ratings</CardTitle>
                <CardDescription>Feedback by AI tool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedbackStats?.feedback_by_tool.slice(0, 8).map((tool) => (
                    <div key={tool.tool_slug} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tool.tool_slug}</span>
                        <Badge variant="secondary">{tool.feedback_count} reviews</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{tool.avg_rating.toFixed(1)}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < tool.avg_rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Activity</CardTitle>
              <CardDescription>Most active AI tool users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageStats?.user_activity.slice(0, 10).map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.user_id.slice(0, 8)}...</div>
                        <div className="text-sm text-muted-foreground">
                          {user.requests} requests
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${user.cost.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">total cost</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}