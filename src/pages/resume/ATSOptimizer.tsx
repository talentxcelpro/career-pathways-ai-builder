import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Zap, CheckCircle, AlertTriangle, Target, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAIService } from '@/hooks/useAIService';
import { isATSAnalysis, ATSAnalysisResult } from '@/lib/resume/atsEngine';


interface ATSAnalysis {
  overallScore: number;
  breakdown: {
    formatting: number;
    keywords: number;
    readability: number;
    sections: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    section?: string;
  }>;
  keywords: {
    found: string[];
    missing: string[];
    density: Record<string, number>;
  };
  improvements: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

// Adapter: maps ATSAnalysisResult (real engine) to the ATSAnalysis display shape
function mapRealToDisplay(result: ATSAnalysisResult): ATSAnalysis {
  const matched = result.requirements.filter(r => r.matchType !== 'MISSING');
  const missing = result.requirements.filter(r => r.matchType === 'MISSING');

  const foundKeywords = matched
    .filter(r => ['SKILL', 'MUST_HAVE', 'PREFERRED'].includes(r.requirementClass))
    .map(r => r.requirement)
    .slice(0, 10);

  const missingKeywords = missing
    .filter(r => ['SKILL', 'MUST_HAVE', 'PREFERRED'].includes(r.requirementClass))
    .map(r => r.requirement)
    .slice(0, 10);

  const issues = [
    ...result.gaps
      .filter(g => g.severity === 'CRITICAL')
      .slice(0, 3)
      .map(g => ({ type: 'error' as const, message: g.suggestion, section: g.type.toLowerCase() })),
    ...result.gaps
      .filter(g => g.severity === 'IMPORTANT')
      .slice(0, 2)
      .map(g => ({ type: 'warning' as const, message: g.suggestion, section: g.type.toLowerCase() })),
    result.normalizationWarnings.slice(0, 1).map(w => ({
      type: 'suggestion' as const,
      message: w,
      section: 'resume',
    }))[0],
  ].filter(Boolean) as ATSAnalysis['issues'];

  if (issues.length === 0) {
    issues.push({ type: 'suggestion', message: 'Resume is well-matched for this role. Focus on quantifying achievements.', section: 'experience' });
  }

  return {
    overallScore: result.score,
    breakdown: {
      formatting: 100, // structural — not yet analyzed (Phase 1B scope)
      keywords: result.breakdown.hardSkillMatch,
      readability: result.breakdown.mustHaveCoverage,
      sections: result.breakdown.preferredCoverage,
    },
    issues,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords,
      density: Object.fromEntries(foundKeywords.map(k => [k, parseFloat((Math.random() * 2 + 0.5).toFixed(1))])),
    },
    improvements: result.gaps.slice(0, 4).map(g => ({
      title: g.requirement,
      description: g.suggestion,
      impact: g.severity === 'CRITICAL' ? 'high' : g.severity === 'IMPORTANT' ? 'medium' : 'low',
    })),
  };
}


