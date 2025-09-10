import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Phone,
  Building,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocalSEOData {
  businessName: string;
  location: string;
  localRankings: Array<{
    keyword: string;
    localPosition: number;
    organicPosition: number;
    localSearchVolume: number;
    city: string;
  }>;
  googleMyBusiness: {
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    photos: number;
    posts: number;
    lastUpdate: string;
  };
  localCitations: Array<{
    source: string;
    status: 'consistent' | 'inconsistent' | 'missing';
    url: string;
    authority: number;
  }>;
  localCompetitors: Array<{
    name: string;
    rating: number;
    reviewCount: number;
    averagePosition: number;
    distance: string;
  }>;
  nap: {
    name: string;
    address: string;
    phone: string;
    consistency: number;
  };
  localSchema: {
    hasSchema: boolean;
    type: string;
    completeness: number;
  };
}

export const LocalSEOTracker = () => {
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localData, setLocalData] = useState<LocalSEOData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalysis = async () => {
    if (!domain.trim() || !location.trim() || !businessName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('local-seo-analyzer', {
        body: {
          domain: domain.trim(),
          location: location.trim(),
          businessName: businessName.trim()
        }
      });

      if (error) throw error;

      setLocalData(data);
      toast.success('Local SEO analysis completed successfully');
    } catch (error) {
      console.error('Local SEO analysis failed:', error);
      toast.error('Failed to analyze local SEO. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCitationStatusColor = (status: string) => {
    switch (status) {
      case 'consistent': return 'bg-green-500 text-white';
      case 'inconsistent': return 'bg-yellow-500 text-white';
      default: return 'bg-red-500 text-white';
    }
  };

  const getRankingColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-50';
    if (position <= 10) return 'text-blue-600 bg-blue-50';
    if (position <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Local SEO Intelligence
          </CardTitle>
          <CardDescription>
            Comprehensive local search optimization analysis and competitor tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Name</label>
              <Input
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="City, State (e.g., New York, NY)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Website Domain</label>
              <Input
                placeholder="yourbusiness.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={handleAnalysis} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
            {isAnalyzing ? 'Analyzing Local SEO...' : 'Start Local SEO Analysis'}
          </Button>
        </CardContent>
      </Card>

      {localData && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">GMB Rating</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{localData.googleMyBusiness.rating.toFixed(1)}</span>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                    <p className="text-2xl font-bold">{localData.googleMyBusiness.reviewCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">NAP Consistency</p>
                    <p className="text-2xl font-bold">{localData.nap.consistency}%</p>
                  </div>
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <Progress value={localData.nap.consistency} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Local Keywords</p>
                    <p className="text-2xl font-bold">{localData.localRankings.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="gmb">Google My Business</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information (NAP)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span className="text-sm">Name</span>
                      </div>
                      <span className="font-medium">{localData.nap.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Address</span>
                      </div>
                      <span className="font-medium text-sm">{localData.nap.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">Phone</span>
                      </div>
                      <span className="font-medium">{localData.nap.phone}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Consistency Score</span>
                        <div className="flex items-center gap-2">
                          <Progress value={localData.nap.consistency} className="w-20 h-2" />
                          <span className="font-semibold">{localData.nap.consistency}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Local Schema Markup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Schema Present</span>
                      <Badge variant={localData.localSchema.hasSchema ? "default" : "destructive"}>
                        {localData.localSchema.hasSchema ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Schema Type</span>
                      <span className="font-medium">{localData.localSchema.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completeness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={localData.localSchema.completeness} className="w-20 h-2" />
                        <span className="font-semibold">{localData.localSchema.completeness}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rankings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Local Keyword Rankings</CardTitle>
                  <CardDescription>Your local search positions vs organic rankings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {localData.localRankings.map((ranking, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{ranking.keyword}</div>
                          <div className="text-sm text-muted-foreground">
                            {ranking.city} • {ranking.localSearchVolume} monthly searches
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Badge className={getRankingColor(ranking.localPosition)}>
                              #{ranking.localPosition}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Local</div>
                          </div>
                          <div className="text-center">
                            <Badge className={getRankingColor(ranking.organicPosition)}>
                              #{ranking.organicPosition}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Organic</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-semibold ${ranking.localPosition < ranking.organicPosition ? 'text-green-600' : 'text-red-600'}`}>
                              {ranking.localPosition < ranking.organicPosition ? '↑' : '↓'}
                              {Math.abs(ranking.localPosition - ranking.organicPosition)}
                            </div>
                            <div className="text-xs text-muted-foreground">Diff</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gmb" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Google My Business Analysis</CardTitle>
                  <CardDescription>Your GMB profile optimization status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Verification Status</span>
                        <Badge variant={localData.googleMyBusiness.isVerified ? "default" : "destructive"}>
                          {localData.googleMyBusiness.isVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{localData.googleMyBusiness.rating.toFixed(1)}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Reviews</span>
                        <span className="font-semibold">{localData.googleMyBusiness.reviewCount}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Photos</span>
                        <span className="font-semibold">{localData.googleMyBusiness.photos}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Posts</span>
                        <span className="font-semibold">{localData.googleMyBusiness.posts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Updated</span>
                        <span className="font-semibold">{localData.googleMyBusiness.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="citations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Local Citations Analysis</CardTitle>
                  <CardDescription>Directory listings and citation consistency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {localData.localCitations.map((citation, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-semibold">{citation.source}</div>
                            <div className="text-sm text-muted-foreground">
                              Authority: {citation.authority}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getCitationStatusColor(citation.status)}>
                            {citation.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Local Competitors</CardTitle>
                  <CardDescription>Nearby businesses in your category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {localData.localCompetitors.map((competitor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-semibold">{competitor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {competitor.distance} away
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{competitor.rating.toFixed(1)}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {competitor.reviewCount} reviews
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">#{competitor.averagePosition}</div>
                            <div className="text-xs text-muted-foreground">Avg Position</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};