import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Search,
  FileText,
  User,
  Award
} from "lucide-react";
import { analyzeATSCompatibility, ATSScore, ATSSuggestion } from "@/utils/atsOptimization";

interface ATSOptimizationPanelProps {
  resumeData: any;
}

export const ATSOptimizationPanel: React.FC<ATSOptimizationPanelProps> = ({ resumeData }) => {
  const atsAnalysis = useMemo(() => {
    return analyzeATSCompatibility(resumeData);
  }, [resumeData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPriorityIcon = (priority: ATSSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: ATSSuggestion['category']) => {
    switch (category) {
      case 'keywords':
        return <Search className="h-4 w-4" />;
      case 'formatting':
        return <FileText className="h-4 w-4" />;
      case 'sections':
        return <Target className="h-4 w-4" />;
      case 'contact':
        return <User className="h-4 w-4" />;
      case 'skills':
        return <Award className="h-4 w-4" />;
    }
  };

  const breakdownItems = [
    { key: 'keywords', label: 'Keywords & Content', icon: Search, maxScore: 25 },
    { key: 'formatting', label: 'ATS-Friendly Format', icon: FileText, maxScore: 25 },
    { key: 'sections', label: 'Essential Sections', icon: Target, maxScore: 20 },
    { key: 'contact', label: 'Contact Information', icon: User, maxScore: 15 },
    { key: 'skills', label: 'Skills Section', icon: Award, maxScore: 15 }
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ATS Optimization Score
            </CardTitle>
            <CardDescription>
              Applicant Tracking System compatibility analysis
            </CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(atsAnalysis.overall)}`}>
              {atsAnalysis.overall}
            </div>
            <Badge variant={getScoreVariant(atsAnalysis.overall)} className="mt-1">
              {atsAnalysis.overall >= 80 ? 'Excellent' : 
               atsAnalysis.overall >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Score Overview</TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({atsAnalysis.suggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall ATS Score</span>
                <span className="font-medium">{atsAnalysis.overall}/100</span>
              </div>
              <Progress value={atsAnalysis.overall} className="h-2" />
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Score Breakdown</h4>
              {breakdownItems.map(({ key, label, icon: Icon, maxScore }) => {
                const score = atsAnalysis.breakdown[key];
                const percentage = (score / maxScore) * 100;
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      <span className={`font-medium ${getScoreColor(percentage)}`}>
                        {score}/{maxScore}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
            </div>

            {/* Quick Insights */}
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                {atsAnalysis.overall >= 80 
                  ? "Great work! Your resume is well-optimized for ATS systems."
                  : atsAnalysis.overall >= 60
                  ? "Good progress! Address the high-priority suggestions to improve your score."
                  : "Your resume needs optimization. Focus on the high-priority items first."
                }
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {atsAnalysis.suggestions.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Excellent! No major issues found. Your resume is well-optimized for ATS systems.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {atsAnalysis.suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(suggestion.priority)}
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{suggestion.issue}</h5>
                          <Badge variant="outline" className="text-xs">
                            +{suggestion.impact} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={suggestion.priority === 'high' ? 'destructive' : 
                                   suggestion.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {suggestion.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};