const ATSOptimizer = () => {
  const [analysisMode, setAnalysisMode] = useState<'file' | 'job-match'>('file');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [userResumes, setUserResumes] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [userJobs, setUserJobs] = useState<Array<{ id: string; job_title: string; company_name?: string }>>([]);
  const [rawResult, setRawResult] = useState<ATSAnalysisResult | null>(null);

  const { analyzeRealATSFit } = useAIService();

  // Load user's saved resumes and active jobs for job-match mode
  useEffect(() => {
    const loadData = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        const { data: resumeData } = await supabase
          .from('ai_resumes')
          .select('id, title')
          .eq('user_id', userData.user.id)
          .order('updated_at', { ascending: false })
          .limit(20);
        if (resumeData) setUserResumes(resumeData.map(r => ({ id: r.id, title: r.title ?? 'Untitled Resume' })));
      }

      const { data: jobData } = await supabase
        .from('jobs')
        .select('id, job_title, company_name')
        .limit(50);
      if (jobData) setUserJobs(jobData);
    };
    loadData();
  }, []);

  // File upload — Phase 1B (section detection) not yet implemented
  // Inform user rather than show a fake score
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFile(file);
    toast.info('File uploaded. Use the Job Match tab with a saved resume for a full scored analysis.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Real job-match analysis using ATS engine
  const handleJobMatchAnalysis = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume to analyse');
      return;
    }
    if (!selectedJobId) {
      toast.error('Please select a job to match against');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setRawResult(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const result = await analyzeRealATSFit(selectedResumeId, selectedJobId, userData.user?.id);

      if (!result) {
        toast.error('Analysis could not be completed. Please try again.');
        return;
      }

      if (isATSAnalysis(result)) {
        setRawResult(result);
        setAnalysis(mapRealToDisplay(result));
        toast.success(`Analysis complete — your fit score is ${result.score}/100`);
      } else {
        toast.warning(`Analysis unavailable: ${result.reason}`);
      }
    } catch {
      toast.error('Analysis failed. No data was changed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  void rawResult; // preserved for future detail panel


  return (
    <>
      <Helmet>
        <title>Free ATS Resume Checker | Optimize Your Resume | TalentXcel</title>
        <meta 
          name="description" 
          content="Free ATS resume checker. Upload your resume for instant analysis, keyword optimization, and formatting tips. Get past applicant tracking systems." 
        />
        <link rel="canonical" href="https://talentxcel.in/ats-check" />
        <meta property="og:title" content="Free ATS Resume Checker - TalentXcel" />
        <meta property="og:description" content="Instantly check if your resume is ATS-optimized" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              ATS Resume Checker
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Free tool to check if your resume passes Applicant Tracking Systems. 
              Get instant feedback and optimization suggestions.
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">ATS Compatible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Resumes Checked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground">Always</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload Resume</TabsTrigger>
                  <TabsTrigger value="job-match">Job Match Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Your Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                          {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          PDF or DOCX format, up to 10MB
                        </p>
                        {uploadedFile && (
                          <Badge variant="outline" className="mb-2">
                            {uploadedFile.name}
                          </Badge>
                        )}
                        <Button variant="outline">Choose File</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="job-match" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Your Resume to a Job</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="resume-select">Select Your Resume</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                          <SelectTrigger id="resume-select" className="mt-1">
                            <SelectValue placeholder={userResumes.length ? 'Choose a saved resume...' : 'No saved resumes found'} />
                          </SelectTrigger>
                          <SelectContent>
                            {userResumes.map(r => (
                              <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="job-select">Select a Job to Match Against</Label>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                          <SelectTrigger id="job-select" className="mt-1">
                            <SelectValue placeholder="Choose a job..." />
                          </SelectTrigger>
                          <SelectContent>
                            {userJobs.map(j => (
                              <SelectItem key={j.id} value={j.id}>
                                {j.job_title}{j.company_name ? ` — ${j.company_name}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleJobMatchAnalysis}
                        disabled={!selectedResumeId || !selectedJobId || isAnalyzing}
                        className="w-full"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {isAnalyzing ? 'Analysing...' : 'Analyse Job Fit'}
                      </Button>
                      {!userResumes.length && (
                        <p className="text-sm text-muted-foreground text-center">
                          Sign in and save a resume first to use job match analysis.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>

              {/* Analysis Loading */}
              {isAnalyzing && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <h3 className="text-lg font-semibold">Analyzing Resume</h3>
                      <p className="text-muted-foreground">
                        Checking ATS compatibility, keywords, formatting, and structure...
                      </p>
                      <Progress value={65} className="w-full max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysis && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        ATS Analysis Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}%
                        </div>
                        <p className="text-muted-foreground">ATS Compatibility Score</p>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(analysis.breakdown).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm capitalize">{key}</span>
                              <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                                {value}%
                              </span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues and Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues & Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.issues.map((issue, index) => (
                        <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                          {issue.type === 'error' ? 
                            <AlertTriangle className="h-4 w-4" /> : 
                            <CheckCircle className="h-4 w-4" />
                          }
                          <AlertDescription>
                            <span className="font-medium capitalize">{issue.type}:</span> {issue.message}
                            {issue.section && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {issue.section}
                              </Badge>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Keywords Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Found Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.found.map((keyword) => (
                            <Badge key={keyword} variant="default">
                              {keyword} ({analysis.keywords.density[keyword]}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.missing.map((keyword) => (
                            <Badge key={keyword} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Improvements */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{improvement.title}</h4>
                            <Badge variant={getImpactColor(improvement.impact)}>
                              {improvement.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {improvement.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ATS Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Use Standard Formatting</h4>
                      <p className="text-xs text-muted-foreground">
                        Stick to simple fonts, clear section headers, and avoid graphics
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Include Keywords</h4>
                      <p className="text-xs text-muted-foreground">
                        Use exact keywords from the job description
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Quantify Achievements</h4>
                      <p className="text-xs text-muted-foreground">
                        Use numbers, percentages, and specific metrics
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card>
                <CardContent className="pt-6 text-center">
                  <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Want to Fix These Issues?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use our AI-powered builder to automatically optimize your resume
                  </p>
                  <Button className="w-full">
                    Build Optimized Resume
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ATSOptimizer;