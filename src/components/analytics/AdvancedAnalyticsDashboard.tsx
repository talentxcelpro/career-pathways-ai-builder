import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Download, 
  Share, 
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Clock
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  period: string;
  views: number;
  downloads: number;
  shares: number;
  applications: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

interface GeographicData {
  country: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  views: number;
  percentage: number;
}

interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
  conversionRate: number;
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, fetch from API
  const [analyticsData] = useState<AnalyticsData[]>([
    { period: 'Jan', views: 1200, downloads: 45, shares: 23, applications: 12, uniqueVisitors: 890, bounceRate: 45, avgTimeOnPage: 180 },
    { period: 'Feb', views: 1500, downloads: 62, shares: 31, applications: 18, uniqueVisitors: 1100, bounceRate: 42, avgTimeOnPage: 195 },
    { period: 'Mar', views: 1800, downloads: 78, shares: 41, applications: 25, uniqueVisitors: 1350, bounceRate: 38, avgTimeOnPage: 210 },
    { period: 'Apr', views: 2100, downloads: 89, shares: 52, applications: 31, uniqueVisitors: 1580, bounceRate: 35, avgTimeOnPage: 225 },
    { period: 'May', views: 2400, downloads: 105, shares: 67, applications: 38, uniqueVisitors: 1820, bounceRate: 32, avgTimeOnPage: 240 },
    { period: 'Jun', views: 2800, downloads: 124, shares: 78, applications: 45, uniqueVisitors: 2100, bounceRate: 29, avgTimeOnPage: 255 }
  ]);

  const [geographicData] = useState<GeographicData[]>([
    { country: 'United States', views: 3500, percentage: 35 },
    { country: 'India', views: 2800, percentage: 28 },
    { country: 'United Kingdom', views: 1500, percentage: 15 },
    { country: 'Germany', views: 1000, percentage: 10 },
    { country: 'Canada', views: 800, percentage: 8 },
    { country: 'Others', views: 400, percentage: 4 }
  ]);

  const [deviceData] = useState<DeviceData[]>([
    { device: 'Desktop', views: 4500, percentage: 45 },
    { device: 'Mobile', views: 3800, percentage: 38 },
    { device: 'Tablet', views: 1700, percentage: 17 }
  ]);

  const [trafficSources] = useState<TrafficSource[]>([
    { source: 'Google Search', views: 3200, percentage: 32, conversionRate: 12.5 },
    { source: 'LinkedIn', views: 2800, percentage: 28, conversionRate: 8.7 },
    { source: 'Direct Traffic', views: 2100, percentage: 21, conversionRate: 15.2 },
    { source: 'Job Boards', views: 1200, percentage: 12, conversionRate: 18.4 },
    { source: 'Social Media', views: 700, percentage: 7, conversionRate: 5.3 }
  ]);

  const totalViews = analyticsData.reduce((sum, data) => sum + data.views, 0);
  const totalDownloads = analyticsData.reduce((sum, data) => sum + data.downloads, 0);
  const totalShares = analyticsData.reduce((sum, data) => sum + data.shares, 0);
  const totalApplications = analyticsData.reduce((sum, data) => sum + data.applications, 0);

  const currentMonth = analyticsData[analyticsData.length - 1];
  const previousMonth = analyticsData[analyticsData.length - 2];

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const viewsChange = getChangePercentage(currentMonth.views, previousMonth.views);
  const downloadsChange = getChangePercentage(currentMonth.downloads, previousMonth.downloads);
  const sharesChange = getChangePercentage(currentMonth.shares, previousMonth.shares);
  const applicationsChange = getChangePercentage(currentMonth.applications, previousMonth.applications);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your resume performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {viewsChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={viewsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(viewsChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <div className="flex items-center text-xs">
              {downloadsChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={downloadsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(downloadsChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares}</div>
            <div className="flex items-center text-xs">
              {sharesChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={sharesChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(sharesChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <div className="flex items-center text-xs">
              {applicationsChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={applicationsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(applicationsChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Track your resume metrics over time</CardDescription>
                  </div>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="downloads">Downloads</SelectItem>
                      <SelectItem value="shares">Shares</SelectItem>
                      <SelectItem value="applications">Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Where your viewers are located</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{country.views}</div>
                        <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>How users access your content</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="views"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {deviceData.map((device, index) => (
                    <div key={device.device} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm">{device.device}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Unique Visitors</CardTitle>
                <CardDescription>Monthly unique visitor count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="uniqueVisitors" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User behavior on your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg. Time on Page</span>
                      <span>{currentMonth.avgTimeOnPage}s</span>
                    </div>
                    <Progress value={(currentMonth.avgTimeOnPage / 300) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bounce Rate</span>
                      <span>{currentMonth.bounceRate}%</span>
                    </div>
                    <Progress value={currentMonth.bounceRate} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Returning Visitors</CardTitle>
                <CardDescription>New vs returning visitor ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Visitors</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <Progress value={75} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Returning Visitors</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-muted-foreground">{source.percentage}% of traffic</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{source.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{source.conversionRate}% conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Performance</CardTitle>
                <CardDescription>Technical performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Load Time</span>
                      <span>1.2s</span>
                    </div>
                    <Progress value={80} />
                    <p className="text-xs text-muted-foreground mt-1">Fast</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to Interactive</span>
                      <span>2.1s</span>
                    </div>
                    <Progress value={70} />
                    <p className="text-xs text-muted-foreground mt-1">Good</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cumulative Layout Shift</span>
                      <span>0.05</span>
                    </div>
                    <Progress value={90} />
                    <p className="text-xs text-muted-foreground mt-1">Excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>How sections of your resume perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contact Information</span>
                    <Badge variant="secondary">95% viewed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional Summary</span>
                    <Badge variant="secondary">88% viewed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Work Experience</span>
                    <Badge variant="secondary">92% viewed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Skills Section</span>
                    <Badge variant="secondary">85% viewed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Education</span>
                    <Badge variant="secondary">78% viewed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from view to application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Page Views</span>
                    <span className="font-medium">2,800</span>
                  </div>
                  <Progress value={100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resume Downloads</span>
                    <span className="font-medium">124 (4.4%)</span>
                  </div>
                  <Progress value={4.4} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contact Initiated</span>
                    <span className="font-medium">78 (2.8%)</span>
                  </div>
                  <Progress value={2.8} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Applications</span>
                    <span className="font-medium">45 (1.6%)</span>
                  </div>
                  <Progress value={1.6} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Trends</CardTitle>
                <CardDescription>Monthly conversion performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={(data: any) => (data.applications / data.views * 100)}
                      stroke="#ef4444" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Performing Days</CardTitle>
                <CardDescription>When your resume performs best</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tuesday</span>
                    <Badge variant="secondary">18% conversion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wednesday</span>
                    <Badge variant="secondary">16% conversion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Thursday</span>
                    <Badge variant="secondary">15% conversion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monday</span>
                    <Badge variant="outline">12% conversion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Friday</span>
                    <Badge variant="outline">10% conversion</Badge>
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