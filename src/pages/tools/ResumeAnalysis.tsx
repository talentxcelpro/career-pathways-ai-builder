import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Target, Star, TrendingUp, CheckCircle, Upload, Sparkles } from "lucide-react";
import { EnhancedProcessingSteps } from "@/components/resume/checker/EnhancedProcessingSteps";
import { EnhancedResumeScoreCard } from "@/components/resume/checker/EnhancedResumeScoreCard";
import { EnhancedDetailedBreakdown } from "@/components/resume/checker/EnhancedDetailedBreakdown";
import { EnhancedResumePreview } from "@/components/resume/checker/EnhancedResumePreview";
import { EnhancedJobTailoring } from "@/components/resume/checker/EnhancedJobTailoring";

const ResumeAnalysis = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [tailoringAnalysis, setTailoringAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const processingSteps = [
    "Parsing resume content",
    "Checking ATS compatibility", 
    "Analyzing content quality",
    "Identifying keyword gaps",
    "Calculating optimization score",
    "Generating recommendations"
  ];

  // Sample data for demonstration
  const sampleScoreData = {
    overallScore: 73,
    totalIssues: 6,
    categories: [
      {
        name: 'ATS Compatibility',
        score: 85,
        issues: 1,
        color: 'bg-blue-100 text-blue-600',
        icon: <CheckCircle className="h-4 w-4" />
      },
      {
        name: 'Content Quality',
        score: 65,
        issues: 3,
        color: 'bg-orange-100 text-orange-600', 
        icon: <FileText className="h-4 w-4" />
      },
      {
        name: 'Keyword Optimization',
        score: 70,
        issues: 2,
        color: 'bg-purple-100 text-purple-600',
        icon: <Target className="h-4 w-4" />
      }
    ]
  };

  const sampleDetailedData = [
    {
      category: 'ATS Compatibility',
      score: 85,
      maxScore: 100,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      checks: [
        {
          name: 'File Format',
          passed: true,
          description: 'Resume is in ATS-friendly PDF format',
          impact: 'high' as const
        },
        {
          name: 'Font Selection', 
          passed: true,
          description: 'Using standard, readable fonts',
          impact: 'medium' as const
        },
        {
          name: 'Section Headers',
          passed: false,
          description: 'Some headers may not be recognized by ATS',
          impact: 'medium' as const,
          suggestion: 'Use standard headers like "Work Experience" instead of "My Journey"'
        }
      ]
    },
    {
      category: 'Content Quality',
      score: 65,
      maxScore: 100,
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-600',
      checks: [
        {
          name: 'Quantified Achievements',
          passed: false,
          description: 'Only 30% of achievements include numbers or metrics',
          impact: 'high' as const,
          suggestion: 'Add specific numbers, percentages, or metrics to demonstrate impact'
        },
        {
          name: 'Action Verbs',
          passed: true,
          description: 'Strong action verbs used effectively',
          impact: 'medium' as const
        },
        {
          name: 'Professional Summary',
          passed: false,
          description: 'Summary lacks specific value proposition',
          impact: 'high' as const,
          suggestion: 'Include specific skills and years of experience in your summary',
          isPremium: true
        }
      ]
    }
  ];

  const sampleResumeData = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    title: 'Software Engineer',
    summary: 'Experienced software engineer with 5+ years developing web applications',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2021 - Present',
        description: 'Led development of microservices architecture resulting in 40% performance improvement'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        school: 'University of Technology',
        year: '2019'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS']
  };

  const handleFileUpload = () => {
    setIsProcessing(true);
    setCurrentStep(0);
    
    // Simulate processing steps
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsCompleted(true);
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const handleJobAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setTailoringAnalysis({
        category: 'Job Match Analysis',
        score: 78,
        checks: [
          {
            name: 'Required Skills Match',
            passed: true,
            description: '8 out of 10 required skills found in your resume',
            suggestion: 'Add experience with Docker and Kubernetes to improve match'
          },
          {
            name: 'Experience Level',
            passed: true, 
            description: 'Your 5+ years experience meets the job requirements',
          },
          {
            name: 'Industry Keywords',
            passed: false,
            description: 'Missing key industry terms like "agile", "CI/CD"',
            suggestion: 'Include relevant methodologies and tools in your experience descriptions'
          }
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnhancedProcessingSteps
            steps={processingSteps}
            currentStep={currentStep}
            fileName="resume.pdf"
            progress={(currentStep + 1) / processingSteps.length * 100}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {!isCompleted ? (
          // Upload Section
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">AI Resume Analysis</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get comprehensive insights about your resume with AI-powered analysis. 
                Improve your chances of landing your dream job.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Upload Your Resume for Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop your resume here</p>
                  <p className="text-gray-600 mb-4">Support PDF, DOC, DOCX files up to 10MB</p>
                  <Button 
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={handleFileUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-lg">ATS Compatibility</h3>
                  </div>
                  <p className="text-gray-600">
                    Check if your resume passes Applicant Tracking Systems used by companies.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-lg">Content Analysis</h3>
                  </div>
                  <p className="text-gray-600">
                    Get insights on keywords, skills, and content optimization.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-lg">Improvement Tips</h3>
                  </div>
                  <p className="text-gray-600">
                    Receive personalized suggestions to enhance your resume.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-center mb-6">What You'll Get</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">ATS Score</h4>
                        <p className="text-gray-600 text-sm">Percentage compatibility with tracking systems</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Keyword Analysis</h4>
                        <p className="text-gray-600 text-sm">Missing keywords for your target role</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Format Review</h4>
                        <p className="text-gray-600 text-sm">Layout and structure recommendations</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Content Suggestions</h4>
                        <p className="text-gray-600 text-sm">Improve descriptions and achievements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Industry Benchmarks</h4>
                        <p className="text-gray-600 text-sm">Compare against successful resumes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Action Plan</h4>
                        <p className="text-gray-600 text-sm">Step-by-step improvement guide</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </>
        ) : (
          // Analysis Results
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Resume Analysis Results
              </h1>
              <p className="text-gray-600">
                Comprehensive AI-powered insights to optimize your resume
              </p>
            </div>

            {/* Main Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Score & Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <EnhancedResumeScoreCard
                  overallScore={sampleScoreData.overallScore}
                  totalIssues={sampleScoreData.totalIssues}
                  categories={sampleScoreData.categories}
                />
                
                <EnhancedDetailedBreakdown categories={sampleDetailedData} />
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <EnhancedResumePreview
                  originalData={sampleResumeData}
                  enhancedData={sampleResumeData}
                  showEnhanced={false}
                />
              </div>
            </div>

            {/* Job Tailoring Section */}
            <EnhancedJobTailoring
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onAnalyze={handleJobAnalysis}
              isAnalyzing={isAnalyzing}
              tailoringAnalysis={tailoringAnalysis}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;
