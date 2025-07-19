
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileCheck, Upload, Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader2, Crown } from 'lucide-react';
import { ResumeScoreCard } from '@/components/resume/checker/ResumeScoreCard';
import { DetailedScoreBreakdown } from '@/components/resume/checker/DetailedScoreBreakdown';
import { EnhancedJobTailoring } from '@/components/resume/checker/EnhancedJobTailoring';
import { EnhancedResumePreview } from '@/components/resume/checker/EnhancedResumePreview';

interface DetailedScore {
  category: string;
  score: number;
  maxScore: number;
  checks: Array<{
    name: string;
    passed: boolean;
    description: string;
    impact: 'high' | 'medium' | 'low';
    suggestion?: string;
  }>;
}

interface ResumeAnalysis {
  success: boolean;
  overallScore: number;
  detailedScores: DetailedScore[];
  tailoringAnalysis?: DetailedScore;
  recommendations: string[];
  atsCompatibility: number;
  improvementPriority: Array<{
    priority: number;
    category: string;
    action: string;
  }>;
}

const ResumeCheck = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isJobAnalyzing, setIsJobAnalyzing] = useState(false);

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume content');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: response, error } = await supabase.functions.invoke('ai-resume-analyzer', {
        body: {
          resumeText,
          targetRole: 'Software Engineer'
        }
      });

      if (error) throw error;

      if (response.success) {
        setAnalysis(response);
        toast.success('Resume analysis completed!');
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeJobTailoring = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast.error('Please provide both resume content and job description');
      return;
    }

    setIsJobAnalyzing(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('ai-resume-analyzer', {
        body: {
          resumeText,
          jobDescription,
          targetRole: 'Software Engineer'
        }
      });

      if (error) throw error;

      if (response.success && response.tailoringAnalysis) {
        setAnalysis(prev => prev ? {
          ...prev,
          tailoringAnalysis: response.tailoringAnalysis
        } : response);
        toast.success('Job tailoring analysis completed!');
      } else {
        throw new Error('Job tailoring analysis failed');
      }
    } catch (error) {
      console.error('Job tailoring analysis error:', error);
      toast.error('Failed to analyze job match. Please try again.');
    } finally {
      setIsJobAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileCheck className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              TalentXcel Resume Analyzer
            </h1>
            <p className="text-gray-600">
              Get detailed AI-powered analysis with ATS compatibility scoring and job-specific insights
            </p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Paste your resume content below for comprehensive AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your complete resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <Button
                onClick={analyzeResume}
                disabled={isAnalyzing || !resumeText.trim()}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Job Tailoring Section */}
          {analysis && (
            <EnhancedJobTailoring
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAnalyze={analyzeJobTailoring}
              isAnalyzing={isJobAnalyzing}
              tailoringAnalysis={analysis.tailoringAnalysis}
            />
          )}
        </div>

        {/* Results Section */}
        <div className="xl:col-span-2 space-y-6">
          {analysis ? (
            <>
              {/* Overall Score Card */}
              <ResumeScoreCard score={analysis.overallScore} />

              {/* Detailed Score Breakdown */}
              <DetailedScoreBreakdown scores={analysis.detailedScores} />

              {/* Priority Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Priority Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.improvementPriority.slice(0, 5).map((improvement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded border bg-white">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {improvement.category}
                            </Badge>
                            <Badge 
                              variant={improvement.priority === 1 ? "destructive" : improvement.priority === 2 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {improvement.priority === 1 ? "High" : improvement.priority === 2 ? "Medium" : "Low"} Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{improvement.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resume Preview */}
              <EnhancedResumePreview />

              {/* Upgrade Prompt */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-full">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Unlock Your Full Potential
                      </h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Get access to advanced AI features, premium templates, and personalized career coaching to land your dream job faster.
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Ready for Professional Analysis
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Our AI will analyze your resume across multiple dimensions including ATS compatibility, 
                  content quality, and section completeness to give you actionable insights.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>ATS Compatibility</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Content Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Job Matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Improvement Tips</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCheck;
