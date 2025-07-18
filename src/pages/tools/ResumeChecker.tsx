
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileCheck, 
  Upload, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ChevronDown,
  Eye,
  Download,
  Target,
  Star,
  ArrowRight,
  X
} from 'lucide-react';

interface ResumeAnalysis {
  overallScore: number;
  breakdown: {
    tailoring: number;
    content: number;
    sections: number;
    atsEssentials: number;
  };
  details: {
    atsParseRate: boolean;
    quantifyingImpact: boolean;
    repetition: boolean;
    spelling: boolean;
    fileFormat: boolean;
    design: boolean;
  };
  strengths: string[];
  improvements: string[];
  keywords: string[];
  suggestions: Array<{
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface JobTailoringData {
  matchScore: number;
  keywords: string[];
  suggestions: string[];
}

const ResumeChecker = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [jobDescription, setJobDescription] = useState('');
  const [tailoringData, setTailoringData] = useState<JobTailoringData | null>(null);
  const [isJobAnalyzing, setIsJobAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const processingSteps = [
    'Parsing resume structure...',
    'Analyzing ATS compatibility...',
    'Checking content quality...',
    'Evaluating section completeness...',
    'Calculating tailoring score...',
    'Generating recommendations...'
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setUploadedFile(file);
      toast.success('Resume uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const simulateProcessing = async () => {
    setIsAnalyzing(true);
    setCurrentStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    }

    // Mock analysis results
    const mockAnalysis: ResumeAnalysis = {
      overallScore: 77,
      breakdown: {
        tailoring: 77,
        content: 93,
        sections: 100,
        atsEssentials: 67
      },
      details: {
        atsParseRate: true,
        quantifyingImpact: false,
        repetition: true,
        spelling: true,
        fileFormat: true,
        design: false
      },
      strengths: [
        'Strong technical skills section',
        'Excellent education credentials',
        'Clear contact information',
        'Good use of action verbs'
      ],
      improvements: [
        'Add quantifiable achievements with numbers and percentages',
        'Improve visual design and formatting',
        'Optimize for specific job requirements',
        'Include more industry-specific keywords'
      ],
      keywords: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
      suggestions: [
        {
          issue: 'Missing quantified achievements',
          suggestion: 'Add specific numbers, percentages, or metrics to your accomplishments',
          priority: 'high'
        },
        {
          issue: 'Generic job descriptions',
          suggestion: 'Tailor your experience descriptions to match the target job requirements',
          priority: 'high'
        },
        {
          issue: 'Limited keywords',
          suggestion: 'Include more industry-specific and role-relevant keywords',
          priority: 'medium'
        }
      ]
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
    toast.success('Resume analysis completed!');
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    setIsJobAnalyzing(true);
    
    // Simulate job analysis
    setTimeout(() => {
      const mockTailoring: JobTailoringData = {
        matchScore: 82,
        keywords: ['React', 'TypeScript', 'Agile', 'Leadership', 'Cloud Computing'],
        suggestions: [
          'Emphasize your React experience in your summary',
          'Add specific examples of TypeScript projects',
          'Mention your experience with Agile methodologies',
          'Highlight any cloud computing certifications'
        ]
      };
      
      setTailoringData(mockTailoring);
      setIsJobAnalyzing(false);
      toast.success('Job analysis completed!');
    }, 2000);
  };

  const useSampleJob = () => {
    const sampleJob = `Senior Frontend Developer

We are looking for an experienced Frontend Developer to join our team. You will be responsible for developing user-facing features using React, TypeScript, and modern web technologies.

Requirements:
- 5+ years of experience with React and TypeScript
- Experience with state management (Redux, Zustand)
- Knowledge of responsive design and CSS frameworks
- Experience with testing frameworks (Jest, React Testing Library)
- Familiarity with CI/CD pipelines
- Strong problem-solving skills and attention to detail
- Experience working in Agile environments

Nice to have:
- Experience with Next.js
- Knowledge of AWS or other cloud platforms
- Experience with Docker and containerization
- Previous experience in a startup environment`;

    setJobDescription(sampleJob);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analyzing Your Resume
          </h1>
          <p className="text-gray-600">
            Processing {uploadedFile?.name}...
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <Progress value={((currentStep + 1) / processingSteps.length) * 100} className="h-3 mb-4" />
                <p className="text-center text-sm text-gray-600">
                  {Math.round(((currentStep + 1) / processingSteps.length) * 100)}% Complete
                </p>
              </div>

              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {index < currentStep ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : index === currentStep ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  This usually takes 10-15 seconds...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileCheck className="h-8 w-8 text-blue-600" />
          TalentXcel Resume Checker
        </h1>
        <p className="text-gray-600 mt-2">
          Get detailed AI-powered analysis with ATS compatibility scoring and job-specific insights
        </p>
      </div>

      {!uploadedFile && !analysis ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop your resume here...</p>
                ) : (
                  <div>
                    <p className="text-gray-900 font-medium mb-2">
                      Drag & drop your resume or click to browse
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supports PDF and DOCX files up to 2MB
                    </p>
                  </div>
                )}
              </div>
              
              {uploadedFile && (
                <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {uploadedFile && (
                <Button
                  onClick={simulateProcessing}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with TalentXcel AI
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <Card className={`${getScoreBgColor(analysis.overallScore)} border-2`}>
              <CardHeader className="text-center">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-2">Your TalentXcel Resume Score</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/80">
                    <Sparkles className="h-3 w-3 mr-1" />
                    TalentXcel AI
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.overallScore / 100)}`}
                      className={getScoreColor(analysis.overallScore).replace('text-', 'text-')}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </div>
                      <div className="text-sm text-gray-600">out of 100</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ATS Compatible:</span>
                    <span className={`ml-2 ${analysis.breakdown.atsEssentials >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.breakdown.atsEssentials >= 70 ? '✓ Yes' : '✗ Needs Work'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Interview Ready:</span>
                    <span className={`ml-2 ${analysis.overallScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {analysis.overallScore >= 75 ? '✓ Ready' : '⚠ Almost'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.breakdown).map(([key, score]) => (
                  <Collapsible
                    key={key}
                    open={expandedSections.includes(key)}
                    onOpenChange={() => toggleSection(key)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          {score >= 80 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : score >= 60 ? (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-2">
                      <Progress value={score} className="h-2 mb-2" />
                      <div className="text-sm text-gray-600 space-y-1">
                        {key === 'atsEssentials' && (
                          <>
                            <div className="flex items-center gap-2">
                              {analysis.details.atsParseRate ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span>ATS Parse Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {analysis.details.fileFormat ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span>File Format Compatibility</span>
                            </div>
                          </>
                        )}
                        {key === 'content' && (
                          <>
                            <div className="flex items-center gap-2">
                              {analysis.details.quantifyingImpact ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span>Quantifying Impact</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {analysis.details.spelling ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span>Spelling & Grammar</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Detailed Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{suggestion.issue}</h4>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Job Tailoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Resume Tailoring
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Paste the job you're applying for and get job-specific resume tailoring suggestions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={analyzeJobDescription}
                    disabled={!jobDescription.trim() || isJobAnalyzing}
                    className="flex-1"
                  >
                    {isJobAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      'Get Tailored Insights'
                    )}
                  </Button>
                  <Button variant="outline" onClick={useSampleJob}>
                    Use Sample Job
                  </Button>
                </div>

                {tailoringData && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Job Match Score</h4>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-600">{tailoringData.matchScore}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Key Skills to Highlight</h5>
                      <div className="flex flex-wrap gap-2">
                        {tailoringData.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Tailoring Suggestions</h5>
                      <ul className="space-y-2">
                        {tailoringData.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Resume Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="original" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="talentxcel">TalentXcel</TabsTrigger>
                  </TabsList>
                  <TabsContent value="original" className="mt-4">
                    <div className="border rounded-lg p-4 bg-white min-h-[300px] text-center">
                      <div className="text-gray-500 mt-20">
                        <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Original resume preview</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="talentxcel" className="mt-4">
                    <div className="border rounded-lg p-4 bg-white min-h-[300px] text-center">
                      <div className="text-blue-500 mt-20">
                        <Sparkles className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm font-medium">TalentXcel Enhanced</p>
                        <p className="text-xs text-gray-500 mt-1">Professional Template</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-2 mt-4">
                  <Button className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Build with TalentXcel
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Templates
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Unlock Premium */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Unlock Full Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get detailed line-by-line feedback, keyword optimization, and premium templates
                </p>
                <Button className="w-full">
                  Upgrade to Premium
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">1</div>
                  <span className="text-sm">Fix high priority issues</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">2</div>
                  <span className="text-sm">Tailor for specific jobs</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">3</div>
                  <span className="text-sm">Use TalentXcel templates</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ResumeChecker;
