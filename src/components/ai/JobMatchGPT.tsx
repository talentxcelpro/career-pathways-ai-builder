import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  FileText, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Star,
  RefreshCw,
  Download,
  Share,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeAnalysis {
  overall_score: number;
  sections: {
    [key: string]: {
      score: number;
      suggestions: string[];
      keywords_found: string[];
      keywords_missing: string[];
    };
  };
  ats_compatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  skill_analysis: {
    technical_skills: Array<{
      skill: string;
      proficiency: number;
      market_demand: number;
      recommendations: string[];
    }>;
    soft_skills: Array<{
      skill: string;
      evidence_found: boolean;
      improvement_tips: string[];
    }>;
  };
  career_insights: {
    current_level: string;
    potential_roles: string[];
    salary_estimate: {
      min: number;
      max: number;
      confidence: number;
    };
    growth_recommendations: string[];
  };
}

interface JobMatch {
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  match_score: number;
  skill_match: number;
  experience_match: number;
  location_match: number;
  matching_skills: string[];
  skill_gaps: string[];
  recommendations: string[];
  application_url?: string;
  posted_date: string;
  confidence_level: 'high' | 'medium' | 'low';
}

const JobMatchGPT: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('analysis');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysis | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch user's resume and profile data
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-gpt'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  // AI Resume Analysis Mutation
  const analyzeResumeMutation = useMutation({
    mutationFn: async ({ file, jobDescriptions }: { file: File; jobDescriptions?: string[] }) => {
      setIsAnalyzing(true);
      
      // Convert file to base64 for processing
      const fileContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('job-match-gpt', {
        body: {
          operation: 'analyze_resume',
          resume_content: fileContent,
          user_profile: userProfile,
          job_descriptions: jobDescriptions || []
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAnalysisData(data.analysis);
      setJobMatches(data.job_matches || []);
      toast.success('Resume analysis completed!');
      setSelectedTab('analysis');
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze resume. Please try again.');
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });

  // Generate job matches based on current analysis
  const generateJobMatches = async () => {
    if (!analysisData) {
      toast.error('Please analyze your resume first');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('job-match-gpt', {
        body: {
          operation: 'find_job_matches',
          analysis_data: analysisData,
          user_profile: userProfile,
          match_criteria: {
            include_skill_gaps: true,
            include_salary_analysis: true,
            max_matches: 15
          }
        }
      });

      if (error) throw error;
      
      setJobMatches(data.matches || []);
      toast.success(`Found ${data.matches?.length || 0} job matches!`);
      setSelectedTab('matches');
    } catch (error) {
      console.error('Job matching failed:', error);
      toast.error('Failed to find job matches');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      setResumeFile(file);
      analyzeResumeMutation.mutate({ file });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Job Match GPT
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            AI-powered resume analysis and intelligent job matching
          </p>
        </div>
        <div className="flex gap-2">
          {analysisData && (
            <Button onClick={generateJobMatches} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Matches
            </Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Resume
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysisData}>
            <Target className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="matches" disabled={jobMatches.length === 0}>
            <Zap className="h-4 w-4 mr-2" />
            Job Matches
          </TabsTrigger>
          <TabsTrigger value="insights" disabled={!analysisData}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Career Insights
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <p className="text-muted-foreground">
                Upload your resume to get AI-powered analysis and job matching
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload your resume</p>
                  <p className="text-sm text-muted-foreground">
                    Support for PDF, DOC, and DOCX files (Max 5MB)
                  </p>
                  <div className="mt-4">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Button disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing Resume...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </label>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {resumeFile.name} uploaded
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {analysisData && (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Overall Resume Score
                    <Badge className={getScoreBadge(analysisData.overall_score)}>
                      {analysisData.overall_score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={analysisData.overall_score} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      Your resume scores {analysisData.overall_score}% based on industry standards, 
                      ATS compatibility, and content quality.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analysisData.sections).map(([section, data]) => (
                  <Card key={section}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize flex items-center justify-between">
                        {section.replace('_', ' ')}
                        <span className={`text-sm ${getScoreColor(data.score)}`}>
                          {data.score}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={data.score} className="h-2" />
                      
                      {data.keywords_found.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-2">✓ Keywords Found:</p>
                          <div className="flex flex-wrap gap-1">
                            {data.keywords_found.map((keyword) => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.keywords_missing.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-2">⚠ Missing Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {data.keywords_missing.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs border-red-200">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.suggestions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">💡 Suggestions:</p>
                          <ul className="space-y-1">
                            {data.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ATS Compatibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    ATS Compatibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ATS Score</span>
                    <Badge className={getScoreBadge(analysisData.ats_compatibility.score)}>
                      {analysisData.ats_compatibility.score}%
                    </Badge>
                  </div>
                  <Progress value={analysisData.ats_compatibility.score} className="h-3" />
                  
                  {analysisData.ats_compatibility.issues.length > 0 && (
                    <div>
                      <p className="font-medium text-red-600 mb-2">Issues Found:</p>
                      <ul className="space-y-1">
                        {analysisData.ats_compatibility.issues.map((issue, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisData.ats_compatibility.recommendations.length > 0 && (
                    <div>
                      <p className="font-medium text-blue-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {analysisData.ats_compatibility.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Job Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          {jobMatches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  AI-Powered Job Matches ({jobMatches.length})
                </h3>
                <Button onClick={generateJobMatches} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {jobMatches.map((job) => (
                <Card key={job.job_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{job.title}</h4>
                          <Badge className={getScoreBadge(job.match_score)}>
                            {job.match_score}% Match
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {job.confidence_level} confidence
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-2">{job.company}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{job.location}</span>
                          <span>{job.salary_range}</span>
                          <span>{job.posted_date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Skills Match</span>
                          <span className="text-sm font-medium">{job.skill_match}%</span>
                        </div>
                        <Progress value={job.skill_match} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Experience Match</span>
                          <span className="text-sm font-medium">{job.experience_match}%</span>
                        </div>
                        <Progress value={job.experience_match} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Location Match</span>
                          <span className="text-sm font-medium">{job.location_match}%</span>
                        </div>
                        <Progress value={job.location_match} className="h-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-medium text-green-600 mb-2">✓ Matching Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.matching_skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {job.skill_gaps.length > 0 && (
                        <div>
                          <p className="font-medium text-yellow-600 mb-2">⚠ Skills to Develop:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.skill_gaps.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs border-yellow-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {job.recommendations.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium mb-2">💡 AI Recommendations:</p>
                        <ul className="space-y-1">
                          {job.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1">Apply Now</Button>
                      <Button variant="outline">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Career Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {analysisData?.career_insights && (
            <div className="space-y-6">
              {/* Career Level & Potential */}
              <Card>
                <CardHeader>
                  <CardTitle>Career Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Current Career Level:</p>
                    <Badge variant="secondary" className="text-sm">
                      {analysisData.career_insights.current_level}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Potential Roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.career_insights.potential_roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Estimated Salary Range:</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        ${analysisData.career_insights.salary_estimate.min.toLocaleString()} - 
                        ${analysisData.career_insights.salary_estimate.max.toLocaleString()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({analysisData.career_insights.salary_estimate.confidence}% confidence)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisData.skill_analysis.technical_skills.map((skill) => (
                      <div key={skill.skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{skill.skill}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              Prof: {skill.proficiency}%
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Demand: {skill.market_demand}%
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Progress value={skill.proficiency} className="h-2" />
                          <Progress value={skill.market_demand} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisData.career_insights.growth_recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobMatchGPT;