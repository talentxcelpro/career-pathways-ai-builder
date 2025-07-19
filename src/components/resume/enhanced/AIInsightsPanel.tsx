
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Eye,
  Brain,
  Award,
  RefreshCw
} from "lucide-react";

interface AIInsightsPanelProps {
  analysis: any;
  resumeData: any;
  onApplyImprovement: (improvement: any) => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  analysis,
  resumeData,
  onApplyImprovement,
  onReanalyze,
  isAnalyzing
}) => {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Analysis Available</h3>
          <p className="text-slate-500 mb-4">Run an AI analysis to get detailed insights about your resume.</p>
          <Button onClick={onReanalyze} disabled={isAnalyzing}>
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { overallScore, categories, strengths, criticalIssues, atsOptimization, contentSuggestions } = analysis;

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Resume Analysis</h2>
              <p className="text-slate-600">AI-powered insights and recommendations</p>
            </div>
            <Button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{overallScore}/100</div>
              <div className="text-sm text-slate-600">Overall Score</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{strengths?.length || 0}</div>
              <div className="text-sm text-slate-600">Strengths</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">{criticalIssues?.length || 0}</div>
              <div className="text-sm text-slate-600">Issues to Fix</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="ats">ATS Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strengths?.map((strength: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {criticalIssues && criticalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalIssues.map((issue: any, index: number) => (
                    <div key={index} className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              issue.severity === 'high' ? 'destructive' : 
                              issue.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="font-medium text-amber-800">{issue.issue}</p>
                          <p className="text-sm text-amber-700 mt-1">{issue.suggestion}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                          Fix This
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(categories || {}).map(([category, data]: [string, any]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{category}</span>
                    <Badge variant={data.score >= 80 ? "default" : data.score >= 60 ? "secondary" : "destructive"}>
                      {data.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={data.score} className="mb-3" />
                  <p className="text-sm text-slate-600 mb-3">{data.feedback}</p>
                  {data.improvements && data.improvements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700">Improvements:</p>
                      {data.improvements.map((improvement: string, index: number) => (
                        <p key={index} className="text-xs text-slate-600">• {improvement}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                ATS Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Matched Keywords</h4>
                  <div className="space-y-1">
                    {atsOptimization?.matchedKeywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1 border-green-300 text-green-700">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-700 mb-2">Missing Keywords</h4>
                  <div className="space-y-1">
                    {atsOptimization?.missingKeywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1 border-amber-300 text-amber-700">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {atsOptimization?.recommendations?.map((rec: string, index: number) => (
                      <p key={index} className="text-sm text-slate-600">• {rec}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Content Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentSuggestions?.map((suggestion: any, index: number) => (
                  <div key={index} className="p-4 border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            {suggestion.section}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-purple-800 mb-2">{suggestion.reason}</p>
                        
                        <div className="space-y-2">
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <span className="font-medium text-red-700">Current:</span>
                            <p className="text-red-600 mt-1">{suggestion.current}</p>
                          </div>
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                            <span className="font-medium text-green-700">Improved:</span>
                            <p className="text-green-600 mt-1">{suggestion.improved}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => onApplyImprovement(suggestion)}
                      >
                        Apply
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
  );
};
