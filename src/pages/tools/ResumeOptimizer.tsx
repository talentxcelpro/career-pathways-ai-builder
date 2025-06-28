
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
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const [jobTitle, setJobTitle] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<OptimizationResult | null>(null);

  const analyzeResume = async () => {
    if (!resumeText || !jobTitle) {
      toast.error('Please provide both resume content and target job title');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResult: OptimizationResult = {
        overallScore: 78,
        sections: {
          'Professional Summary': {
            score: 85,
            suggestions: [
              'Great use of action verbs and quantified achievements',
              'Strong industry-specific terminology'
            ],
            improvements: [
              'Consider adding more specific metrics',
              'Tailor summary to match job requirements better'
            ]
          },
          'Work Experience': {
            score: 72,
            suggestions: [
              'Good chronological structure',
              'Relevant experience highlighted'
            ],
            improvements: [
              'Add more quantified results (numbers, percentages)',
              'Include more keywords from the job description',
              'Use stronger action verbs'
            ]
          },
          'Skills': {
            score: 90,
            suggestions: [
              'Comprehensive skill list',
              'Good mix of technical and soft skills'
            ],
            improvements: [
              'Consider organizing skills by category',
              'Add proficiency levels where appropriate'
            ]
          },
          'Education': {
            score: 80,
            suggestions: [
              'Clear educational background',
              'Relevant certifications included'
            ],
            improvements: [
              'Consider adding relevant coursework',
              'Include GPA if above 3.5'
            ]
          }
        },
        keywords: {
          missing: ['Machine Learning', 'Data Analytics', 'Python', 'SQL', 'Agile'],
          present: ['JavaScript', 'React', 'Team Leadership', 'Project Management'],
          recommended: ['Cloud Computing', 'DevOps', 'Microservices', 'API Development']
        },
        atsCompatibility: 85
      };

      setResults(mockResult);
      setIsAnalyzing(false);
      toast.success('Resume analysis completed!');
    }, 4000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
              <p className="text-gray-600">Optimize your resume with AI-powered analysis and suggestions</p>
            </div>
          </div>
        </div>

        {!results ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Your Resume</h3>
                    <p className="text-gray-600 mb-4">AI is reviewing your resume for optimization opportunities...</p>
                    <Progress value={65} className="w-full" />
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

                    <div className="space-y-2">
                      <Label htmlFor="resumeText">Resume Content *</Label>
                      <Textarea
                        id="resumeText"
                        placeholder="Paste your resume text here or describe your experience, skills, and achievements"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={8}
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Or drag and drop your resume file here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX supported
                      </p>
                    </div>

                    <Button 
                      onClick={analyzeResume}
                      className="w-full"
                      disabled={!resumeText || !jobTitle}
                    >
                      Analyze & Optimize Resume
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
                    <p className="text-sm text-gray-600">Detailed feedback on each resume section</p>
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
                    <p className="text-sm text-gray-600">Specific suggestions to enhance your resume</p>
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
                <p className="text-gray-600">AI-powered optimization recommendations</p>
              </div>
              <Button variant="outline" onClick={() => setResults(null)}>
                Analyze Another Resume
              </Button>
            </div>

            {/* Overall Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)} mb-2`}>
                      {results.overallScore}/100
                    </div>
                    <p className="text-gray-600">Overall Resume Score</p>
                    <Progress value={results.overallScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.atsCompatibility)} mb-2`}>
                      {results.atsCompatibility}%
                    </div>
                    <p className="text-gray-600">ATS Compatibility</p>
                    <Progress value={results.atsCompatibility} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Section-by-Section Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(results.sections).map(([section, analysis]) => (
                  <div key={section} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">{section}</h4>
                      <Badge className={getScoreBadgeColor(analysis.score)}>
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
                          Improvements
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
                <CardTitle>Keyword Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-red-700 mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.missing.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-700 mb-3">Present Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.present.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-3">Recommended Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.recommended.map((keyword, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
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
