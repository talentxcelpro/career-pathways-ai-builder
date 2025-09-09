import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Globe, 
  Smartphone, 
  Monitor,
  Plus,
  Search,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export const SEORankTracker = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const rankingData = [
    {
      keyword: 'ai resume builder',
      currentRank: 7,
      previousRank: 12,
      bestRank: 3,
      url: '/tools/resume-builder',
      volume: 89000,
      location: 'United States',
      device: 'desktop',
      change: 5
    },
    {
      keyword: 'job search platform',
      currentRank: 15,
      previousRank: 18,
      bestRank: 8,
      url: '/jobs',
      volume: 145000,
      location: 'United States',
      device: 'desktop',
      change: 3
    },
    {
      keyword: 'career guidance',
      currentRank: 23,
      previousRank: 19,
      bestRank: 14,
      url: '/career-guidance',
      volume: 34000,
      location: 'United States',
      device: 'desktop',
      change: -4
    },
    {
      keyword: 'remote jobs',
      currentRank: 41,
      previousRank: 45,
      bestRank: 28,
      url: '/jobs/remote',
      volume: 201000,
      location: 'United States',
      device: 'desktop',
      change: 4
    },
    {
      keyword: 'resume templates',
      currentRank: 6,
      previousRank: 8,
      bestRank: 2,
      url: '/resume/templates',
      volume: 67000,
      location: 'United States',
      device: 'desktop',
      change: 2
    }
  ];

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }
    toast.success(`Added "${newKeyword}" to tracking`);
    setNewKeyword('');
    setNewLocation('');
  };

  const getRankChange = (change: number) => {
    if (change > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        color: 'text-green-600',
        prefix: '+'
      };
    } else if (change < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-600" />,
        color: 'text-red-600',
        prefix: ''
      };
    } else {
      return {
        icon: <Minus className="h-4 w-4 text-gray-600" />,
        color: 'text-gray-600',
        prefix: ''
      };
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-green-600 bg-green-50';
    if (rank <= 10) return 'text-blue-600 bg-blue-50';
    if (rank <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const averageRank = Math.round(rankingData.reduce((acc, item) => acc + item.currentRank, 0) / rankingData.length);
  const totalImprovement = rankingData.reduce((acc, item) => acc + Math.max(0, item.change), 0);
  const totalDecline = rankingData.reduce((acc, item) => acc + Math.abs(Math.min(0, item.change)), 0);

  return (
    <div className="space-y-6">
      {/* Add New Keyword */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Rank Tracking Dashboard
          </CardTitle>
          <CardDescription>
            Monitor your keyword positions across search engines and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Keyword</label>
              <Input
                placeholder="Enter keyword to track"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="e.g., United States, India"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleAddKeyword}>
              <Plus className="h-4 w-4 mr-2" />
              Add Keyword
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Keywords</p>
                <p className="text-2xl font-bold">{rankingData.length}</p>
              </div>
              <Search className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rank</p>
                <p className="text-2xl font-bold">{averageRank}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improved</p>
                <p className="text-2xl font-bold text-green-600">+{totalImprovement}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-bold text-red-600">-{totalDecline}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Performance</CardTitle>
              <CardDescription>Your keyword rankings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ranking chart visualization would appear here</p>
                  <p className="text-sm">Showing rank changes over the last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4">Keyword</th>
                      <th className="text-left p-4">Current Rank</th>
                      <th className="text-left p-4">Previous</th>
                      <th className="text-left p-4">Best Rank</th>
                      <th className="text-left p-4">Change</th>
                      <th className="text-left p-4">Volume</th>
                      <th className="text-left p-4">URL</th>
                      <th className="text-left p-4">Location</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((item, index) => {
                      const changeData = getRankChange(item.change);
                      return (
                        <tr key={index} className="border-b hover:bg-muted/30">
                          <td className="p-4">
                            <span className="font-medium">{item.keyword}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={`${getRankColor(item.currentRank)} border-0`}>
                              #{item.currentRank}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-muted-foreground">#{item.previousRank}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-green-600">#{item.bestRank}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {changeData.icon}
                              <span className={changeData.color}>
                                {changeData.prefix}{Math.abs(item.change)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-muted-foreground">{item.volume.toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">{item.url}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">{item.location}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking by Location</CardTitle>
              <CardDescription>How your keywords perform in different locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['United States', 'India', 'United Kingdom', 'Canada'].map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50) + 10} keywords tracked
                      </span>
                      <Badge variant="outline">
                        Avg: #{Math.floor(Math.random() * 20) + 5}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Performance</CardTitle>
              <CardDescription>Ranking differences across desktop and mobile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Desktop Rankings</h3>
                  </div>
                  <div className="space-y-3">
                    {rankingData.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.keyword}</span>
                        <Badge className={getRankColor(item.currentRank)}>
                          #{item.currentRank}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Mobile Rankings</h3>
                  </div>
                  <div className="space-y-3">
                    {rankingData.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.keyword}</span>
                        <Badge className={getRankColor(item.currentRank + Math.floor(Math.random() * 5))}>
                          #{item.currentRank + Math.floor(Math.random() * 5)}
                        </Badge>
                      </div>
                    ))}
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