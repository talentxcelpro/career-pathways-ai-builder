import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  Settings, 
  Zap, 
  Clock,
  ArrowLeft,
  Target,
  TrendingUp,
  FileText,
  Image,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  affectedPages: Array<{
    url: string;
    title: string;
    issue: string;
    priority: number;
  }>;
  fixInstructions: string[];
  automatedFix?: boolean;
  estimatedTime: string;
}

interface SEOIssueDetailProps {
  issue: SEOIssue | null;
  onBack: () => void;
  onMarkResolved: (issueId: string) => void;
}

export const SEOIssueDetail: React.FC<SEOIssueDetailProps> = ({
  issue,
  onBack,
  onMarkResolved
}) => {
  const [fixingPages, setFixingPages] = useState<string[]>([]);
  const [resolvedPages, setResolvedPages] = useState<string[]>([]);

  if (!issue) {
    return null;
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleAutomatedFix = async () => {
    if (!issue.automatedFix) return;
    
    setFixingPages(issue.affectedPages.map(p => p.url));
    toast.info('Starting automated fix...');
    
    // Simulate automated fix process
    for (let i = 0; i < issue.affectedPages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResolvedPages(prev => [...prev, issue.affectedPages[i].url]);
      setFixingPages(prev => prev.filter(url => url !== issue.affectedPages[i].url));
    }
    
    toast.success('Automated fix completed!');
    setTimeout(() => onMarkResolved(issue.id), 1000);
  };

  const handleManualFix = (pageUrl: string) => {
    setResolvedPages(prev => [...prev, pageUrl]);
    toast.success('Page marked as fixed');
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'content': return FileText;
      case 'technical': return Settings;
      case 'mobile': return Smartphone;
      case 'images': return Image;
      default: return Target;
    }
  };

  const CategoryIcon = getCategoryIcon(issue.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{issue.title}</h2>
          </div>
          <p className="text-muted-foreground mt-1">{issue.description}</p>
        </div>
      </div>

      {/* Issue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Issue Summary</span>
            <div className="flex items-center gap-2">
              <Badge className={getImpactColor(issue.impact)}>
                {issue.impact.toUpperCase()} IMPACT
              </Badge>
              <Badge variant="outline">
                {issue.affectedPages.length} pages affected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fix Difficulty</div>
              <div className={`font-semibold ${getDifficultyColor(issue.difficulty)}`}>
                {issue.difficulty.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Estimated Time</div>
              <div className="font-semibold flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {issue.estimatedTime}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Category</div>
              <div className="font-semibold">{issue.category}</div>
            </div>
          </div>

          {issue.automatedFix && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Automated Fix Available</span>
                </div>
                <Button 
                  onClick={handleAutomatedFix}
                  disabled={fixingPages.length > 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {fixingPages.length > 0 ? 'Fixing...' : 'Fix All Pages'}
                </Button>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                This issue can be automatically resolved across all affected pages.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages">Affected Pages</TabsTrigger>
          <TabsTrigger value="instructions">Fix Instructions</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Affected Pages ({issue.affectedPages.length})</CardTitle>
              <CardDescription>
                Pages that need attention for this SEO issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {issue.affectedPages.map((page, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      resolvedPages.includes(page.url) 
                        ? 'bg-green-50 border-green-200' 
                        : fixingPages.includes(page.url)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{page.title}</h4>
                          {resolvedPages.includes(page.url) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {fixingPages.includes(page.url) && (
                            <div className="animate-spin">
                              <Settings className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {page.url}
                        </div>
                        <div className="text-sm text-orange-600 mt-1">
                          Issue: {page.issue}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Priority {page.priority}
                        </Badge>
                        {!resolvedPages.includes(page.url) && !fixingPages.includes(page.url) && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(page.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleManualFix(page.url)}
                            >
                              Mark Fixed
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>How to Fix This Issue</CardTitle>
              <CardDescription>
                Step-by-step instructions to resolve this SEO issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.fixInstructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm">{instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>
                How this issue affects your SEO performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Current Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">SEO Score Impact</span>
                        <span className="text-sm font-medium text-red-600">-{issue.impact === 'high' ? '15' : issue.impact === 'medium' ? '8' : '3'} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Affected Pages</span>
                        <span className="text-sm font-medium">{issue.affectedPages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Potential Traffic Loss</span>
                        <span className="text-sm font-medium text-red-600">{issue.impact === 'high' ? '25-40%' : issue.impact === 'medium' ? '10-25%' : '5-10%'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">After Fix Benefits</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">SEO Score Improvement</span>
                        <span className="text-sm font-medium text-green-600">+{issue.impact === 'high' ? '15' : issue.impact === 'medium' ? '8' : '3'} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Ranking Improvement</span>
                        <span className="text-sm font-medium text-green-600">{issue.impact === 'high' ? '5-10 positions' : issue.impact === 'medium' ? '2-5 positions' : '1-2 positions'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Traffic Increase</span>
                        <span className="text-sm font-medium text-green-600">{issue.impact === 'high' ? '20-35%' : issue.impact === 'medium' ? '10-20%' : '5-10%'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">Estimated ROI</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fixing this issue is estimated to provide a {issue.impact === 'high' ? 'high' : issue.impact === 'medium' ? 'medium' : 'low'} return on investment 
                    within {issue.impact === 'high' ? '2-4 weeks' : issue.impact === 'medium' ? '4-8 weeks' : '8-12 weeks'}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Summary */}
      {(resolvedPages.length > 0 || fixingPages.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {resolvedPages.length} of {issue.affectedPages.length} pages fixed
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((resolvedPages.length / issue.affectedPages.length) * 100)}%
                </span>
              </div>
              <Progress value={(resolvedPages.length / issue.affectedPages.length) * 100} />
              
              {resolvedPages.length === issue.affectedPages.length && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Issue Resolved!</span>
                  </div>
                  <Button 
                    onClick={() => onMarkResolved(issue.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Complete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};