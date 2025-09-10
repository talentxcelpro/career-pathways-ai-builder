import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  MousePointer,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface GSCData {
  total_clicks: number;
  total_impressions: number;
  average_ctr: number;
  average_position: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface KeywordPerformance {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  change_clicks: number;
  change_impressions: number;
  trend: 'up' | 'down' | 'stable';
}

interface PagePerformance {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  issues: string[];
}

interface DevicePerformance {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  share: number;
}

export const GoogleSearchConsoleIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gscData, setGscData] = useState<GSCData | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordPerformance[]>([]);
  const [pageData, setPageData] = useState<PagePerformance[]>([]);
  const [deviceData, setDeviceData] = useState<DevicePerformance[]>([]);
  const [timeRange, setTimeRange] = useState('28d');
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');

  useEffect(() => {
    if (isConnected) {
      loadGSCData();
    }
  }, [isConnected, timeRange]);

  const connectToGSC = async () => {
    setLoading(true);
    try {
      // Simulate OAuth connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast.success('Connected to Google Search Console');
    } catch (error) {
      console.error('Error connecting to GSC:', error);
      toast.error('Failed to connect to Google Search Console');
    } finally {
      setLoading(false);
    }
  };

  const loadGSCData = async () => {
    setLoading(true);
    try {
      // Simulate GSC data loading
      const mockGSCData: GSCData = {
        total_clicks: 125000,
        total_impressions: 4500000,
        average_ctr: 2.78,
        average_position: 8.4,
        date_range: {
          start: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };

      const mockKeywordData: KeywordPerformance[] = [
        {
          query: 'software engineer jobs',
          clicks: 12400,
          impressions: 456000,
          ctr: 2.72,
          position: 4.2,
          change_clicks: 8.5,
          change_impressions: 12.3,
          trend: 'up'
        },
        {
          query: 'data scientist careers',
          clicks: 8900,
          impressions: 389000,
          ctr: 2.29,
          position: 6.1,
          change_clicks: -3.2,
          change_impressions: 5.8,
          trend: 'down'
        },
        {
          query: 'remote jobs India',
          clicks: 15600,
          impressions: 567000,
          ctr: 2.75,
          position: 5.8,
          change_clicks: 15.7,
          change_impressions: 18.9,
          trend: 'up'
        },
        {
          query: 'product manager jobs',
          clicks: 6700,
          impressions: 234000,
          ctr: 2.86,
          position: 7.2,
          change_clicks: 2.1,
          change_impressions: 1.8,
          trend: 'stable'
        }
      ];

      const mockPageData: PagePerformance[] = [
        {
          page: '/jobs/software-engineer',
          clicks: 45600,
          impressions: 1200000,
          ctr: 3.8,
          position: 5.2,
          issues: []
        },
        {
          page: '/jobs/data-scientist',
          clicks: 23400,
          impressions: 890000,
          ctr: 2.63,
          position: 7.1,
          issues: ['Low CTR', 'High bounce rate']
        },
        {
          page: '/companies',
          clicks: 18900,
          impressions: 567000,
          ctr: 3.33,
          position: 4.8,
          issues: []
        },
        {
          page: '/jobs/remote',
          clicks: 34200,
          impressions: 1100000,
          ctr: 3.11,
          position: 6.4,
          issues: ['Position declining']
        }
      ];

      const mockDeviceData: DevicePerformance[] = [
        { device: 'Mobile', clicks: 67500, impressions: 2700000, ctr: 2.5, share: 60 },
        { device: 'Desktop', clicks: 43750, impressions: 1350000, ctr: 3.24, share: 30 },
        { device: 'Tablet', clicks: 13750, impressions: 450000, ctr: 3.06, share: 10 }
      ];

      setGscData(mockGSCData);
      setKeywordData(mockKeywordData);
      setPageData(mockPageData);
      setDeviceData(mockDeviceData);
    } catch (error) {
      console.error('Error loading GSC data:', error);
      toast.error('Failed to load Search Console data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Google Search Console Integration</h2>
          <p className="text-muted-foreground mb-8">Connect your Search Console to access real-time SEO data</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Connect Google Search Console</CardTitle>
            <CardDescription>
              Import real search performance data from Google Search Console to enhance your SEO insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">What you'll get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real search queries and rankings</li>
                <li>• Click-through rates and impressions</li>
                <li>• Page performance analytics</li>
                <li>• Mobile vs desktop insights</li>
                <li>• Index coverage reports</li>
              </ul>
            </div>
            
            <Button 
              onClick={connectToGSC} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Connect to Google Search Console
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Search Console</h2>
          <p className="text-muted-foreground">Real-time search performance data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="28d">Last 28 days</option>
            <option value="90d">Last 3 months</option>
            <option value="365d">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadGSCData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {gscData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{formatNumber(gscData.total_clicks)}</p>
                </div>
                <MousePointer className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Impressions</p>
                  <p className="text-2xl font-bold">{formatNumber(gscData.total_impressions)}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average CTR</p>
                  <p className="text-2xl font-bold">{gscData.average_ctr.toFixed(2)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Position</p>
                  <p className="text-2xl font-bold">{gscData.average_position.toFixed(1)}</p>
                </div>
                <Search className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Queries</CardTitle>
            <CardDescription>Search queries driving the most traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywordData.map((keyword, index) => (
                <div key={keyword.query} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(keyword.trend)}
                      <div>
                        <h4 className="font-medium">{keyword.query}</h4>
                        <p className="text-sm text-muted-foreground">Position: {keyword.position.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">{formatNumber(keyword.clicks)} clicks</div>
                    <div className="text-sm text-muted-foreground">{keyword.ctr.toFixed(2)}% CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
            <CardDescription>Traffic distribution by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                    label={({ device, share }) => `${device} (${share}%)`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {deviceData.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                      {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                      {device.device === 'Tablet' && <Smartphone className="h-4 w-4" />}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(device.clicks)}</div>
                      <div className="text-sm text-muted-foreground">{device.ctr.toFixed(2)}% CTR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Page Performance</CardTitle>
          <CardDescription>Individual page search performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pageData.map((page) => (
              <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">{page.page}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Position: {page.position.toFixed(1)}</span>
                      <span>CTR: {page.ctr.toFixed(2)}%</span>
                      {page.issues.length > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <span className="text-orange-600">{page.issues.length} issues</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(page.clicks)} clicks</div>
                  <div className="text-sm text-muted-foreground">{formatNumber(page.impressions)} impressions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Console Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Search Console Insights</CardTitle>
          <CardDescription>AI-powered recommendations based on your GSC data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Opportunity Identified</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Your "remote jobs India" query is trending up (+15.7% clicks). Consider creating more remote job content to capitalize on this trend.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Action Required</h4>
                  <p className="text-orange-800 text-sm mt-1">
                    The "/jobs/data-scientist" page has a declining CTR (2.63%). Consider updating the title tag and meta description to improve click-through rates.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Great Performance</h4>
                  <p className="text-green-800 text-sm mt-1">
                    Your "/companies" page is performing excellently with a 3.33% CTR and position 4.8. This can serve as a template for other pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};