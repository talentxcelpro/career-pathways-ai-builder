import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface ResumeScore {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface AIResumeScorerProps {
  defaultResumeText?: string;
  jobDescription?: string;
  onScoreUpdate?: (score: ResumeScore) => void;
}

export const AIResumeScorer: React.FC<AIResumeScorerProps> = ({
  defaultResumeText = "",
  jobDescription = "",
  onScoreUpdate
}) => {
  const [resumeText, setResumeText] = useState(defaultResumeText);
  const [jobDesc, setJobDesc] = useState(jobDescription);
  const [score, setScore] = useState<ResumeScore | null>(null);
  const { loading, error, scoreResume } = useAIService();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    try {
      const response = await scoreResume(resumeText, jobDesc);
      
      if (response.success) {
        const parsedScore = JSON.parse(response.data);
        setScore(parsedScore);
        onScoreUpdate?.(parsedScore);
        toast.success('Resume analyzed successfully!');
      } else {
        toast.error(response.error || 'Failed to analyze resume');
      }
    } catch (err) {
      toast.error('Error analyzing resume');
      console.error('Resume analysis error:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Resume Analyzer
          </CardTitle>
          <CardDescription>
            Get instant feedback on your resume with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="resume-text" className="block text-sm font-medium mb-2">
              Resume Text
            </label>
            <Textarea
              id="resume-text"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <div>
            <label htmlFor="job-description" className="block text-sm font-medium mb-2">
              Job Description (Optional)
            </label>
            <Textarea
              id="job-description"
              placeholder="Paste job description for targeted analysis..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !resumeText.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {score && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resume Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge variant={getScoreVariant(score.overallScore)}>
                    {score.overallScore}/100
                  </Badge>
                </div>
                <Progress value={score.overallScore} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ATS Compatibility</span>
                  <Badge variant={getScoreVariant(score.atsScore)}>
                    {score.atsScore}/100
                  </Badge>
                </div>
                <Progress value={score.atsScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {score.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Missing Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {score.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-600">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {score.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};