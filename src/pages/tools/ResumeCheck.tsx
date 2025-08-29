import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, Target, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ATSAnalysis {
  overallScore: number;
  sections: {
    formatting: { score: number; issues: string[]; suggestions: string[] };
    keywords: { score: number; matched: string[]; missing: string[]; suggestions: string[]; issues?: string[] };
    structure: { score: number; issues: string[]; suggestions: string[] };
    content: { score: number; issues: string[]; suggestions: string[] };
  };
  recommendations: string[];
  passedChecks: string[];
  failedChecks: string[];
}

const ResumeCheck = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setCurrentStep(1);
      toast.success('Resume uploaded successfully!');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

  const analyzeResume = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const { data, error } = await supabase.functions.invoke('ai-ats-analyzer', {
        body: {
          file: uploadedFile,
          jobDescription: jobDescription || undefined
        }
      });

      if (error) throw error;
      
      setAnalysis(data);
      setCurrentStep(2);
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const steps = [
    {
      id: 'upload',
      title: 'Upload Resume',
      description: 'Upload your resume for ATS analysis',
      component: (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </h3>
            <p className="text-slate-600 mb-4">
              Drag and drop your resume or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Supports PDF, DOC, and DOCX files (max 10MB)
            </p>
          </div>

          {uploadedFile && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'configure',
      title: 'Job Targeting (Optional)',
      description: 'Add job description for targeted analysis',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description (Optional)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get targeted keyword analysis..."
              className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-sm text-slate-500 mt-2">
              Adding a job description will provide more accurate keyword matching and suggestions.
            </p>
          </div>

          <Button
            onClick={analyzeResume}
            className="w-full"
            size="lg"
            disabled={!uploadedFile || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Start ATS Analysis
              </>
            )}
          </Button>
        </div>
      )
    },
    {
      id: 'results',
      title: 'Analysis Results',
      description: 'View your ATS compatibility score and recommendations',
      component: analysis ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className={`${getScoreBg(analysis.overallScore)} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Overall ATS Score</h3>
                  <p className="text-slate-600">Your resume's compatibility with ATS systems</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}%
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(analysis.overallScore / 20)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.sections).map(([key, section]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize">{key}</h4>
                    <Badge variant="outline" className={getScoreColor(section.score)}>
                      {section.score}%
                    </Badge>
                  </div>
                  <Progress value={section.score} className="h-2 mb-3" />
                  
                  {/* Handle different section types */}
                  {key === 'keywords' ? (
                    <div className="space-y-2">
                      {(section as any).missing?.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Missing Keywords
                          </h5>
                          {(section as any).missing.slice(0, 2).map((keyword: string, i: number) => (
                            <p key={i} className="text-xs text-red-600">• {keyword}</p>
                          ))}
                        </div>
                      )}
                      {(section as any).matched?.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Matched Keywords
                          </h5>
                          {(section as any).matched.slice(0, 2).map((keyword: string, i: number) => (
                            <p key={i} className="text-xs text-green-600">• {keyword}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {(section as any).issues?.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="text-sm font-medium text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Issues
                          </h5>
                          {(section as any).issues.slice(0, 2).map((issue: string, i: number) => (
                            <p key={i} className="text-xs text-red-600">• {issue}</p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {section.suggestions?.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <h5 className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Suggestions
                      </h5>
                      {section.suggestions.slice(0, 2).map((suggestion, i) => (
                        <p key={i} className="text-xs text-blue-600">• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Recommendations</h3>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.passedChecks.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Passed Checks
                  </h4>
                  {analysis.passedChecks.map((check, i) => (
                    <p key={i} className="text-sm text-green-700 mb-1">✓ {check}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            {analysis.failedChecks.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed Checks
                  </h4>
                  {analysis.failedChecks.map((check, i) => (
                    <p key={i} className="text-sm text-red-700 mb-1">✗ {check}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null
    }
  ];

  return (
    <ToolLayout
      title="Resume ATS Checker"
      description="Analyze your resume's compatibility with Applicant Tracking Systems (ATS) and get actionable insights to improve your chances of getting noticed by recruiters."
      category="resume"
      estimatedTime="5-10 min"
      popularity={92}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      results={analysis}
      isProcessing={isAnalyzing}
      onSave={() => toast.success('Analysis saved to your dashboard!')}
      onExport={() => toast.success('Analysis exported as PDF!')}
      onShare={() => toast.success('Analysis link copied to clipboard!')}
    />
  );
};

export default ResumeCheck;