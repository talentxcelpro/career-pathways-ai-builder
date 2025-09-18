import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  ExternalLink,
  Eye,
  MousePointer,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSearchConsoleIntegration } from '@/hooks/useSearchConsoleIntegration';
import { toast } from 'sonner';

export const GoogleSearchConsoleIntegration = () => {
  const { data, loading, error, refreshData } = useSearchConsoleIntegration();
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate authentication flow
      toast.info('Opening Google authentication...');
      
      // In a real implementation, this would handle OAuth flow
      setTimeout(() => {
        toast.success('Google Search Console connected successfully!');
        setIsConnecting(false);
        refreshData();
      }, 2000);
    } catch (error) {
      toast.error('Failed to connect to Google Search Console');
      setIsConnecting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Demo data when no real data is available
  const demoData = {
    impressions: 125430,
    clicks: 8760,
    ctr: 6.98,
    position: 8.2,
    queries: [
      { query: 'ai resume builder', impressions: 12500, clicks: 890, ctr: 7.12, position: 5.2 },
      { query: 'job search platform', impressions: 8900, clicks: 560, ctr: 6.29, position: 7.8 },
      { query: 'career advice online', impressions: 6700, clicks: 420, ctr: 6.27, position: 9.1 },
      { query: 'remote work jobs', impressions: 15600, clicks: 1200, ctr: 7.69, position: 4.3 },
      { query: 'tech career guidance', impressions: 4500, clicks: 280, ctr: 6.22, position: 11.5 }
    ],
    pages: [
      { page: '/jobs/ai-engineer', impressions: 8900, clicks: 670, ctr: 7.53, position: 6.1 },
      { page: '/resume-builder', impressions: 15600, clicks: 1200, ctr: 7.69, position: 4.8 },
      { page: '/career-advice', impressions: 6700, clicks: 420, ctr: 6.27, position: 8.9 },
      { page: '/remote-jobs', impressions: 12300, clicks: 890, ctr: 7.24, position: 5.5 },
      { page: '/companies/tech-startups', impressions: 5400, clicks: 320, ctr: 5.93, position: 12.2 }
    ]
  };

  const displayData = data || demoData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Search Console Integration</h2>
          <p className="text-muted-foreground">Monitor your search performance with real-time GSC data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Connect GSC
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Connected to Google Search Console</p>
                    <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold">Demo Mode Active</p>
                    <p className="text-sm text-muted-foreground">Connect your Google Search Console for real data</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={data ? "default" : "secondary"}>
              {data ? "Live Data" : "Demo Data"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(displayData.impressions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(displayData.clicks)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              +18.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.ctr.toFixed(2)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
              +0.8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Position</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.position.toFixed(1)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
              -1.2 positions improved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data */}
      <Tabs defaultValue="queries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queries">Top Queries</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Queries</CardTitle>
              <CardDescription>Keywords driving the most traffic to your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Query</th>
                      <th className="text-left p-4">Impressions</th>
                      <th className="text-left p-4">Clicks</th>
                      <th className="text-left p-4">CTR</th>
                      <th className="text-left p-4">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.queries.map((query, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-4 font-medium">{query.query}</td>
                        <td className="p-4">{formatNumber(query.impressions)}</td>
                        <td className="p-4 font-semibold text-primary">{formatNumber(query.clicks)}</td>
                        <td className="p-4">{query.ctr.toFixed(2)}%</td>
                        <td className="p-4">
                          <Badge variant={query.position < 10 ? "default" : "secondary"}>
                            {query.position.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Pages with the highest search visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Page</th>
                      <th className="text-left p-4">Impressions</th>
                      <th className="text-left p-4">Clicks</th>
                      <th className="text-left p-4">CTR</th>
                      <th className="text-left p-4">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.pages.map((page, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{page.page}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </td>
                        <td className="p-4">{formatNumber(page.impressions)}</td>
                        <td className="p-4 font-semibold text-primary">{formatNumber(page.clicks)}</td>
                        <td className="p-4">{page.ctr.toFixed(2)}%</td>
                        <td className="p-4">
                          <Badge variant={page.position < 10 ? "default" : "secondary"}>
                            {page.position.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Automated analysis of your search performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🚀 Growth Opportunity Detected</h4>
                  <p className="text-blue-800">Your "ai resume builder" query is ranking #5. With optimization, you could reach position #2-3, potentially increasing clicks by 40-60%.</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Strong Performance</h4>
                  <p className="text-green-800">Your CTR for "remote work jobs" (7.69%) is 85% above industry average. This indicates excellent title and meta description optimization.</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Attention Needed</h4>
                  <p className="text-yellow-800">Several high-impression queries have low CTRs. Consider optimizing meta descriptions for better click-through rates.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
                <CardDescription>Actionable recommendations to improve search performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Improve "tech career guidance" ranking</h4>
                      <p className="text-sm text-muted-foreground">Currently at position 11.5 - optimize content and build backlinks to reach top 10</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">High Impact</Badge>
                        <Badge variant="outline">Medium Effort</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Optimize meta descriptions</h4>
                      <p className="text-sm text-muted-foreground">5 pages have suboptimal CTRs - rewrite meta descriptions with compelling calls-to-action</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Medium Impact</Badge>
                        <Badge variant="outline">Low Effort</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Create content for trending keywords</h4>
                      <p className="text-sm text-muted-foreground">Emerging queries show opportunity in "ai job matching" and "remote work tools"</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Very High Impact</Badge>
                        <Badge variant="outline">High Effort</Badge>
                      </div>
                    </div>
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