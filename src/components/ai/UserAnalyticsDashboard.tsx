import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, Zap, Target, Calendar, Download, Activity } from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';

interface UsageMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  dailyUsage: Array<{ date: string; calls: number; cost: number; tokens: number }>;
  toolUsage: Array<{ tool: string; calls: number; cost: number; successRate: number }>;
  timeDistribution: Array<{ hour: number; calls: number }>;
  costTrend: Array<{ date: string; cost: number; cumulative: number }>;
}

interface PerformanceMetrics {
  efficiency: number;
  costPerCall: number;
  tokensPerCall: number;
  avgResponseTime: number;
  successRate: number;
  productivityScore: number;
  improvementSuggestions: string[];
}

export function UserAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate date range
      const endDate = new Date();
      const startDate = subDays(endDate, 
        timeRange === '1d' ? 1 :
        timeRange === '7d' ? 7 :
        timeRange === '30d' ? 30 :
        timeRange === '90d' ? 90 : 7
      );

      // Fetch usage logs
      const { data: usageLogs, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedMetrics = processUsageData(usageLogs || []);
      const performanceMetrics = calculatePerformanceMetrics(usageLogs || []);

      setMetrics(processedMetrics);
      setPerformance(performanceMetrics);
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

  const processUsageData = (logs: any[]): UsageMetrics => {
    const totalCalls = logs.length;
    const successfulCalls = logs.filter(log => log.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    const totalCost = logs.reduce((sum, log) => sum + (log.cost_estimate || 0), 0);
    const averageResponseTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.response_time || 0), 0) / logs.length 
      : 0;

    // Daily usage
    const dailyStats = logs.reduce((acc, log) => {
      const date = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { calls: 0, cost: 0, tokens: 0 };
      }
      acc[date].calls++;
      acc[date].cost += log.cost_estimate || 0;
      acc[date].tokens += log.tokens_used || 0;
      return acc;
    }, {});

    const dailyUsage = Object.entries(dailyStats)
      .map(([date, stats]: [string, any]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Tool usage
    const toolStats = logs.reduce((acc, log) => {
      const tool = log.tool_slug || log.feature_key || 'unknown';
      if (!acc[tool]) {
        acc[tool] = { calls: 0, cost: 0, successes: 0 };
      }
      acc[tool].calls++;
      acc[tool].cost += log.cost_estimate || 0;
      if (log.success) acc[tool].successes++;
      return acc;
    }, {});

    const toolUsage = Object.entries(toolStats)
      .map(([tool, stats]: [string, any]) => ({
        tool,
        calls: stats.calls,
        cost: stats.cost,
        successRate: (stats.successes / stats.calls) * 100
      }))
      .sort((a, b) => b.calls - a.calls);

    // Time distribution
    const hourStats = logs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      calls: hourStats[hour] || 0
    }));

    // Cost trend
    let cumulativeCost = 0;
    const costTrend = dailyUsage.map(day => {
      cumulativeCost += day.cost;
      return {
        date: day.date,
        cost: day.cost,
        cumulative: cumulativeCost
      };
    });

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalTokens,
      totalCost,
      averageResponseTime,
      dailyUsage,
      toolUsage,
      timeDistribution,
      costTrend
    };
  };

  const calculatePerformanceMetrics = (logs: any[]): PerformanceMetrics => {
    if (logs.length === 0) {
      return {
        efficiency: 0,
        costPerCall: 0,
        tokensPerCall: 0,
        avgResponseTime: 0,
        successRate: 0,
        productivityScore: 0,
        improvementSuggestions: ['Start using AI tools to see performance metrics']
      };
    }

    const totalCalls = logs.length;
    const successfulCalls = logs.filter(log => log.success).length;
    const successRate = (successfulCalls / totalCalls) * 100;
    const costPerCall = logs.reduce((sum, log) => sum + (log.cost_estimate || 0), 0) / totalCalls;
    const tokensPerCall = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0) / totalCalls;
    const avgResponseTime = logs.reduce((sum, log) => sum + (log.response_time || 0), 0) / totalCalls;

    // Calculate efficiency (successful calls / total time)
    const totalTime = logs.reduce((sum, log) => sum + (log.response_time || 0), 0);
    const efficiency = successfulCalls / (totalTime / 1000); // successful calls per second

    // Calculate productivity score (0-100)
    const productivityScore = Math.min(100, 
      (successRate * 0.4) + 
      (Math.min(100, 1000 / avgResponseTime) * 0.3) + 
      (Math.min(100, (totalCalls / 7) * 10) * 0.3) // daily usage factor
    );

    // Generate improvement suggestions
    const suggestions = [];
    if (successRate < 80) suggestions.push('Review failed operations to identify common issues');
    if (avgResponseTime > 5000) suggestions.push('Consider using faster AI models for better response times');
    if (costPerCall > 0.05) suggestions.push('Optimize prompt length to reduce token usage and costs');
    if (logs.length < 7) suggestions.push('Increase AI tool usage to improve productivity');

    return {
      efficiency,
      costPerCall,
      tokensPerCall,
      avgResponseTime,
      successRate,
      productivityScore,
      improvementSuggestions: suggestions.length > 0 ? suggestions : ['Great performance! Keep up the good work.']
    };
  };

  const exportData = () => {
    if (!metrics) return;

    const csvData = [
      ['Date', 'Calls', 'Cost', 'Tokens'],
      ...metrics.dailyUsage.map(item => [
        item.date,
        item.calls.toString(),
        item.cost.toFixed(4),
        item.tokens.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    success: 'hsl(142 76% 36%)',
    warning: 'hsl(38 92% 50%)',
    destructive: 'hsl(var(--destructive))'
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Usage Analytics</h2>
          <p className="text-muted-foreground">Track your AI tool performance and costs</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.successfulCalls} successful, {metrics.failedCalls} failed
              </p>
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
              <div className="text-2xl font-bold">${metrics.totalCost.toFixed(3)}</div>
              <p className="text-xs text-muted-foreground">
                ${performance.costPerCall.toFixed(4)} per call
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.averageResponseTime)}ms</div>
              <p className="text-xs text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Operation success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="tools">Tool Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {metrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Daily Usage Trend</CardTitle>
                  <CardDescription>Your AI tool usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="calls"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tool Usage Distribution</CardTitle>
                    <CardDescription>Most used AI tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics.toolUsage.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tool" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="calls" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Hour</CardTitle>
                    <CardDescription>When you use AI tools most</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={metrics.timeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke={COLORS.secondary}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Distribution</CardTitle>
                  <CardDescription>AI tool usage throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.timeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calls" fill={COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Pattern</CardTitle>
                  <CardDescription>Calls and tokens over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="calls"
                        stroke={COLORS.primary}
                        name="Calls"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="tokens"
                        stroke={COLORS.secondary}
                        name="Tokens"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Tool Performance Analysis</CardTitle>
                <CardDescription>Success rates and usage by tool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.toolUsage.map((tool, index) => (
                    <div key={tool.tool} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium capitalize">{tool.tool.replace('-', ' ')}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tool.calls} calls</Badge>
                          <Badge 
                            className={tool.successRate >= 90 ? 'bg-green-100 text-green-800' : 
                                     tool.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}
                          >
                            {tool.successRate.toFixed(1)}% success
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total cost: ${tool.cost.toFixed(4)} • 
                        Cost per call: ${(tool.cost / tool.calls).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trend</CardTitle>
                  <CardDescription>Daily and cumulative costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.costTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="cost"
                        stroke={COLORS.primary}
                        name="Daily Cost"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cumulative"
                        stroke={COLORS.secondary}
                        name="Cumulative"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost by Tool</CardTitle>
                  <CardDescription>Where your AI budget goes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.toolUsage.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ tool, percent }) => `${tool} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cost"
                      >
                        {metrics.toolUsage.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {performance && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Score
                  </CardTitle>
                  <CardDescription>Overall AI tool usage efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{Math.round(performance.productivityScore)}/100</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${performance.productivityScore}%` }}
                      ></div>
                    </div>
                    <p className="text-muted-foreground">
                      {performance.productivityScore >= 80 ? 'Excellent performance!' :
                       performance.productivityScore >= 60 ? 'Good performance' :
                       performance.productivityScore >= 40 ? 'Room for improvement' :
                       'Needs attention'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Detailed performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Efficiency</h3>
                      <div className="text-2xl font-bold">{performance.efficiency.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Successful calls per second</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Token Efficiency</h3>
                      <div className="text-2xl font-bold">{Math.round(performance.tokensPerCall)}</div>
                      <p className="text-sm text-muted-foreground">Average tokens per call</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Suggestions</CardTitle>
                  <CardDescription>Ways to optimize your AI tool usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performance.improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}