
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Sparkles, Download, Eye, Share } from "lucide-react";
import { EnhancedFileUpload } from "@/components/resume/EnhancedFileUpload";
import { AnalysisResults } from "@/components/resume/AnalysisResults";
import { JobDescriptionInput } from "@/components/resume/JobDescriptionInput";
import { ResumeAnalysisService } from "@/services/resumeAnalysisService";

const AppleResumeChecker = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const steps = [
    { title: 'Upload Resume', description: 'Upload your resume for analysis' },
    { title: 'Job Details', description: 'Add target job information (optional)' },
    { title: 'Analysis', description: 'AI-powered resume analysis' },
    { title: 'Results', description: 'View detailed feedback and suggestions' }
  ];

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setCurrentStep(1);
    }
  };

  const handleJobDescriptionSubmit = (data: { description: string; jobTitle: string; company: string; industry: string }) => {
    setJobDescription(data.description);
    setCurrentStep(2);
    startAnalysis();
  };

  const skipJobDescription = () => {
    setCurrentStep(2);
    startAnalysis();
  };

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressSteps = [10, 25, 40, 60, 80, 95, 100];
      for (const step of progressSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Perform actual analysis
      const analysisService = new ResumeAnalysisService();
      const results = await analysisService.analyzeResume(uploadedFile, jobDescription);
      
      setAnalysisResults(results);
      setCurrentStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetChecker = () => {
    setCurrentStep(0);
    setUploadedFile(null);
    setJobDescription('');
    setAnalysisResults(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/resume-builder')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Resume Checker
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free AI Resume Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant feedback on your resume with our AI-powered analysis. 
            Check ATS compatibility, optimize keywords, and improve your content.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep]?.title}
            </h2>
            <p className="text-gray-600">{steps[currentStep]?.description}</p>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <div className="max-w-4xl mx-auto">
            <EnhancedFileUpload
              onFileSelect={handleFileUpload}
              isProcessing={false}
              processingProgress={0}
              processingStatus=""
            />
            
            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">ATS Compatibility</h3>
                  <p className="text-sm text-gray-600">Ensure your resume passes applicant tracking systems</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI Enhancement</h3>
                  <p className="text-sm text-gray-600">Get intelligent suggestions to improve your content</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Keyword Optimization</h3>
                  <p className="text-sm text-gray-600">Match your resume to job requirements</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <JobDescriptionInput
              onSubmit={handleJobDescriptionSubmit}
              onSkip={skipJobDescription}
              uploadedFileName={uploadedFile?.name}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <Sparkles className="h-16 w-16 text-blue-500 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">Analyzing Your Resume</h3>
                <p className="text-gray-600 mb-6">
                  Our AI is performing a comprehensive analysis of your resume
                </p>
                
                <div className="space-y-4">
                  <Progress value={progress} className="w-full" />
                  <div className="text-sm text-gray-500">
                    {progress < 30 && "Extracting content from your resume..."}
                    {progress >= 30 && progress < 60 && "Analyzing ATS compatibility..."}
                    {progress >= 60 && progress < 90 && "Checking keyword optimization..."}
                    {progress >= 90 && "Generating enhancement suggestions..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && analysisResults && (
          <div className="space-y-8">
            <AnalysisResults results={analysisResults} />
            
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="flex items-center justify-center gap-2 h-12">
                  <FileText className="h-4 w-4" />
                  Edit & Customize
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2 h-12">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2 h-12">
                  <Share className="h-4 w-4" />
                  Share Online
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2 h-12">
                  <Eye className="h-4 w-4" />
                  View Analytics
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" onClick={resetChecker} className="w-full">
                  Check Another Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppleResumeChecker;
