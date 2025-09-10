import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KeywordData {
  keyword: string;
  domain: string;
  position: number | null;
  url: string | null;
  title: string | null;
  snippet: string | null;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
  competition: string | null;
  trends: Array<{ month: string; volume: number }>;
}

interface SearchConsoleData {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    averagePosition: number;
  };
  topQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
}

export const RealTimeKeywordTracker = () => {
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rankingData, setRankingData] = useState<KeywordData[]>([]);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData | null>(null);
  const [activeTab, setActiveTab] = useState('tracker');

  const handleRankTracking = async () => {
    if (!domain.trim() || !keywords.trim()) {
      toast.error('Please enter both domain and keywords');
      return;
    }

    setIsLoading(true);
    try {
      const keywordList = keywords.split('\n').map(k => k.trim()).filter(k => k);
      
      const { data, error } = await supabase.functions.invoke('serp-rank-tracker', {
        body: {
          domain: domain.trim(),
          keywords: keywordList
        }
      });

      if (error) throw error;

      setRankingData(data.results || []);
      toast.success(`Rank tracking completed for ${keywordList.length} keywords`);
    } catch (error) {
      console.error('Rank tracking failed:', error);
      toast.error('Failed to track keyword rankings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchConsoleData = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-search-console', {
        body: {
          siteUrl: domain.trim()
        }
      });

      if (error) throw error;

      setSearchConsoleData(data);
      toast.success('Search Console data fetched successfully');
    } catch (error) {
      console.error('Search Console fetch failed:', error);
      toast.error('Failed to fetch Search Console data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionBadge = (position: number | null) => {
    if (!position) return <Badge variant="secondary">Not Found</Badge>;
    if (position <= 3) return <Badge className="bg-green-500">#{position}</Badge>;
    if (position <= 10) return <Badge className="bg-yellow-500">#{position}</Badge>;
    if (position <= 20) return <Badge className="bg-orange-500">#{position}</Badge>;
    return <Badge variant="destructive">#{position}</Badge>;
  };

  const getDifficultyBadge = (difficulty: number | null) => {
    if (!difficulty) return null;
    if (difficulty < 30) return <Badge className="bg-green-500">Easy</Badge>;
    if (difficulty < 60) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-red-500">Hard</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Real-Time Keyword Intelligence
          </CardTitle>
          <CardDescription>
            Track keyword rankings and analyze Search Console data with live updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Domain to Track</label>
              <Input
                placeholder="Enter domain (e.g., talentxcel.in)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Keywords (one per line)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="ai resume builder&#10;job search platform&#10;career guidance"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRankTracking} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
              Track Rankings
            </Button>
            <Button 
              onClick={handleSearchConsoleData} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Get GSC Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker">Rank Tracker</TabsTrigger>
          <TabsTrigger value="console">Search Console</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          {rankingData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keyword Rankings</CardTitle>
                <CardDescription>Current positions for tracked keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankingData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{item.keyword}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.searchVolume && (
                            <span className="mr-4">
                              Volume: {item.searchVolume.toLocaleString()}
                            </span>
                          )}
                          {item.cpc && (
                            <span className="mr-4">
                              CPC: ${item.cpc.toFixed(2)}
                            </span>
                          )}
                          {item.competition && (
                            <span>Competition: {item.competition}</span>
                          )}
                        </div>
                        {item.url && (
                          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {item.url}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getDifficultyBadge(item.difficulty)}
                        {getPositionBadge(item.position)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="console" className="space-y-4">
          {searchConsoleData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Impressions</p>
                        <p className="text-2xl font-bold">
                          {searchConsoleData.summary.totalImpressions.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clicks</p>
                        <p className="text-2xl font-bold">
                          {searchConsoleData.summary.totalClicks.toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average CTR</p>
                        <p className="text-2xl font-bold">
                          {searchConsoleData.summary.averageCTR.toFixed(2)}%
                        </p>
                      </div>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Position</p>
                        <p className="text-2xl font-bold">
                          {searchConsoleData.summary.averagePosition.toFixed(1)}
                        </p>
                      </div>
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchConsoleData.topQueries.slice(0, 10).map((query, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <div className="font-medium">{query.query}</div>
                            <div className="text-sm text-muted-foreground">
                              Position: {query.position.toFixed(1)} • CTR: {query.ctr}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{query.clicks}</div>
                            <div className="text-sm text-muted-foreground">
                              {query.impressions.toLocaleString()} imp
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchConsoleData.topPages.slice(0, 10).map((page, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {page.page.replace(/^https?:\/\/[^\/]+/, '')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Position: {page.position.toFixed(1)} • CTR: {page.ctr}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{page.clicks}</div>
                            <div className="text-sm text-muted-foreground">
                              {page.impressions.toLocaleString()} imp
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Smart recommendations based on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900">Opportunity Alert</div>
                    <div className="text-blue-800 text-sm">
                      Keywords ranking between positions 11-20 have high improvement potential. 
                      Focus on optimizing content for these terms to reach page 1.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900">Top Performers</div>
                    <div className="text-green-800 text-sm">
                      Your top 3 ranking keywords are driving 60% of your organic traffic. 
                      Consider creating related content to capture more long-tail variations.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-orange-900">Content Gap</div>
                    <div className="text-orange-800 text-sm">
                      Your competitors are ranking for 15+ keywords you're not targeting. 
                      Consider expanding your content strategy to cover these gaps.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};