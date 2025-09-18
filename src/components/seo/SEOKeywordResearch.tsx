import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Brain, 
  Target, 
  Eye, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { KeywordSubcategories } from '@/components/seo/subcategories/KeywordSubcategories';
import { supabase } from '@/integrations/supabase/client';

export const SEOKeywordResearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const keywordData = [
    {
      keyword: 'ai resume builder',
      volume: 89000,
      difficulty: 45,
      cpc: 2.34,
      trend: 'up',
      opportunity: 'high',
      intent: 'commercial',
      relatedQuestions: ['How to build resume with AI?', 'Best AI resume builders', 'Free AI resume tools']
    },
    {
      keyword: 'job search platform',
      volume: 145000,
      difficulty: 62,
      cpc: 3.89,
      trend: 'up',
      opportunity: 'medium',
      intent: 'informational',
      relatedQuestions: ['Best job search websites', 'How to find jobs online', 'Job hunting platforms']
    },
    {
      keyword: 'career guidance online',
      volume: 34000,
      difficulty: 28,
      cpc: 1.87,
      trend: 'stable',
      opportunity: 'high',
      intent: 'informational',
      relatedQuestions: ['Free career counseling', 'Online career advice', 'Career coaching services']
    },
    {
      keyword: 'remote work opportunities',
      volume: 201000,
      difficulty: 55,
      cpc: 2.12,
      trend: 'up',
      opportunity: 'medium',
      intent: 'commercial',
      relatedQuestions: ['Remote jobs 2024', 'Work from home careers', 'Remote job sites']
    },
    {
      keyword: 'professional networking',
      volume: 67000,
      difficulty: 41,
      cpc: 2.78,
      trend: 'stable',
      opportunity: 'high',
      intent: 'informational',
      relatedQuestions: ['How to network professionally', 'LinkedIn networking tips', 'Business networking events']
    }
  ];

  const keywordClusters = [
    {
      name: 'AI Resume Tools',
      keywords: ['ai resume builder', 'resume ai generator', 'automated resume creation', 'smart resume maker'],
      totalVolume: 234000,
      avgDifficulty: 42
    },
    {
      name: 'Job Search',
      keywords: ['job search platform', 'job finder app', 'employment opportunities', 'career portal'],
      totalVolume: 456000,
      avgDifficulty: 58
    },
    {
      name: 'Career Development',
      keywords: ['career guidance', 'professional growth', 'skill development', 'career coaching'],
      totalVolume: 123000,
      avgDifficulty: 35
    }
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-content-optimizer', {
        body: { 
          content: `Research keywords for: ${searchTerm}`,
          targetKeywords: [searchTerm],
          contentType: 'keyword-research'
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`Found ${data.keywords?.length || keywordData.length} keyword opportunities for "${searchTerm}"`);
    } catch (error) {
      console.error('Keyword research error:', error);
      toast.success(`Found ${keywordData.length} keyword opportunities for "${searchTerm}" (demo data)`);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Subcategory Navigation */}
      <KeywordSubcategories />
      
      {/* Legacy Keyword Research - Moved to Detailed Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Keyword Research
          </CardTitle>
          <CardDescription>
            Discover high-value keywords with AI clustering and competitor analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter seed keyword or topic (e.g., resume builder, job search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Research Keywords
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedKeywords.length} keywords selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" disabled={selectedKeywords.length === 0}>
                Add to Campaign
              </Button>
            </div>
          </div>

          {/* Keywords Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4">Keyword</th>
                      <th className="text-left p-4">Volume</th>
                      <th className="text-left p-4">Difficulty</th>
                      <th className="text-left p-4">CPC</th>
                      <th className="text-left p-4">Trend</th>
                      <th className="text-left p-4">Opportunity</th>
                      <th className="text-left p-4">Intent</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordData.map((keyword, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedKeywords.includes(keyword.keyword)}
                              onChange={() => toggleKeywordSelection(keyword.keyword)}
                              className="rounded"
                            />
                            <span className="font-medium">{keyword.keyword}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">{keyword.volume.toLocaleString()}</span>
                          <span className="text-muted-foreground text-sm">/mo</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress value={keyword.difficulty} className="w-16 h-2" />
                            <span className={`font-semibold ${getDifficultyColor(keyword.difficulty)}`}>
                              {keyword.difficulty}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">${keyword.cpc}</span>
                        </td>
                        <td className="p-4">
                          {getTrendIcon(keyword.trend)}
                        </td>
                        <td className="p-4">
                          <Badge variant={keyword.opportunity === 'high' ? 'default' : 'secondary'}>
                            {keyword.opportunity}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{keyword.intent}</Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <div className="grid gap-4">
            {keywordClusters.map((cluster, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{cluster.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Volume: {cluster.totalVolume.toLocaleString()}</span>
                      <span>Avg Difficulty: {cluster.avgDifficulty}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cluster.keywords.map((keyword, kidx) => (
                      <Badge key={kidx} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>People Also Ask</CardTitle>
              <CardDescription>Related questions and search queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywordData.map((item, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold mb-2">{item.keyword}</h4>
                    <div className="space-y-1">
                      {item.relatedQuestions.map((question, qidx) => (
                        <div key={qidx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{question}</span>
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
              <CardTitle>Competitor Keyword Analysis</CardTitle>
              <CardDescription>Keywords your competitors rank for that you don't</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter competitor domains to analyze their keyword strategies</p>
                  <div className="flex gap-2 mt-4 max-w-md mx-auto">
                    <Input placeholder="competitor.com" />
                    <Button>Analyze</Button>
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