import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Search,
  Globe,
  Smartphone
} from 'lucide-react';

interface SEOMetrics {
  overallScore: number;
  titleScore: number;
  metaScore: number;
  headingScore: number;
  contentScore: number;
  technicalScore: number;
  mobileFriendly: boolean;
  loadSpeed: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

export const RealTimeSEOAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);

  const analyzeURL = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    // Simulate real-time analysis
    setTimeout(() => {
      setMetrics({
        overallScore: 78,
        titleScore: 85,
        metaScore: 72,
        headingScore: 90,
        contentScore: 75,
        technicalScore: 68,
        mobileFriendly: true,
        loadSpeed: 2.3,
        issues: [
          {
            type: 'error',
            category: 'Technical',
            message: 'Missing alt text on 3 images',
            impact: 'medium'
          },
          {
            type: 'warning', 
            category: 'Content',
            message: 'Meta description too short (142 characters)',
            impact: 'low'
          },
          {
            type: 'error',
            category: 'Technical',
            message: 'Page has no H1 tag',
            impact: 'high'
          }
        ],
        opportunities: [
          {
            title: 'Optimize Images',
            description: 'Compress images to improve load speed by 0.8s',
            priority: 'high',
            impact: '+12 score points'
          },
          {
            title: 'Add Internal Links',
            description: 'Add 3-5 relevant internal links to boost page authority',
            priority: 'medium',
            impact: '+8 score points'
          },
          {
            title: 'Improve Content Length',
            description: 'Expand content to at least 1,200 words for better ranking',
            priority: 'medium',
            impact: '+6 score points'
          }
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Real-Time SEO Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL to analyze (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={analyzeURL} disabled={!url || isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Analyzing page...</div>
              <Progress value={66} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Checking technical SEO, content quality, and performance metrics
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Overall SEO Score</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Title Optimization</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.titleScore} className="w-16" />
                    <span className="text-sm font-medium">{metrics.titleScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meta Description</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.metaScore} className="w-16" />
                    <span className="text-sm font-medium">{metrics.metaScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heading Structure</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.headingScore} className="w-16" />
                    <span className="text-sm font-medium">{metrics.headingScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Quality</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.contentScore} className="w-16" />
                    <span className="text-sm font-medium">{metrics.contentScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Technical SEO</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.technicalScore} className="w-16" />
                    <span className="text-sm font-medium">{metrics.technicalScore}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mobile Friendly</span>
                  {metrics.mobileFriendly ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Load Speed</span>
                  <span className="text-sm font-medium">{metrics.loadSpeed}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues and Opportunities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Issues & Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="issues">Issues ({metrics.issues.length})</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities ({metrics.opportunities.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="issues" className="space-y-3">
                  {metrics.issues.map((issue, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {issue.type === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        ) : issue.type === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" size="sm">{issue.category}</Badge>
                            <Badge 
                              variant={issue.impact === 'high' ? 'destructive' : issue.impact === 'medium' ? 'default' : 'secondary'}
                              size="sm"
                            >
                              {issue.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="opportunities" className="space-y-3">
                  {metrics.opportunities.map((opportunity, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={opportunity.priority === 'high' ? 'default' : 'secondary'}
                              size="sm"
                            >
                              {opportunity.priority} priority
                            </Badge>
                            <Badge variant="outline" size="sm" className="text-green-600">
                              {opportunity.impact}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm">{opportunity.title}</h4>
                          <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};