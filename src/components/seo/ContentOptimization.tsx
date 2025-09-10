import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, FileText, Image, Link, Zap, BarChart3, Globe } from 'lucide-react';
import { useSEOAudit } from '@/hooks/useSEOAudit';
import { getPerformanceScore } from '@/utils/performanceOptimizer';

interface ContentOptimizationProps {
  onOptimize?: () => void;
}

export const ContentOptimization: React.FC<ContentOptimizationProps> = ({ onOptimize }) => {
  const { auditResult } = useSEOAudit();
  const [optimizationScore, setOptimizationScore] = React.useState(75);
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const optimizeContent = async () => {
    setIsOptimizing(true);
    try {
      // Simulate content optimization
      await new Promise(resolve => setTimeout(resolve, 3000));
      setOptimizationScore(90);
      onOptimize?.();
    } catch (error) {
      console.error('Content optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const contentMetrics = [
    {
      title: 'Meta Descriptions',
      current: 77,
      target: 100,
      icon: FileText,
      status: 'good',
      description: '23 pages missing descriptions'
    },
    {
      title: 'Title Tags',
      current: 85,
      target: 100,
      icon: Search,
      status: 'warning',
      description: '5 duplicate titles found'
    },
    {
      title: 'Image Alt Text',
      current: 65,
      target: 100,
      icon: Image,
      status: 'poor',
      description: '45 images missing alt text'
    },
    {
      title: 'Internal Links',
      current: 82,
      target: 90,
      icon: Link,
      status: 'good',
      description: 'Good internal linking structure'
    }
  ];

  const optimizationSuggestions = [
    {
      priority: 'High',
      title: 'Add Alt Text to Images',
      description: 'Add descriptive alt text to 45 images across 12 pages',
      impact: 'Improves accessibility and SEO rankings',
      effort: 'Medium'
    },
    {
      priority: 'High',
      title: 'Fix Meta Descriptions',
      description: 'Create unique meta descriptions for 23 pages',
      impact: 'Better click-through rates from search results',
      effort: 'High'
    },
    {
      priority: 'Medium',
      title: 'Resolve Duplicate Titles',
      description: 'Make title tags unique across 5 pages',
      impact: 'Prevents keyword cannibalization',
      effort: 'Medium'
    },
    {
      priority: 'Low',
      title: 'Enhance Internal Linking',
      description: 'Add contextual internal links between related content',
      impact: 'Improves page authority distribution',
      effort: 'Low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Optimization</h2>
          <p className="text-muted-foreground">Improve your content for better SEO performance</p>
        </div>
        <Button onClick={optimizeContent} disabled={isOptimizing}>
          {isOptimizing ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Auto-Optimize
            </>
          )}
        </Button>
      </div>

      {/* Optimization Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Content Optimization Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{optimizationScore}/100</span>
            <Badge variant={optimizationScore >= 80 ? "default" : optimizationScore >= 60 ? "secondary" : "destructive"}>
              {optimizationScore >= 80 ? "Good" : optimizationScore >= 60 ? "Needs Work" : "Poor"}
            </Badge>
          </div>
          <Progress value={optimizationScore} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Based on meta tags, content quality, and SEO best practices
          </p>
        </CardContent>
      </Card>

      {/* Content Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {Math.round((metric.current / metric.target) * 100)}%
                  </Badge>
                </div>
                <h3 className="font-medium text-sm">{metric.title}</h3>
                <Progress value={(metric.current / metric.target) * 100} className="mt-2 mb-1" />
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <h4 className="font-medium">{suggestion.title}</h4>
                  </div>
                  <Badge variant="outline">{suggestion.effort}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                <p className="text-sm font-medium text-green-600">{suggestion.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Analysis Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Primary Keywords</span>
              <Badge variant="secondary">8/10</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Long-tail Keywords</span>
              <Badge variant="secondary">12/15</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Keyword Density</span>
              <Badge variant="default">Optimal</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Analyze Keywords
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Readability Score</span>
              <Badge variant="default">Good</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Content Length</span>
              <Badge variant="secondary">1,240 words</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uniqueness</span>
              <Badge variant="default">98%</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Content Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};