import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { CoreResumeData } from '@/types/resume-core';
import { Badge } from '@/components/ui/badge';

interface ATSScorePanelProps {
  resumeData: CoreResumeData;
  analysis: any;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function ATSScorePanel({ resumeData, analysis, isAnalyzing, onAnalyze }: ATSScorePanelProps) {
  const score = analysis?.score || resumeData.metadata.atsScore || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const suggestions = analysis?.suggestions || [
    {
      type: 'warning',
      message: 'Add more quantifiable achievements to your experience section',
      priority: 'high'
    },
    {
      type: 'info',
      message: 'Include relevant keywords from your target job descriptions',
      priority: 'medium'
    },
    {
      type: 'success',
      message: 'Your contact information is complete',
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ATS Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            ATS Compatibility Score
          </CardTitle>
          <CardDescription>
            How well your resume performs with Applicant Tracking Systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div>
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {getScoreLabel(score)}
              </div>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Contact Information', score: 100 },
            { label: 'Experience Section', score: 85 },
            { label: 'Skills & Keywords', score: 70 },
            { label: 'Education', score: 90 },
            { label: 'Formatting', score: 95 }
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className={getScoreColor(item.score)}>{item.score}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>
            Actionable recommendations to improve your ATS score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion: any, index: number) => {
              const Icon = 
                suggestion.type === 'success' ? CheckCircle :
                suggestion.type === 'warning' ? AlertCircle :
                XCircle;
              
              const iconColor =
                suggestion.type === 'success' ? 'text-green-500' :
                suggestion.type === 'warning' ? 'text-yellow-500' :
                'text-red-500';

              return (
                <div key={index} className="flex gap-3 p-3 rounded-lg border">
                  <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{suggestion.message}</p>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.priority} priority
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
