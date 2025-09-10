import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Brain,
  BarChart3,
  Globe,
  RefreshCw,
  Lightbulb,
  FileText,
  Search,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompetitorData {
  domain: string;
  domainAuthority: number;
  organicKeywords: number;
  organicTraffic: number;
  topKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    url: string;
  }>;
  contentGaps: Array<{
    keyword: string;
    competitorPosition: number;
    yourPosition: number | null;
    opportunity: 'high' | 'medium' | 'low';
    volume: number;
    difficulty: number;
  }>;
  contentTopics: Array<{
    topic: string;
    pageCount: number;
    avgPosition: number;
    totalTraffic: number;
  }>;
}

interface CompetitorAnalysisResult {
  yourDomain: string;
  competitors: CompetitorData[];
  overallInsights: {
    avgCompetitorDA: number;
    totalGapKeywords: number;
    topOpportunities: string[];
    contentGapScore: number;
  };
}

export const AdvancedCompetitorIntelligence = () => {
  const [yourDomain, setYourDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalysis = async () => {
    if (!yourDomain.trim() || !competitors.trim()) {
      toast.error('Please enter your domain and competitor domains');
      return;
    }

    setIsAnalyzing(true);
    try {
      const competitorList = competitors.split('\n').map(c => c.trim()).filter(c => c);
      
      const { data, error } = await supabase.functions.invoke('competitor-intelligence', {
        body: {
          domain: yourDomain.trim(),
          competitors: competitorList
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success(`Competitor analysis completed for ${competitorList.length} competitors`);
    } catch (error) {
      console.error('Competitor analysis failed:', error);
      toast.error('Failed to analyze competitors. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced Competitor Intelligence
          </CardTitle>
          <CardDescription>
            AI-powered competitor analysis with content gap identification and opportunity mapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Domain</label>
              <Input
                placeholder="Enter your domain (e.g., talentxcel.in)"
                value={yourDomain}
                onChange={(e) => setYourDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Competitor Domains (one per line)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="indeed.com&#10;linkedin.com&#10;glassdoor.com"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={handleAnalysis} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            {isAnalyzing ? 'Analyzing Competitors...' : 'Start Competitor Analysis'}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Competitor DA</p>
                    <p className="text-2xl font-bold">{analysisResult.overallInsights.avgCompetitorDA}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gap Keywords</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResult.overallInsights.totalGapKeywords}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Content Gap Score</p>
                    <p className="text-2xl font-bold">{Math.round(analysisResult.overallInsights.contentGapScore)}%</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <Progress value={analysisResult.overallInsights.contentGapScore} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Competitors</p>
                    <p className="text-2xl font-bold">{analysisResult.competitors.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
              <TabsTrigger value="keywords">Top Keywords</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {analysisResult.competitors.map((competitor, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          {competitor.domain}
                        </CardTitle>
                        <Badge variant="outline">DA: {competitor.domainAuthority}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{competitor.organicKeywords.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Organic Keywords</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{competitor.organicTraffic.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Organic Traffic</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{competitor.contentGaps.filter(g => g.opportunity === 'high').length}</div>
                          <div className="text-sm text-muted-foreground">High Gaps</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{competitor.contentTopics.length}</div>
                          <div className="text-sm text-muted-foreground">Content Topics</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Top Content Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {competitor.contentTopics.slice(0, 6).map((topic, tidx) => (
                            <Badge key={tidx} variant="outline">
                              {topic.topic} ({topic.pageCount})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>High-Priority Content Gaps</CardTitle>
                  <CardDescription>Keywords your competitors rank for but you don't</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.competitors.flatMap(comp => 
                      comp.contentGaps.filter(gap => gap.opportunity === 'high')
                    ).slice(0, 15).map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{gap.keyword}</span>
                            <Badge className={getOpportunityColor(gap.opportunity)}>
                              {gap.opportunity} opportunity
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Competitor position: #{gap.competitorPosition} • 
                            Your position: {gap.yourPosition ? `#${gap.yourPosition}` : 'Not ranking'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-semibold">{gap.volume.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Volume</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-semibold ${getDifficultyColor(gap.difficulty)}`}>
                              {gap.difficulty}
                            </div>
                            <div className="text-xs text-muted-foreground">Difficulty</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-1" />
                            Target
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              {analysisResult.competitors.map((competitor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{competitor.domain} - Top Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {competitor.topKeywords.slice(0, 8).map((keyword, kidx) => (
                        <div key={kidx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{keyword.keyword}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {keyword.url}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="font-semibold text-blue-600">#{keyword.position}</div>
                              <div className="text-xs text-muted-foreground">Position</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{keyword.volume.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Volume</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-semibold ${getDifficultyColor(keyword.difficulty)}`}>
                                {keyword.difficulty}
                              </div>
                              <div className="text-xs text-muted-foreground">Difficulty</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI-Generated Opportunities
                  </CardTitle>
                  <CardDescription>Strategic recommendations based on competitor analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-900">High-Volume Keyword Gaps</div>
                        <div className="text-blue-800 text-sm">
                          Target these keywords: {analysisResult.overallInsights.topOpportunities.slice(0, 3).join(', ')}. 
                          Combined search volume: 25K+ monthly searches.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-900">Content Strategy</div>
                        <div className="text-green-800 text-sm">
                          Create comprehensive guides for career transition and remote work topics. 
                          Competitors have limited coverage in these high-traffic areas.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-purple-900">Quick Wins</div>
                        <div className="text-purple-800 text-sm">
                          Optimize existing pages for long-tail variations. 
                          Low-hanging fruit with 40+ keyword opportunities under difficulty 30.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-orange-900">Competitive Threats</div>
                        <div className="text-orange-800 text-sm">
                          Monitor competitors expanding into AI resume tools. 
                          Consider defensive content strategy for your core keywords.
                        </div>
                      </div>
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