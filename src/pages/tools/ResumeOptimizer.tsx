
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  ArrowLeft, 
  Upload,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Award,
  Download,
  Copy,
  Check,
  File,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";

interface OptimizationResult {
  overallScore: number;
  sections: {
    [key: string]: {
      score: number;
      suggestions: string[];
      improvements: string[];
    };
  };
  keywords: {
    missing: string[];
    present: string[];
    recommended: string[];
  };
  atsCompatibility: number;
}

const ResumeOptimizer = () => {
  const navigate = useNavigate();
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  });

  const [jobTitle, setJobTitle] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      
      // Simulate file content extraction
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // For demo purposes, we'll set some sample content
        setResumeText(`Sample resume content from ${file.name}:\n\nJohn Doe\nSoftware Engineer with 5 years of experience in web development...\n\nExperience:\n- Led development team of 5 engineers\n- Increased application performance by 40%\n- Implemented React and Node.js solutions\n\nSkills: JavaScript, React, Node.js, Python, SQL`);
        toast.success('Resume uploaded successfully!');
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For PDF and DOC files, we'll simulate content extraction
        setResumeText(`Sample resume content from ${file.name}:\n\nJohn Doe\nSoftware Engineer with 5 years of experience in web development...\n\nExperience:\n- Led development team of 5 engineers\n- Increased application performance by 40%\n- Implemented React and Node.js solutions\n\nSkills: JavaScript, React, Node.js, Python, SQL`);
        toast.success('Resume uploaded and processed successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload resume. Please try again.');
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setResumeText('');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const analyzeResume = async () => {
    if (!resumeText || !jobTitle) {
      toast.error('Please provide both resume content and target job title');
      return;
    }

    setIsAnalyzing(true);
    
    // Enhanced AI analysis simulation with more realistic data
    setTimeout(() => {
      const mockResult: OptimizationResult = {
        overallScore: Math.floor(Math.random() * 20) + 75, // 75-95
        sections: {
          'Professional Summary': {
            score: Math.floor(Math.random() * 15) + 80,
            suggestions: [
              'Strong use of industry-specific terminology',
              'Clear value proposition presented',
              'Good length and readability'
            ],
            improvements: [
              'Add quantified achievements (e.g., "increased sales by 25%")',
              'Include more keywords from the job description to improve ATS matching',
              'Consider adding your years of experience upfront'
            ]
          },
          'Work Experience': {
            score: Math.floor(Math.random() * 20) + 70,
            suggestions: [
              'Chronological format is appropriate',
              'Job titles are clearly stated',
              'Company names are recognizable'
            ],
            improvements: [
              'Use more action verbs (e.g., "spearheaded", "orchestrated", "optimized")',
              'Add specific metrics and numbers to quantify your impact',
              'Include relevant technologies and tools used',
              'Tailor bullet points to match the target job requirements'
            ]
          },
          'Skills': {
            score: Math.floor(Math.random() * 10) + 85,
            suggestions: [
              'Good mix of technical and soft skills',
              'Skills are relevant to the target role',
              'Well-organized presentation'
            ],
            improvements: [
              'Add proficiency levels (e.g., Expert, Intermediate, Beginner)',
              'Group skills by category (Technical, Leadership, etc.)',
              'Include certifications with expiration dates'
            ]
          },
          'Education': {
            score: Math.floor(Math.random() * 15) + 75,
            suggestions: [
              'Education credentials are clearly presented',
              'Degree is relevant to the field'
            ],
            improvements: [
              'Add relevant coursework if recent graduate',
              'Include GPA if above 3.5',
              'Add academic honors or achievements'
            ]
          }
        },
        keywords: {
          missing: ['Machine Learning', 'Data Analytics', 'Python', 'SQL', 'Agile', 'Scrum', 'DevOps', 'Cloud Computing'],
          present: ['JavaScript', 'React', 'Node.js', 'Team Leadership', 'Project Management', 'Web Development'],
          recommended: ['API Development', 'Microservices', 'Docker', 'Kubernetes', 'CI/CD', 'Database Design']
        },
        atsCompatibility: Math.floor(Math.random() * 15) + 80
      };

      setResults(mockResult);
      setIsAnalyzing(false);
      toast.success('Resume analysis completed!');
    }, 3000);
  };

  const downloadOptimizedResume = () => {
    const optimizedContent = generateOptimizedResume();
    const blob = new Blob([optimizedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jobTitle.replace(/\s+/g, '_')}_Optimized_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Optimized resume downloaded!');
  };

  const generateOptimizedResume = () => {
    return `OPTIMIZED RESUME FOR: ${jobTitle.toUpperCase()}
    
${resumeText}

=== AI OPTIMIZATION SUGGESTIONS ===
Overall Score: ${results?.overallScore}/100
ATS Compatibility: ${results?.atsCompatibility}%

MISSING KEYWORDS TO ADD:
${results?.keywords.missing.join(', ')}

RECOMMENDED ADDITIONS:
${results?.keywords.recommended.join(', ')}

KEY IMPROVEMENTS:
${Object.entries(results?.sections || {}).map(([section, data]) => 
  `${section}:\n${data.improvements.map(imp => `- ${imp}`).join('\n')}`
).join('\n\n')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Resume Optimizer</h1>
              <p className="text-gray-600">Upload and optimize your resume with AI-powered analysis</p>
            </div>
          </div>
        </div>

        {!results ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload & Analyze Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Your Resume</h3>
                    <p className="text-gray-600 mb-4">AI is reviewing your resume for optimization opportunities...</p>
                    <Progress value={65} className="w-full" />
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Target Job Title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer, Product Manager"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetJob">Target Job Description (Optional)</Label>
                      <Textarea
                        id="targetJob"
                        placeholder="Paste the job description you're targeting for better optimization"
                        value={targetJob}
                        onChange={(e) => setTargetJob(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                      <Label>Upload Resume File</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="resume-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, TXT (Max 10MB)
                          </p>
                        </label>
                      </div>

                      {uploadedFile && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <File className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">{uploadedFile.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resumeText">Resume Content {!uploadedFile && '*'}</Label>
                      <Textarea
                        id="resumeText"
                        placeholder="Paste your resume text here or upload a file above"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={8}
                        className="min-h-[200px]"
                      />
                    </div>

                    <Button 
                      onClick={analyzeResume}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={(!resumeText || !jobTitle) || uploading}
                    >
                      {uploading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Analyze & Optimize Resume
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">ATS Compatibility Score</h4>
                    <p className="text-sm text-gray-600">Ensure your resume passes automated screening systems</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Section-by-Section Analysis</h4>
                    <p className="text-sm text-gray-600">Detailed feedback on each resume section with specific improvements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Keyword Optimization</h4>
                    <p className="text-sm text-gray-600">Missing and recommended keywords for your target role</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Actionable Improvements</h4>
                    <p className="text-sm text-gray-600">Specific suggestions with downloadable optimized version</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h2>
                <p className="text-gray-600">AI-powered optimization recommendations for "{jobTitle}"</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setResults(null)}>
                  Analyze Another Resume
                </Button>
                <Button onClick={downloadOptimizedResume} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Optimized
                </Button>
              </div>
            </div>

            {/* Overall Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)} mb-2`}>
                      {results.overallScore}/100
                    </div>
                    <p className="text-gray-600 mb-2">Overall Resume Score</p>
                    <Progress value={results.overallScore} className="mt-2" />
                    <Badge className={getScoreBadgeColor(results.overallScore)} variant="outline">
                      {results.overallScore >= 85 ? 'Excellent' : results.overallScore >= 70 ? 'Good' : results.overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.atsCompatibility)} mb-2`}>
                      {results.atsCompatibility}%
                    </div>
                    <p className="text-gray-600 mb-2">ATS Compatibility</p>
                    <Progress value={results.atsCompatibility} className="mt-2" />
                    <Badge className={getScoreBadgeColor(results.atsCompatibility)} variant="outline">
                      {results.atsCompatibility >= 85 ? 'ATS Ready' : results.atsCompatibility >= 70 ? 'Good Match' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Section-by-Section Analysis</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(Object.entries(results.sections).map(([section, data]) => 
                      `${section}: ${data.score}/100\nImprovements: ${data.improvements.join('; ')}`
                    ).join('\n\n'))}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(results.sections).map(([section, analysis]) => (
                  <div key={section} className="border-l-4 border-blue-200 pl-4 hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">{section}</h4>
                      <Badge className={getScoreBadgeColor(analysis.score)} variant="outline">
                        {analysis.score}/100
                      </Badge>
                    </div>
                    
                    {analysis.suggestions.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-green-700 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Strengths
                        </h5>
                        <ul className="space-y-1">
                          {analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.improvements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-orange-700 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Recommended Improvements
                        </h5>
                        <ul className="space-y-1">
                          {analysis.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Keywords Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Keyword Optimization</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`Missing: ${results.keywords.missing.join(', ')}\nRecommended: ${results.keywords.recommended.join(', ')}`)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-red-700 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Missing Keywords ({results.keywords.missing.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.missing.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="text-xs cursor-pointer hover:bg-red-600" 
                             onClick={() => copyToClipboard(keyword)}>
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click any keyword to copy</p>
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Present Keywords ({results.keywords.present.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.present.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Recommended Keywords ({results.keywords.recommended.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.recommended.map((keyword, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 text-xs cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                             onClick={() => copyToClipboard(keyword)}>
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click any keyword to copy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimizer;
