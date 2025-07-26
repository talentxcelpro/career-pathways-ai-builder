import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, Target, AlertCircle, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface ATSAnalysis {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

interface AIJobDescriptionAnalyzerProps {
  resumeContent?: string;
  onAnalysisComplete?: (analysis: ATSAnalysis) => void;
}

export const AIJobDescriptionAnalyzer: React.FC<AIJobDescriptionAnalyzerProps> = ({
  resumeContent,
  onAnalysisComplete
}) => {
  const { invokeAITool, isProcessing } = useAIService();
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCompatibility = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (!resumeContent?.trim()) {
      toast.error('No resume content available for analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await invokeAITool({
        toolSlug: 'ats-analyzer',
        inputData: {
          resume_text: resumeContent,
          job_description: jobDescription
        },
        category: 'ats_analysis'
      });

      if (result.success && result.data) {
        const analysisData: ATSAnalysis = {
          score: result.data.score || 0,
          missingKeywords: result.data.missingKeywords || [],
          suggestions: result.data.suggestions || [],
          strengths: result.data.strengths || [],
          improvements: result.data.improvements || []
        };
        
        setAnalysis(analysisData);
        onAnalysisComplete?.(analysisData);
        toast.success('Job compatibility analysis complete!');
      } else {
        toast.error('Failed to analyze job compatibility');
      }
    } catch (error) {
      toast.error('Analysis failed');
      console.error('Job analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Job Description Analyzer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze how well your resume matches a specific job posting
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Job Description</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[150px]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {jobDescription.split(' ').filter(word => word.length > 0).length} words
            </span>
            <Button
              onClick={analyzeCompatibility}
              disabled={isProcessing || analyzing || !jobDescription.trim() || !resumeContent}
              className="flex items-center gap-2"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analyze Compatibility
            </Button>
          </div>
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Compatibility Score */}
            <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">ATS Compatibility Score</h3>
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}%
                    </div>
                    <Badge 
                      variant={analysis.score >= 80 ? "default" : analysis.score >= 60 ? "secondary" : "destructive"}
                      className="text-sm"
                    >
                      {getScoreLabel(analysis.score)}
                    </Badge>
                  </div>
                  <Progress 
                    value={analysis.score} 
                    className="w-full max-w-md mx-auto h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Improvement */}
              {analysis.improvements.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                      <TrendingUp className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Missing Keywords */}
            {analysis.missingKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Missing Keywords
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Consider adding these keywords to improve ATS compatibility
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-red-200 text-red-700 bg-red-50"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actionable Suggestions */}
            {analysis.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-primary font-medium text-sm">
                            {index + 1}.
                          </span>
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 How to Use This Tool</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Copy the full job description from the job posting</li>
            <li>• Paste it into the text area above</li>
            <li>• Get AI-powered insights on how to improve your resume</li>
            <li>• Focus on adding missing keywords naturally into your content</li>
            <li>• Aim for a score of 80+ for better ATS compatibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};