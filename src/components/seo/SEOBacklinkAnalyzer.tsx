import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link, 
  TrendingUp, 
  Shield, 
  Globe, 
  ExternalLink, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BacklinkSubcategories } from '@/components/seo/subcategories/BacklinkSubcategories';

interface BacklinkData {
  domain: string;
  domainAuthority: number;
  pageAuthority: number;
  totalBacklinks: number;
  referringDomains: number;
  organicKeywords: number;
  organicTraffic: number;
  spamScore: number;
  topBacklinks: Array<{
    sourceUrl: string;
    sourceDomain: string;
    anchor: string;
    linkType: 'dofollow' | 'nofollow';
    domainAuthority: number;
    spam: number;
  }>;
  competitorComparison: Array<{
    competitor: string;
    domainAuthority: number;
    backlinks: number;
    gap: number;
  }>;
}

export const SEOBacklinkAnalyzer = () => {
  const [domain, setDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backlinkData, setBacklinkData] = useState<BacklinkData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('backlink-checker', {
        body: { domain: domain.trim() }
      });

      if (error) throw error;

      setBacklinkData(data);
      toast.success('Backlink analysis completed successfully');
    } catch (error) {
      console.error('Backlink analysis failed:', error);
      toast.error('Failed to analyze backlinks. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSpamScoreColor = (score: number) => {
    if (score <= 10) return 'text-green-600 bg-green-50';
    if (score <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDAColor = (da: number) => {
    if (da >= 70) return 'text-green-600';
    if (da >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Subcategory Navigation */}
      <BacklinkSubcategories />
      
      {/* Legacy Backlink Analysis Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Advanced Backlink Intelligence
          </CardTitle>
          <CardDescription>
            Comprehensive backlink analysis with competitor comparison and link prospecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter domain to analyze (e.g., talentxcel.in)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Backlinks'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {backlinkData && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Domain Authority</p>
                    <p className={`text-2xl font-bold ${getDAColor(backlinkData.domainAuthority)}`}>
                      {backlinkData.domainAuthority}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <Progress value={backlinkData.domainAuthority} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Backlinks</p>
                    <p className="text-2xl font-bold">{backlinkData.totalBacklinks.toLocaleString()}</p>
                  </div>
                  <Link className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Referring Domains</p>
                    <p className="text-2xl font-bold">{backlinkData.referringDomains.toLocaleString()}</p>
                  </div>
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Spam Score</p>
                    <p className={`text-2xl font-bold`}>
                      <span className={getSpamScoreColor(backlinkData.spamScore)}>
                        {backlinkData.spamScore}%
                      </span>
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="backlinks">Top Backlinks</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Domain Authority</span>
                      <div className="flex items-center gap-2">
                        <Progress value={backlinkData.domainAuthority} className="w-20 h-2" />
                        <span className={`font-semibold ${getDAColor(backlinkData.domainAuthority)}`}>
                          {backlinkData.domainAuthority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Page Authority</span>
                      <div className="flex items-center gap-2">
                        <Progress value={backlinkData.pageAuthority} className="w-20 h-2" />
                        <span className={`font-semibold ${getDAColor(backlinkData.pageAuthority)}`}>
                          {backlinkData.pageAuthority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Spam Score</span>
                      <Badge className={getSpamScoreColor(backlinkData.spamScore)}>
                        {backlinkData.spamScore}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic & Keywords</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Organic Traffic</span>
                      <span className="font-semibold">{backlinkData.organicTraffic.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Organic Keywords</span>
                      <span className="font-semibold">{backlinkData.organicKeywords.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Backlinks</span>
                      <span className="font-semibold">{backlinkData.totalBacklinks.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="backlinks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Quality Backlinks</CardTitle>
                  <CardDescription>Highest authority links pointing to your domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backlinkData.topBacklinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{link.sourceDomain}</span>
                            <Badge variant={link.linkType === 'dofollow' ? 'default' : 'secondary'}>
                              {link.linkType}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Anchor: "{link.anchor}"
                          </div>
                          <div className="text-xs text-blue-600 truncate">
                            {link.sourceUrl}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`font-semibold ${getDAColor(link.domainAuthority)}`}>
                              {link.domainAuthority}
                            </div>
                            <div className="text-xs text-muted-foreground">DA</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-semibold ${getSpamScoreColor(link.spam).split(' ')[0]}`}>
                              {link.spam}%
                            </div>
                            <div className="text-xs text-muted-foreground">Spam</div>
                          </div>
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
                  <CardTitle>Competitor Backlink Comparison</CardTitle>
                  <CardDescription>How your backlink profile compares to competitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backlinkData.competitorComparison.map((competitor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-semibold">{competitor.competitor}</div>
                            <div className="text-sm text-muted-foreground">
                              DA: {competitor.domainAuthority}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-semibold">{competitor.backlinks.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Backlinks</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-semibold ${competitor.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {competitor.gap > 0 ? '+' : ''}{competitor.gap.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Gap</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Link Building Opportunities</CardTitle>
                  <CardDescription>Potential high-value backlink prospects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        AI-powered link prospecting will identify high-quality opportunities
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">• Competitor gap analysis</p>
                        <p className="text-sm text-muted-foreground">• Industry directory submissions</p>
                        <p className="text-sm text-muted-foreground">• Guest posting opportunities</p>
                        <p className="text-sm text-muted-foreground">• Broken link building prospects</p>
                      </div>
                      <Button className="mt-4">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Find Opportunities
                      </Button>
                    </div>
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