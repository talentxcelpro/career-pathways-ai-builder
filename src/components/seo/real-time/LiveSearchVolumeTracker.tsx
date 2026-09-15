import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Eye,
  Calendar,
  Globe,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface KeywordVolumeData {
  keyword: string;
  current_volume: number;
  previous_volume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  difficulty: number;
  opportunity_score: number;
  related_keywords: string[];
  volume_history: Array<{
    date: string;
    volume: number;
  }>;
  last_updated: string;
}

interface TrendingKeyword {
  keyword: string;
  volume: number;
  growth: number;
  category: string;
}

export const LiveSearchVolumeTracker = () => {
  const [keywords, setKeywords] = useState<KeywordVolumeData[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    loadVolumeData();
    loadTrendingKeywords();
    
    // Update every 2 minutes for search volume (simulated real-time)
    const interval = setInterval(() => {
      if (isTracking) {
        updateVolumeData();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const loadVolumeData = async () => {
    setLoading(true);
    try {
      // Simulate search volume data
      const mockKeywords: KeywordVolumeData[] = [
        {
          keyword: 'software engineer jobs',
          current_volume: 12400,
          previous_volume: 11800,
          cpc: 2.35,
          competition: 'high',
          trend: 'up',
          difficulty: 72,
          opportunity_score: 65,
          related_keywords: ['software developer jobs', 'programming jobs', 'tech jobs'],
          volume_history: generateVolumeHistory(12400),
          last_updated: new Date().toISOString()
        },
        {
          keyword: 'remote work opportunities',
          current_volume: 8900,
          previous_volume: 9200,
          cpc: 1.87,
          competition: 'medium',
          trend: 'down',
          difficulty: 58,
          opportunity_score: 78,
          related_keywords: ['work from home', 'remote jobs', 'telecommute'],
          volume_history: generateVolumeHistory(8900),
          last_updated: new Date().toISOString()
        },
        {
          keyword: 'data scientist careers',
          current_volume: 15600,
          previous_volume: 15550,
          cpc: 3.24,
          competition: 'high',
          trend: 'stable',
          difficulty: 81,
          opportunity_score: 45,
          related_keywords: ['machine learning jobs', 'AI careers', 'analytics jobs'],
          volume_history: generateVolumeHistory(15600),
          last_updated: new Date().toISOString()
        }
      ];
      
      setKeywords(mockKeywords);
    } catch (error) {
      console.error('Error loading volume data:', error);
      toast.error('Failed to load search volume data');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingKeywords = async () => {
    try {
      const mockTrending: TrendingKeyword[] = [
        { keyword: 'ai engineer jobs', volume: 5600, growth: 245, category: 'Technology' },
        { keyword: 'blockchain developer', volume: 3400, growth: 189, category: 'Technology' },
        { keyword: 'sustainability careers', volume: 4200, growth: 156, category: 'Environment' },
        { keyword: 'mental health jobs', volume: 2800, growth: 134, category: 'Healthcare' },
        { keyword: 'fintech careers', volume: 3900, growth: 98, category: 'Finance' }
      ];
      
      setTrendingKeywords(mockTrending);
    } catch (error) {
      console.error('Error loading trending keywords:', error);
    }
  };

  const generateVolumeHistory = (baseVolume: number) => {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const volume = Math.round(baseVolume * (1 + variation));
      history.push({
        date: date.toISOString().split('T')[0],
        volume: volume
      });
    }
    return history;
  };

  const updateVolumeData = async () => {
    try {
      setKeywords(prev => prev.map(keyword => {
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const newVolume = Math.round(keyword.current_volume * (1 + variation));
        const trend = newVolume > keyword.current_volume ? 'up' : 
                     newVolume < keyword.current_volume ? 'down' : 'stable';
        
        return {
          ...keyword,
          previous_volume: keyword.current_volume,
          current_volume: newVolume,
          trend,
          last_updated: new Date().toISOString()
        };
      }));
      
      toast.success('Search volumes updated', { duration: 2000 });
    } catch (error) {
      console.error('Error updating volume data:', error);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    const baseVolume = Math.floor(Math.random() * 20000) + 1000;
    const newKeywordData: KeywordVolumeData = {
      keyword: newKeyword.trim(),
      current_volume: baseVolume,
      previous_volume: baseVolume * (0.9 + Math.random() * 0.2),
      cpc: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      trend: 'stable',
      difficulty: Math.floor(Math.random() * 50) + 30,
      opportunity_score: Math.floor(Math.random() * 60) + 40,
      related_keywords: [`${newKeyword} related`, `${newKeyword} similar`],
      volume_history: generateVolumeHistory(baseVolume),
      last_updated: new Date().toISOString()
    };

    setKeywords(prev => [newKeywordData, ...prev]);
    setNewKeyword('');
    toast.success('Keyword added to tracking');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalVolume = keywords.reduce((sum, kw) => sum + kw.current_volume, 0);
  const avgOpportunityScore = keywords.length > 0 
    ? Math.round(keywords.reduce((sum, kw) => sum + kw.opportunity_score, 0) / keywords.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Search Volume Tracker</h2>
          <p className="text-muted-foreground">Real-time keyword search volume monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isTracking ? "default" : "secondary"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isTracking ? 'Live Tracking' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? 'Pause' : 'Start'} Tracking
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={updateVolumeData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{formatNumber(totalVolume)}</p>
              </div>
              <Search className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keywords</p>
                <p className="text-2xl font-bold">{keywords.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Opportunity</p>
                <p className="text-2xl font-bold">{avgOpportunityScore}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold">{trendingKeywords.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Keyword */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Keyword to Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter keyword to track search volume"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword}>Track Volume</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Volume Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Volumes</CardTitle>
            <CardDescription>Current search volumes and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywords.map((keyword) => (
                <div 
                  key={keyword.keyword} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedKeyword(selectedKeyword === keyword.keyword ? null : keyword.keyword)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getTrendIcon(keyword.trend)}
                    <div>
                      <h4 className="font-semibold">{keyword.keyword}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>CPC: ${keyword.cpc}</span>
                        <Badge className={`text-xs ${getCompetitionColor(keyword.competition)}`}>
                          {keyword.competition}
                        </Badge>
                        <span>Diff: {keyword.difficulty}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{formatNumber(keyword.current_volume)}</span>
                      {keyword.current_volume !== keyword.previous_volume && (
                        <div className="flex items-center gap-1">
                          {keyword.current_volume > keyword.previous_volume ? (
                            <ArrowUpRight className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Opportunity: {keyword.opportunity_score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Volume History Chart */}
            {selectedKeyword && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold mb-4">30-Day Volume History: {selectedKeyword}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={keywords.find(k => k.keyword === selectedKeyword)?.volume_history || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
            <CardDescription>Fast-growing search terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingKeywords.map((trending, index) => (
                <div key={trending.keyword} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <h4 className="font-medium">{trending.keyword}</h4>
                      <p className="text-sm text-muted-foreground">{trending.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatNumber(trending.volume)}</span>
                      <Badge variant="default" className="bg-green-600">
                        +{trending.growth}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {keywords.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No keywords being tracked yet.</p>
            <p className="text-sm text-muted-foreground">Add keywords above to start monitoring search volumes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};