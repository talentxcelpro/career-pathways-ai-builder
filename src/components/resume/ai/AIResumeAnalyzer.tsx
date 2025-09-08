import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, TrendingUp, Zap, Target, FileText } from 'lucide-react';
import { useJobTargeting } from '@/hooks/useJobTargeting';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIResumeAnalyzerProps {
  resumeData: any;
  onOptimizeResume?: (suggestions: any) => void;
}

interface ATSScore {
  score: number;
  breakdown: {
    keywords: number;
    formatting: number;
    sections: number;
    length: number;
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export const AIResumeAnalyzer: React.FC<AIResumeAnalyzerProps> = ({
  resumeData,
  onOptimizeResume
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const { analyze: analyzeJobMatch, result: jobMatchResult, isAnalyzing: isJobAnalyzing } = useJobTargeting(resumeData);

  const analyzeATSScore = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-ats-analyzer', {
        body: { resumeData }
      });

      if (error) throw error;

      setAtsScore(data.analysis);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('ATS analysis failed:', error);
      toast.error('Failed to analyze resume for ATS compatibility');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOptimizations = async () => {
    if (!atsScore && !jobMatchResult) {
      toast.error('Please run analysis first');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-analyzer', {
        body: {
          resumeData,
          atsScore,
          jobMatchResult,
          action: 'optimize'
        }
      });

      if (error) throw error;

      onOptimizeResume?.(data.optimizations);
      toast.success('Optimization suggestions generated!');
    } catch (error) {
      console.error('Optimization failed:', error);
      toast.error('Failed to generate optimization suggestions');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Resume Analyzer</h2>
        <p className="text-muted-foreground">
          Get intelligent insights and optimization suggestions for your resume
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ATS Compatibility
            </CardTitle>
            <CardDescription>
              Analyze how well your resume performs with Applicant Tracking Systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={analyzeATSScore} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze ATS Score'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Job Targeting
            </CardTitle>
            <CardDescription>
              Compare your resume against a specific job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-20"
            />
            <Button 
              onClick={() => analyzeJobMatch(jobDescription)} 
              disabled={isJobAnalyzing || !jobDescription.trim()}
              className="w-full"
            >
              {isJobAnalyzing ? 'Analyzing...' : 'Analyze Job Match'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ATS Score Results */}
      {atsScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              ATS Compatibility Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(atsScore.score)}`}>
                {atsScore.score}/100
              </div>
              <div className="text-lg text-muted-foreground">
                {getScoreStatus(atsScore.score)}
              </div>
              <Progress value={atsScore.score} className="mt-2" />
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold">{atsScore.breakdown.keywords}</div>
                <div className="text-sm text-muted-foreground">Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{atsScore.breakdown.formatting}</div>
                <div className="text-sm text-muted-foreground">Formatting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{atsScore.breakdown.sections}</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{atsScore.breakdown.length}</div>
                <div className="text-sm text-muted-foreground">Length</div>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {atsScore.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {atsScore.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Match Results */}
      {jobMatchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Job Match Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Match Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(jobMatchResult.matchScore)}`}>
                {Math.round(jobMatchResult.matchScore)}%
              </div>
              <div className="text-lg text-muted-foreground">Match Score</div>
              <Progress value={jobMatchResult.matchScore} className="mt-2" />
            </div>

            {/* Keywords Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Matched Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatchResult.matched.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {jobMatchResult.missing.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 border-red-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {jobMatchResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Optimizations */}
      {(atsScore || jobMatchResult) && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Optimizations</CardTitle>
            <CardDescription>
              Get personalized suggestions to improve your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateOptimizations} className="w-full">
              Generate Optimization Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};