import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Award, Search, Plus, Eye, BarChart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface SnippetTarget {
  id: string;
  keyword: string;
  query: string;
  snippetType: 'paragraph' | 'list' | 'table' | 'video';
  currentRank?: number;
  targetRank: number;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume?: number;
  competition?: number;
}

interface FeaturedSnippetsTargetingProps {
  pageTitle: string;
  pageType: string;
}

export const FeaturedSnippetsTargeting: React.FC<FeaturedSnippetsTargetingProps> = ({
  pageTitle,
  pageType
}) => {
  const [targets, setTargets] = useState<SnippetTarget[]>([]);
  const [newTarget, setNewTarget] = useState({
    keyword: '',
    query: '',
    snippetType: 'paragraph' as const,
    content: '',
    targetRank: 1
  });
  const [analytics, setAnalytics] = useState({
    totalTargets: 0,
    positionZero: 0,
    topThree: 0,
    avgPosition: 0
  });

  useEffect(() => {
    // Initialize with sample targets based on page type
    const sampleTargets: SnippetTarget[] = [
      {
        id: '1',
        keyword: `${pageTitle} requirements`,
        query: `What are the requirements for ${pageTitle}?`,
        snippetType: 'list',
        currentRank: 3,
        targetRank: 1,
        content: 'To qualify for this position, candidates typically need: 1) Bachelor\'s degree in relevant field, 2) 2+ years experience, 3) Strong communication skills',
        difficulty: 'medium',
        searchVolume: 1200,
        competition: 0.7
      },
      {
        id: '2',
        keyword: `${pageTitle} salary`,
        query: `How much does ${pageTitle} pay?`,
        snippetType: 'paragraph',
        currentRank: 5,
        targetRank: 1,
        content: `The average salary for ${pageTitle} ranges from $50,000 to $80,000 annually, depending on experience level, location, and company size.`,
        difficulty: 'hard',
        searchVolume: 2500,
        competition: 0.9
      }
    ];

    setTargets(sampleTargets);
    updateAnalytics(sampleTargets);
  }, [pageTitle]);

  const updateAnalytics = (targetList: SnippetTarget[]) => {
    const total = targetList.length;
    const positionZero = targetList.filter(t => t.currentRank === 1).length;
    const topThree = targetList.filter(t => t.currentRank && t.currentRank <= 3).length;
    const avgPosition = targetList.reduce((acc, t) => acc + (t.currentRank || 10), 0) / total;

    setAnalytics({
      totalTargets: total,
      positionZero,
      topThree,
      avgPosition: Math.round(avgPosition * 10) / 10
    });
  };

  const addTarget = () => {
    if (!newTarget.keyword || !newTarget.query || !newTarget.content) return;

    const target: SnippetTarget = {
      id: Date.now().toString(),
      keyword: newTarget.keyword,
      query: newTarget.query,
      snippetType: newTarget.snippetType,
      targetRank: newTarget.targetRank,
      content: newTarget.content,
      difficulty: 'medium',
      searchVolume: Math.floor(Math.random() * 3000) + 500,
      competition: Math.random()
    };

    const updatedTargets = [...targets, target];
    setTargets(updatedTargets);
    updateAnalytics(updatedTargets);
    setNewTarget({
      keyword: '',
      query: '',
      snippetType: 'paragraph',
      content: '',
      targetRank: 1
    });
  };

  const getSnippetTypeIcon = (type: string) => {
    switch (type) {
      case 'paragraph': return '📝';
      case 'list': return '📋';
      case 'table': return '📊';
      case 'video': return '🎥';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateStructuredData = () => {
    return targets.map(target => {
      if (target.snippetType === 'list') {
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": target.query,
          "step": target.content.split(/\d+\)/).filter(Boolean).map((step, index) => ({
            "@type": "HowToStep",
            "name": `Step ${index + 1}`,
            "text": step.trim()
          }))
        };
      } else {
        return {
          "@context": "https://schema.org",
          "@type": "Question",
          "name": target.query,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": target.content
          }
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        {generateStructuredData().map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Featured Snippets Targeting
          </CardTitle>
          <CardDescription>
            Optimize content to capture position zero in search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Targets</p>
                    <p className="text-2xl font-bold">{analytics.totalTargets}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Position #0</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.positionZero}</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top 3</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.topThree}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Position</p>
                    <p className="text-2xl font-bold">{analytics.avgPosition}</p>
                  </div>
                  <BarChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Targets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Featured Snippet Targets</h3>
            <div className="space-y-3">
              {targets.map(target => (
                <Card key={target.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSnippetTypeIcon(target.snippetType)}</span>
                        <Badge className={getDifficultyColor(target.difficulty)}>
                          {target.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {target.snippetType}
                        </Badge>
                        {target.currentRank === 1 && (
                          <Badge className="bg-green-100 text-green-800">
                            Position #0
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Volume: {target.searchVolume?.toLocaleString()}</div>
                        <div>Competition: {((target.competition || 0) * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground">Target Query</div>
                        <div className="text-sm">{target.query}</div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-muted-foreground">Optimized Content</div>
                        <div className="text-sm p-3 bg-muted/50 rounded-lg">{target.content}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Current: #{target.currentRank || 'N/A'}</span>
                          <span className="text-sm text-muted-foreground">→</span>
                          <span className="text-sm font-semibold">Target: #{target.targetRank}</span>
                        </div>
                        {target.currentRank && target.currentRank > target.targetRank && (
                          <Progress 
                            value={((target.currentRank - target.targetRank) / target.currentRank) * 100} 
                            className="w-24 h-2"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Add New Target */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Featured Snippet Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Target keyword"
                  value={newTarget.keyword}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, keyword: e.target.value }))}
                />
                <Input
                  placeholder="Search query"
                  value={newTarget.query}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={newTarget.snippetType}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, snippetType: e.target.value as any }))}
                >
                  <option value="paragraph">Paragraph Snippet</option>
                  <option value="list">List Snippet</option>
                  <option value="table">Table Snippet</option>
                  <option value="video">Video Snippet</option>
                </select>
                <Input
                  type="number"
                  placeholder="Target rank (1 for position #0)"
                  value={newTarget.targetRank}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, targetRank: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>

              <Textarea
                placeholder="Optimized content for featured snippet (keep concise, use clear formatting)"
                value={newTarget.content}
                onChange={(e) => setNewTarget(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />

              <Button 
                onClick={addTarget} 
                disabled={!newTarget.keyword || !newTarget.query || !newTarget.content}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Target
              </Button>
            </CardContent>
          </Card>

          {/* Optimization Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Snippet Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Paragraph Snippets:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Keep answers to 40-60 words</li>
                    <li>• Start with the direct answer</li>
                    <li>• Use clear, concise language</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">List Snippets:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use numbered or bulleted lists</li>
                    <li>• Keep each item concise</li>
                    <li>• Include 3-8 items typically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};