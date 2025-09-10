import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Settings, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Link, 
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AutomationTask {
  priority: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  solution: string;
  impact: string;
  implementation: string;
}

interface AutomationResult {
  automationType: string;
  tasksCompleted: number;
  recommendations: AutomationTask[];
  technicalIssues?: any[];
  internalLinks?: any[];
  contentGaps?: any[];
  automationScore?: number;
  estimatedImpact?: string;
  implementationTime?: string;
}

export const SEOAutomationEngine: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AutomationResult | null>(null);
  const [formData, setFormData] = useState({
    automationType: 'technical_audit',
    url: '',
    industry: 'technology'
  });

  const automationTypes = [
    { value: 'technical_audit', label: 'Technical SEO Audit', icon: Settings },
    { value: 'internal_linking', label: 'Internal Linking Optimization', icon: Link },
    { value: 'meta_optimization', label: 'Meta Tag Optimization', icon: FileText },
    { value: 'content_gaps', label: 'Content Gap Analysis', icon: TrendingUp },
    { value: 'schema_markup', label: 'Schema Markup Generation', icon: CheckCircle2 }
  ];

  const handleRunAutomation = async () => {
    if (!formData.url) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('seo-automation-engine', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results);
        toast.success(`${formData.automationType.replace('_', ' ')} automation completed!`);
      } else {
        throw new Error(data.error || 'Automation failed');
      }
    } catch (error: any) {
      console.error('SEO automation error:', error);
      toast.error(`Failed to run automation: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            SEO Automation Engine
          </CardTitle>
          <CardDescription>
            Automated SEO analysis and optimization workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Automation Type</label>
              <Select
                value={formData.automationType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, automationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {automationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleRunAutomation} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Running Automation...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run SEO Automation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          {/* Results Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Automation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.tasksCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {results.automationScore || 85}
                  </div>
                  <div className="text-sm text-muted-foreground">Automation Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    {results.implementationTime || '1-2 weeks'}
                  </div>
                  <div className="text-sm text-muted-foreground">Implementation Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {results.estimatedImpact || 'High Impact'}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Impact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="technical">Technical Issues</TabsTrigger>
              <TabsTrigger value="content">Content Gaps</TabsTrigger>
              <TabsTrigger value="links">Internal Links</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{rec.category}</h4>
                          <Badge variant={getPriorityVariant(rec.priority) as any}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-red-600">Issue: </span>
                            <span>{rec.issue}</span>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Solution: </span>
                            <span>{rec.solution}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">Impact: </span>
                            <span>{rec.impact}</span>
                          </div>
                          <div>
                            <span className="font-medium text-purple-600">Implementation: </span>
                            <span>{rec.implementation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Technical Issues Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.technicalIssues && results.technicalIssues.length > 0 ? (
                    <div className="space-y-4">
                      {results.technicalIssues.map((issue, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{issue.type}</h4>
                            <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          <div className="bg-green-50 p-3 rounded">
                            <span className="font-medium">Fix: </span>
                            <span className="text-sm">{issue.fix}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No technical issues found or not applicable for this automation type.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Content Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.contentGaps && results.contentGaps.length > 0 ? (
                    <div className="space-y-4">
                      {results.contentGaps.map((gap, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{gap.keyword}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">Vol: {gap.volume}</Badge>
                              <Badge variant="outline">KD: {gap.difficulty}</Badge>
                            </div>
                          </div>
                          <p className="text-sm">{gap.recommendedAction}</p>
                          {gap.competitorCoverage && gap.competitorCoverage.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Covered by: {gap.competitorCoverage.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No content gaps found or not applicable for this automation type.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Internal Linking Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.internalLinks && results.internalLinks.length > 0 ? (
                    <div className="space-y-4">
                      {results.internalLinks.map((link, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Relevance Score</span>
                            <Badge variant="outline">{link.relevanceScore}/100</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">From: </span>
                              <span className="text-blue-600">{link.sourceUrl}</span>
                            </div>
                            <div>
                              <span className="font-medium">To: </span>
                              <span className="text-green-600">{link.targetUrl}</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <span className="font-medium">Anchor Text: </span>
                            <span className="italic">"{link.anchorText}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No internal linking opportunities found or not applicable for this automation type.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};