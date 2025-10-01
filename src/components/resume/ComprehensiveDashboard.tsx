import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  FileText,
  BarChart3,
  Lightbulb,
  Download
} from 'lucide-react';
import { useComprehensiveATS } from '@/hooks/useComprehensiveATS';
import { useSmartEnhancement } from '@/hooks/useSmartEnhancement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ComprehensiveDashboardProps {
  resumeData: any;
  onEnhance: (section: string, content: string) => void;
  onOptimize: (optimizedData: any) => void;
}

export const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({
  resumeData,
  onEnhance,
  onOptimize
}) => {
  const { analyzeResume, analysis, isAnalyzing, getSectionScore, getCriticalIssues } = useComprehensiveATS();
  const { getSmartSuggestions, isGeneratingSuggestions } = useSmartEnhancement();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (resumeData) {
      analyzeResume(resumeData);
    }
  }, [resumeData, analyzeResume]);

  useEffect(() => {
    if (resumeData) {
      getSmartSuggestions(resumeData).then(setSuggestions);
    }
  }, [resumeData, getSmartSuggestions]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Performing comprehensive analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const criticalIssues = getCriticalIssues();

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">ATS Compatibility Score</CardTitle>
              <CardDescription>Comprehensive resume analysis</CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <p className="text-sm text-muted-foreground mt-1">out of 100</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={analysis.overallScore} className="h-3" />
          
          {/* Critical Issues Alert */}
          {criticalIssues.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">{criticalIssues.length} critical issue{criticalIssues.length > 1 ? 's' : ''} found:</span>
                <ul className="mt-2 space-y-1">
                  {criticalIssues.slice(0, 3).map((issue, idx) => (
                    <li key={idx} className="text-sm">• {issue.action}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sections Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Section Scores</CardTitle>
          <CardDescription>Individual section performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.sections).map(([section, data]) => (
              <Card key={section} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{section}</CardTitle>
                    <Badge variant={getScoreBadge(data.score) as any}>
                      {data.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={data.score} className="h-2 mb-3" />
                  {data.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Issues:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {data.issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Detailed View */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Actionable Steps
              </CardTitle>
              <CardDescription>Prioritized improvements for your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.actionableSteps.slice(0, 10).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge 
                      variant={step.priority === 'critical' ? 'destructive' : step.priority === 'high' ? 'warning' : 'secondary'}
                      className="mt-1"
                    >
                      {step.priority}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{step.action}</p>
                      <p className="text-xs text-muted-foreground">{step.impact}</p>
                      <Badge variant="outline" className="text-xs">
                        {step.section}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Keyword Analysis
              </CardTitle>
              <CardDescription>
                Keyword density: {analysis.keywords.density.toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Matched Keywords ({analysis.keywords.matched.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.matched.map((keyword, idx) => (
                    <Badge key={idx} variant="success">{keyword}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <h4 className="font-semibold text-sm">Missing Keywords ({analysis.keywords.missing.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((keyword, idx) => (
                    <Badge key={idx} variant="destructive">{keyword}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {analysis.keywords.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Smart Suggestions
                  </CardTitle>
                  <CardDescription>
                    {suggestions.length} AI-powered improvement recommendations
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => getSmartSuggestions(resumeData).then(setSuggestions)}
                  disabled={isGeneratingSuggestions}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-2">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={suggestion.priority === 'critical' ? 'destructive' : suggestion.priority === 'high' ? 'warning' : 'secondary'}>
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline">{suggestion.type}</Badge>
                          </div>
                          <p className="text-sm font-medium">{suggestion.reason}</p>
                          <div className="bg-accent/50 p-3 rounded-lg space-y-1">
                            <p className="text-xs text-muted-foreground">Current:</p>
                            <p className="text-sm">{suggestion.current}</p>
                            <p className="text-xs text-muted-foreground mt-2">Suggested:</p>
                            <p className="text-sm font-medium">{suggestion.suggested}</p>
                          </div>
                          <p className="text-xs text-muted-foreground italic">{suggestion.impact}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onEnhance(suggestion.section, suggestion.suggested)}
                          disabled={!suggestion.actionable}
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Competitive Analysis
              </CardTitle>
              <CardDescription>Compare against industry standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analysis.competitiveAnalysis.ranking}
                </div>
                <p className="text-sm text-muted-foreground">
                  Your resume ranks in the <span className="font-semibold">{analysis.competitiveAnalysis.ranking}</span> percentile
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry average: {analysis.competitiveAnalysis.industryStandard}/100
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Key Improvement Areas</h4>
                <ul className="space-y-2">
                  {analysis.competitiveAnalysis.improvementAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
