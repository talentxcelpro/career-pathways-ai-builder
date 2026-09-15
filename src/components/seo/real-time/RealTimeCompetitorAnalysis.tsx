import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Search, 
  Globe,
  BarChart3,
  Eye,
  Link,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface CompetitorData {
  id: string;
  domain: string;
  name: string;
  visibility_score: number;
  organic_keywords: number;
  organic_traffic: number;
  backlinks: number;
  referring_domains: number;
  content_updates: number;
  last_crawled: string;
  changes: {
    keywords: number;
    traffic: number;
    backlinks: number;
  };
  top_keywords: string[];
  new_keywords: string[];
  lost_keywords: string[];
}

export const RealTimeCompetitorAnalysis = () => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitors();
    
    // Real-time monitoring every 60 seconds
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateCompetitorData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      // Simulate competitor data
      const mockCompetitors: CompetitorData[] = [
        {
          id: '1',
          domain: 'naukri.com',
          name: 'Naukri',
          visibility_score: 92,
          organic_keywords: 456789,
          organic_traffic: 12500000,
          backlinks: 890000,
          referring_domains: 15600,
          content_updates: 234,
          last_crawled: new Date().toISOString(),
          changes: {
            keywords: 1250,
            traffic: 45000,
            backlinks: -120
          },
          top_keywords: ['software engineer jobs', 'IT jobs India', 'remote jobs'],
          new_keywords: ['ai engineer jobs', 'blockchain developer'],
          lost_keywords: ['flash developer', 'silverlight developer']
        },
        {
          id: '2',
          domain: 'linkedin.com',
          name: 'LinkedIn Jobs',
          visibility_score: 89,
          organic_keywords: 523000,
          organic_traffic: 8900000,
          backlinks: 2300000,
          referring_domains: 45000,
          content_updates: 567,
          last_crawled: new Date().toISOString(),
          changes: {
            keywords: 890,
            traffic: 125000,
            backlinks: 2500
          },
          top_keywords: ['professional jobs', 'career opportunities', 'executive jobs'],
          new_keywords: ['product manager remote', 'growth hacker'],
          lost_keywords: ['fax operator', 'typist jobs']
        },
        {
          id: '3',
          domain: 'indeed.com',
          name: 'Indeed India',
          visibility_score: 85,
          organic_keywords: 389000,
          organic_traffic: 6700000,
          backlinks: 567000,
          referring_domains: 12800,
          content_updates: 123,
          last_crawled: new Date().toISOString(),
          changes: {
            keywords: -340,
            traffic: -67000,
            backlinks: 180
          },
          top_keywords: ['part time jobs', 'work from home', 'entry level jobs'],
          new_keywords: ['crypto jobs', 'nft developer'],
          lost_keywords: ['newspaper delivery', 'phone operator']
        }
      ];
      
      setCompetitors(mockCompetitors);
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast.error('Failed to load competitor data');
    } finally {
      setLoading(false);
    }
  };

  const updateCompetitorData = async () => {
    try {
      setCompetitors(prev => prev.map(comp => {
        // Simulate real-time changes
        const keywordChange = Math.floor(Math.random() * 2000) - 1000;
        const trafficChange = Math.floor(Math.random() * 100000) - 50000;
        const backlinkChange = Math.floor(Math.random() * 1000) - 500;
        
        return {
          ...comp,
          organic_keywords: Math.max(0, comp.organic_keywords + keywordChange),
          organic_traffic: Math.max(0, comp.organic_traffic + trafficChange),
          backlinks: Math.max(0, comp.backlinks + backlinkChange),
          changes: {
            keywords: keywordChange,
            traffic: trafficChange,
            backlinks: backlinkChange
          },
          last_crawled: new Date().toISOString()
        };
      }));
      
      toast.success('Competitor data updated', { duration: 2000 });
    } catch (error) {
      console.error('Error updating competitor data:', error);
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitor.trim()) {
      toast.error('Please enter a competitor domain');
      return;
    }

    const domain = newCompetitor.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    const newComp: CompetitorData = {
      id: Date.now().toString(),
      domain: domain,
      name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
      visibility_score: Math.floor(Math.random() * 40) + 60,
      organic_keywords: Math.floor(Math.random() * 100000) + 50000,
      organic_traffic: Math.floor(Math.random() * 5000000) + 1000000,
      backlinks: Math.floor(Math.random() * 500000) + 100000,
      referring_domains: Math.floor(Math.random() * 10000) + 5000,
      content_updates: Math.floor(Math.random() * 200) + 50,
      last_crawled: new Date().toISOString(),
      changes: { keywords: 0, traffic: 0, backlinks: 0 },
      top_keywords: ['jobs', 'careers', 'employment'],
      new_keywords: [],
      lost_keywords: []
    };

    setCompetitors(prev => [newComp, ...prev]);
    setNewCompetitor('');
    toast.success('Competitor added to monitoring');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-3 w-3" />;
    if (change < 0) return <ArrowDownRight className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Competitor Analysis</h2>
          <p className="text-muted-foreground">Live monitoring of competitor SEO performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isMonitoring ? 'Live Monitoring' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Pause' : 'Start'} Monitoring
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={updateCompetitorData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Add Competitor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Competitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter competitor domain (e.g., naukri.com)"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
            />
            <Button onClick={addCompetitor}>Add Competitor</Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitors Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp) => (
          <Card key={comp.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCompetitor(comp.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {comp.domain}
                  </CardDescription>
                </div>
                <Badge variant={comp.visibility_score >= 80 ? "default" : "secondary"}>
                  {comp.visibility_score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Keywords</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{formatNumber(comp.organic_keywords)}</span>
                    <span className={`text-xs ${getChangeColor(comp.changes.keywords)}`}>
                      {getChangeIcon(comp.changes.keywords)}
                      {comp.changes.keywords !== 0 && Math.abs(comp.changes.keywords)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Traffic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{formatNumber(comp.organic_traffic)}</span>
                    <span className={`text-xs ${getChangeColor(comp.changes.traffic)}`}>
                      {getChangeIcon(comp.changes.traffic)}
                      {comp.changes.traffic !== 0 && formatNumber(Math.abs(comp.changes.traffic))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Backlinks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{formatNumber(comp.backlinks)}</span>
                    <span className={`text-xs ${getChangeColor(comp.changes.backlinks)}`}>
                      {getChangeIcon(comp.changes.backlinks)}
                      {comp.changes.backlinks !== 0 && Math.abs(comp.changes.backlinks)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {new Date(comp.last_crawled).toLocaleTimeString()}</span>
                  <span>{comp.content_updates} content updates</span>
                </div>
              </div>

              {comp.new_keywords.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+{comp.new_keywords.length} new keywords</span>
                </div>
              )}
              
              {comp.lost_keywords.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600">-{comp.lost_keywords.length} lost keywords</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedCompetitor && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
            <CardDescription>
              In-depth competitor insights and keyword opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const comp = competitors.find(c => c.id === selectedCompetitor);
              if (!comp) return null;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Top Keywords</h4>
                      <div className="space-y-1">
                        {comp.top_keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">New Keywords</h4>
                      <div className="space-y-1">
                        {comp.new_keywords.map((keyword, index) => (
                          <Badge key={index} variant="default" className="mr-1 mb-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Lost Keywords</h4>
                      <div className="space-y-1">
                        {comp.lost_keywords.map((keyword, index) => (
                          <Badge key={index} variant="destructive" className="mr-1 mb-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedCompetitor(null)}>
                      Close Details
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {competitors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No competitors being monitored yet.</p>
            <p className="text-sm text-muted-foreground">Add competitor domains above to start tracking.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};