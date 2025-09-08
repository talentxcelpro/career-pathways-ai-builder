import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, TrendingUp, CheckCircle, X, Sparkles } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface ATSScorerProps {
  resumeContent: any;
  onScoreUpdate?: (score: number, feedback: any) => void;
}

export const ATSScorer: React.FC<ATSScorerProps> = ({ resumeContent, onScoreUpdate }) => {
  const [atsScore, setAtsScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { optimizeForATS } = useAIService();

  const analyzeResume = async () => {
    if (!resumeContent || !resumeContent.sections) {
      toast.error('No resume content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await optimizeForATS(resumeContent, jobDescription);
      
      if (result.success && result.data) {
        const score = result.data.ats_score?.current || 0;
        const analysisFeedback = result.data.ats_score;
        setAtsScore(score);
        setFeedback(analysisFeedback);
        onScoreUpdate?.(score, analysisFeedback);
        toast.success('ATS analysis completed!');
      } else {
        toast.error('Failed to analyze resume');
      }
    } catch (error) {
      console.error('ATS analysis error:', error);
      toast.error('Error analyzing resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          ATS Score Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ATS Score Display */}
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
            {atsScore}/100
          </div>
          <p className="text-sm text-muted-foreground mt-1">ATS Compatibility Score</p>
          <Progress value={atsScore} className="mt-4" />
          <Badge variant={getScoreBadgeVariant(atsScore)} className="mt-2">
            {atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Improvement'}
          </Badge>
        </div>

        {/* Job Description Input */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description (Optional)</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for more accurate ATS analysis..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Adding a job description helps provide more targeted ATS optimization suggestions.
          </p>
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={analyzeResume} 
          disabled={isAnalyzing}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Score'}
        </Button>

        {/* Feedback Display */}
        {feedback && (
          <div className="space-y-4">
            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {feedback.issues && feedback.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Issues to Fix
                </h4>
                <ul className="space-y-1">
                  {feedback.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <X className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {feedback.recommendations && feedback.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-600 flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {feedback.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <TrendingUp className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {feedback.keywords && (
              <div>
                <h4 className="font-semibold mb-2">Keyword Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {feedback.keywords.found && (
                    <div>
                      <p className="font-medium text-green-600">Found Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {feedback.keywords.found.map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {feedback.keywords.missing && (
                    <div>
                      <p className="font-medium text-orange-600">Missing Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {feedback.keywords.missing.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};