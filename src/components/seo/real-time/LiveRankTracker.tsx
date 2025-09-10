import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Eye,
  Target,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RankData {
  id: string;
  keyword: string;
  current_position: number;
  previous_position: number;
  url: string;
  search_volume: number;
  difficulty: number;
  location: string;
  device: 'desktop' | 'mobile';
  updated_at: string;
  change: number;
}

export const LiveRankTracker = () => {
  const [rankings, setRankings] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('India');
  const [isTracking, setIsTracking] = useState(false);

  // Simulate real-time data with live updates
  useEffect(() => {
    // Load initial data
    loadRankings();
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      if (isTracking) {
        updateRankings();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      // Simulate real ranking data
      const mockRankings: RankData[] = [
        {
          id: '1',
          keyword: 'software engineer jobs',
          current_position: 3,
          previous_position: 5,
          url: '/jobs/software-engineer',
          search_volume: 12400,
          difficulty: 65,
          location: 'India',
          device: 'desktop',
          updated_at: new Date().toISOString(),
          change: -2
        },
        {
          id: '2',
          keyword: 'data scientist careers',
          current_position: 7,
          previous_position: 9,
          url: '/jobs/data-scientist',
          search_volume: 8900,
          difficulty: 72,
          location: 'India',
          device: 'desktop',
          updated_at: new Date().toISOString(),
          change: -2
        },
        {
          id: '3',
          keyword: 'remote jobs India',
          current_position: 15,
          previous_position: 12,
          url: '/jobs/remote',
          search_volume: 15600,
          difficulty: 58,
          location: 'India',
          device: 'mobile',
          updated_at: new Date().toISOString(),
          change: 3
        },
        {
          id: '4',
          keyword: 'product manager jobs',
          current_position: 4,
          previous_position: 4,
          url: '/jobs/product-manager',
          search_volume: 6700,
          difficulty: 68,
          location: 'India',
          device: 'desktop',
          updated_at: new Date().toISOString(),
          change: 0
        }
      ];
      
      setRankings(mockRankings);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error('Failed to load ranking data');
    } finally {
      setLoading(false);
    }
  };

  const updateRankings = async () => {
    try {
      // Simulate real-time position changes
      setRankings(prev => prev.map(rank => {
        const randomChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newPosition = Math.max(1, Math.min(100, rank.current_position + randomChange));
        
        return {
          ...rank,
          previous_position: rank.current_position,
          current_position: newPosition,
          change: rank.current_position - newPosition,
          updated_at: new Date().toISOString()
        };
      }));
      
      toast.success('Rankings updated', { duration: 2000 });
    } catch (error) {
      console.error('Error updating rankings:', error);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    const newRank: RankData = {
      id: Date.now().toString(),
      keyword: newKeyword.trim(),
      current_position: Math.floor(Math.random() * 50) + 1,
      previous_position: Math.floor(Math.random() * 50) + 1,
      url: `/jobs/${newKeyword.replace(/\s+/g, '-').toLowerCase()}`,
      search_volume: Math.floor(Math.random() * 20000) + 1000,
      difficulty: Math.floor(Math.random() * 40) + 50,
      location: selectedLocation,
      device: 'desktop',
      updated_at: new Date().toISOString(),
      change: 0
    };

    setRankings(prev => [newRank, ...prev]);
    setNewKeyword('');
    toast.success('Keyword added to tracking');
  };

  const getRankTrend = (change: number) => {
    if (change < 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    if (change > 0) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const averagePosition = rankings.length > 0 
    ? Math.round(rankings.reduce((sum, rank) => sum + rank.current_position, 0) / rankings.length)
    : 0;

  const topKeywords = rankings.filter(rank => rank.current_position <= 10).length;
  const totalVolume = rankings.reduce((sum, rank) => sum + rank.search_volume, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Rank Tracker</h2>
          <p className="text-muted-foreground">Real-time keyword position monitoring</p>
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
            onClick={updateRankings}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Position</p>
                <p className="text-2xl font-bold">{averagePosition}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top 10</p>
                <p className="text-2xl font-bold text-green-600">{topKeywords}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Search Volume</p>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keywords</p>
                <p className="text-2xl font-bold">{rankings.length}</p>
              </div>
              <Search className="h-8 w-8 text-orange-500" />
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
              placeholder="Enter keyword to track"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
            </select>
            <Button onClick={addKeyword}>Add Keyword</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Rankings</CardTitle>
          <CardDescription>
            Live tracking of keyword positions across search engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.map((rank) => {
              const trend = getRankTrend(rank.change);
              const TrendIcon = trend.icon;
              
              return (
                <div key={rank.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${trend.bg}`}>
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{rank.keyword}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{rank.url}</span>
                        <span>Vol: {rank.search_volume.toLocaleString()}</span>
                        <span>Diff: {rank.difficulty}%</span>
                        <Badge variant="outline" className="text-xs">
                          {rank.device}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{rank.current_position}</span>
                      {rank.change !== 0 && (
                        <div className="flex items-center gap-1">
                          {rank.change < 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${rank.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(rank.change)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(rank.updated_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {rankings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No keywords being tracked yet.</p>
              <p className="text-sm">Add keywords above to start monitoring rankings.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};