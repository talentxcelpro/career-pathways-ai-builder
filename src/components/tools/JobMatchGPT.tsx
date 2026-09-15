import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Brain, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MatchedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  salary_range?: string;
  is_remote: boolean;
}

interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  suggestion: string;
}

interface JobMatchResults {
  matched_jobs: MatchedJob[];
  overall_profile_score: number;
  skill_gaps: SkillGap[];
  recommendations: string[];
  career_suggestions: string[];
}

export const JobMatchGPT: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<JobMatchResults | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast.error('Please upload a PDF or text file');
      return;
    }

    setUploading(true);
    
    try {
      // For PDF files, we'd need a PDF parser. For now, let's handle text files
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        toast.success('Resume uploaded successfully!');
      } else {
        toast.info('PDF parsing not implemented yet. Please paste your resume text below.');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    } finally {
      setUploading(false);
    }
  }, []);

  const analyzeResumeWithAI = useCallback(async () => {
    if (!resumeText.trim()) {
      toast.error('Please upload or paste your resume first');
      return;
    }

    setAnalyzing(true);

    try {
      // Get some sample jobs for analysis
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .limit(20);

      // Call AI analysis function
      const { data, error } = await supabase.functions.invoke('ai-job-matcher', {
        body: {
          resume_content: resumeText,
          available_jobs: jobs || [], // Use fetched jobs
          analysis_type: 'comprehensive'
        }
      });

      if (error) throw error;

      const analysisResults: JobMatchResults = data.results || {
        matched_jobs: [],
        overall_profile_score: 0,
        skill_gaps: [],
        recommendations: [],
        career_suggestions: []
      };

      setResults(analysisResults);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [resumeText]);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          <Brain className="w-8 h-8 inline-block mr-2 text-blue-600" />
          AI Job Match GPT
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your resume and get AI-powered job recommendations with skill gap analysis and career suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload PDF or text file (max 5MB)
                </p>
              </div>

              <div className="text-center text-gray-500">
                <span className="text-sm">or</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Paste Resume Content
                </label>
                <Textarea
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={analyzeResumeWithAI}
                disabled={!resumeText.trim() || analyzing || uploading}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Find Matching Jobs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Profile Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.overall_profile_score)}`}>
                      {results.overall_profile_score}%
                    </div>
                    <Progress 
                      value={results.overall_profile_score} 
                      className="mt-4"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Overall marketability score
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Top Job Matches */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Job Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.matched_jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company_name}</p>
                          <p className="text-xs text-gray-500">{job.location}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(job.match_percentage)}`}>
                            {job.match_percentage}%
                          </div>
                          <div className={`w-16 h-2 rounded-full ${getMatchColor(job.match_percentage)}`} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Matching Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.matching_skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {job.missing_skills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-600 mb-1">Missing Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {job.missing_skills.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="destructive" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              {results.skill_gaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Skill Gaps to Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.skill_gaps.slice(0, 5).map((gap, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{gap.skill}</span>
                          <Badge 
                            variant={gap.importance === 'high' ? 'destructive' : gap.importance === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {gap.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{gap.suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Career Recommendations */}
              {results.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Your Resume to Get Started
                </h3>
                <p className="text-gray-600 max-w-md">
                  Upload or paste your resume content and let our AI analyze it to find the best job matches and career suggestions for you.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};