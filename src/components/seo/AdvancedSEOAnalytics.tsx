
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Search, 
  Target, 
  BarChart3,
  Activity,
  Clock,
  Users,
  MousePointer,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedSEOAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - in real implementation, fetch from analytics API
  const performanceData = [
    { date: '2024-01-01', impressions: 12500, clicks: 850, ctr: 6.8, position: 4.2 },
    { date: '2024-01-02', impressions: 13200, clicks: 920, ctr: 7.0, position: 4.1 },
    { date: '2024-01-03', impressions: 14100, clicks: 1050, ctr: 7.4, position: 3.9 },
    { date: '2024-01-04', impressions: 13800, clicks: 995, ctr: 7.2, position: 4.0 },
    { date: '2024-01-05', impressions: 15200, clicks: 1180, ctr: 7.8, position: 3.8 },
    { date: '2024-01-06', impressions: 14900, clicks: 1245, ctr: 8.4, position: 3.7 },
    { date: '2024-01-07', impressions: 16100, clicks: 1350, ctr: 8.4, position: 3.6 },
  ];

  const keywordData = [
    { keyword: 'software engineer jobs', position: 3.2, impressions: 8500, clicks: 680, trend: 'up' },
    { keyword: 'data scientist jobs bangalore', position: 2.8, impressions: 5200, clicks: 520, trend: 'up' },
    { keyword: 'remote jobs india', position: 4.1, impressions: 12000, clicks: 840, trend: 'down' },
    { keyword: 'python developer jobs', position: 3.6, impressions: 6800, clicks: 450, trend: 'up' },
    { keyword: 'full stack developer', position: 5.2, impressions: 4200, clicks: 280, trend: 'stable' },
  ];

  const trafficSources = [
    { name: 'Organic Search', value: 68, count: 45200 },
    { name: 'Direct', value: 18, count: 12000 },
    { name: 'Social Media', value: 8, count: 5300 },
    { name: 'Referral', value: 4, count: 2700 },
    { name: 'Email', value: 2, count: 1300 },
  ];

  const competitorData = [
    { name: 'Naukri.com', visibility: 85, keywords: 45000, traffic: 2500000 },
    { name: 'LinkedIn Jobs', visibility: 78, keywords: 38000, traffic: 1800000 },
    { name: 'Indeed India', visibility: 72, keywords: 35000, traffic: 1600000 },
    { name: 'Monster.com', visibility: 45, keywords: 22000, traffic: 850000 },
    { name: 'TalentXcel', visibility: 38, keywords: 18500, traffic: 650000 },
  ];

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced SEO Analytics</h2>
          <p className="text-gray-600">Comprehensive performance insights and competitive analysis</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold">98.5K</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% vs last period
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">7.2K</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.3% vs last period
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average CTR</p>
                <p className="text-2xl font-bold">7.3%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.8% vs last period
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Position</p>
                <p className="text-2xl font-bold">3.8</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  -0.4 vs last period
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Performance Trends</CardTitle>
              <CardDescription>Impressions, clicks, and CTR over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#8884d8" name="Impressions" />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
                  <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#ffc658" name="CTR %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Keywords</CardTitle>
              <CardDescription>Keyword rankings and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordData.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{keyword.keyword}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Position: {keyword.position}</span>
                        <span>Impressions: {keyword.impressions.toLocaleString()}</span>
                        <span>Clicks: {keyword.clicks}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {keyword.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {keyword.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {keyword.trend === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
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
                <CardTitle>Traffic Source Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{source.count.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{source.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>Compare your SEO performance with competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.map((competitor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{competitor.name}</h4>
                      <Badge variant={competitor.name === 'TalentXcel' ? 'default' : 'secondary'}>
                        {competitor.name === 'TalentXcel' ? 'You' : 'Competitor'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Visibility Score</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={competitor.visibility} className="flex-1" />
                          <span className="text-sm font-medium">{competitor.visibility}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Keywords</p>
                        <p className="font-medium">{competitor.keywords.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Est. Traffic</p>
                        <p className="font-medium">{(competitor.traffic / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Automation Status</CardTitle>
                <CardDescription>Automated SEO tasks and their status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Meta Tag Optimization</h4>
                    <p className="text-sm text-gray-600">Auto-generate meta tags for new pages</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sitemap Updates</h4>
                    <p className="text-sm text-gray-600">Automatic sitemap generation</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Schema Markup</h4>
                    <p className="text-sm text-gray-600">Dynamic structured data generation</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Content Optimization</h4>
                    <p className="text-sm text-gray-600">AI-powered content suggestions</p>
                  </div>
                  <Badge variant="secondary">Planned</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Health Alerts</CardTitle>
                <CardDescription>Important issues that need attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Page Speed Warning</h4>
                    <p className="text-sm text-yellow-700">3 pages have load times > 3 seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg border-green-200 bg-green-50">
                  <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">SEO Score Improved</h4>
                    <p className="text-sm text-green-700">Overall SEO score increased by 5 points</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg border-blue-200 bg-blue-50">
                  <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">New Keyword Opportunities</h4>
                    <p className="text-sm text-blue-700">12 new keywords identified for targeting</p>
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
