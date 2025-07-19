
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppleButton } from "@/components/ui/apple-button";
import { AppleCard, AppleCardContent, AppleCardHeader, AppleCardTitle } from "@/components/ui/apple-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, FileText, CheckCircle, XCircle, AlertCircle, Brain, Sparkles, TrendingUp, Target, Zap, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';

const AppleResumeChecker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    overallScore: 0,
    atsScore: 0,
    sections: {
      contact: { score: 0, status: 'incomplete', feedback: [] },
      summary: { score: 0, status: 'incomplete', feedback: [] },
      experience: { score: 0, status: 'incomplete', feedback: [] },
      education: { score: 0, status: 'incomplete', feedback: [] },
      skills: { score: 0, status: 'incomplete', feedback: [] }
    },
    suggestions: []
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    analyzeResume(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results
    const mockAnalysis = {
      overallScore: 85,
      atsScore: 78,
      sections: {
        contact: { 
          score: 95, 
          status: 'excellent', 
          feedback: ['Complete contact information', 'Professional email address'] 
        },
        summary: { 
          score: 70, 
          status: 'good', 
          feedback: ['Could be more specific about achievements', 'Consider adding quantifiable results'] 
        },
        experience: { 
          score: 88, 
          status: 'excellent', 
          feedback: ['Strong action verbs used', 'Good quantification of achievements'] 
        },
        education: { 
          score: 82, 
          status: 'good', 
          feedback: ['All relevant education included', 'Consider adding relevant coursework'] 
        },
        skills: { 
          score: 75, 
          status: 'good', 
          feedback: ['Good mix of technical and soft skills', 'Could organize by skill categories'] 
        }
      },
      suggestions: [
        'Add more quantifiable achievements in your experience section',
        'Include industry-specific keywords for better ATS optimization',
        'Consider adding a projects section to showcase your work',
        'Use consistent formatting throughout the document'
      ]
    };

    setAnalysisData(mockAnalysis);
    setIsAnalyzing(false);
    setAnalysisComplete(true);

    toast({
      title: "Analysis Complete!",
      description: `Your resume scored ${mockAnalysis.overallScore}% overall.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-work': return 'text-yellow-600 bg-yellow-100';
      case 'incomplete': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs-work': return <AlertCircle className="w-4 h-4" />;
      case 'incomplete': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AppleButton variant="ghost" onClick={() => navigate('/resume-builder')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </AppleButton>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered Analysis
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            AI Resume Checker
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Get instant feedback on your resume with our AI-powered analysis. Optimize for ATS systems and improve your chances of landing interviews.
          </p>
        </motion.div>

        {!uploadedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AppleCard className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-apple-light">
              <AppleCardContent className="p-12">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50/50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-4">
                    {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                  </h3>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Drag and drop your resume file here, or click to browse. We support PDF, DOC, and DOCX formats.
                  </p>
                  <AppleButton size="lg" variant="premium">
                    <FileText className="w-5 h-5 mr-2" />
                    Choose File
                  </AppleButton>
                  <p className="text-xs text-text-secondary mt-4">
                    Maximum file size: 10MB
                  </p>
                </div>
              </AppleCardContent>
            </AppleCard>
          </motion.div>
        )}

        {/* Analysis Loading */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <AppleCard className="bg-white/80 backdrop-blur-sm border-0 shadow-apple-light">
                <AppleCardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-10 h-10 text-purple-600" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-4">
                    Analyzing Your Resume
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Our AI is analyzing your resume structure, content, and ATS compatibility...
                  </p>
                  <Progress value={60} className="w-full max-w-md mx-auto" />
                </AppleCardContent>
              </AppleCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Overall Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AppleCard className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-apple-medium">
                  <AppleCardHeader>
                    <AppleCardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      Overall Score
                    </AppleCardTitle>
                  </AppleCardHeader>
                  <AppleCardContent>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-text-primary mb-2">
                        {analysisData.overallScore}%
                      </div>
                      <p className="text-text-secondary">
                        Your resume is performing well with room for improvement
                      </p>
                    </div>
                  </AppleCardContent>
                </AppleCard>

                <AppleCard className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-apple-medium">
                  <AppleCardHeader>
                    <AppleCardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      ATS Compatibility
                    </AppleCardTitle>
                  </AppleCardHeader>
                  <AppleCardContent>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-text-primary mb-2">
                        {analysisData.atsScore}%
                      </div>
                      <p className="text-text-secondary">
                        Good compatibility with applicant tracking systems
                      </p>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              </div>

              {/* Section Analysis */}
              <AppleCard className="bg-white/80 backdrop-blur-sm border-0 shadow-apple-light">
                <AppleCardHeader>
                  <AppleCardTitle className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-orange-500" />
                    Section Analysis
                  </AppleCardTitle>
                </AppleCardHeader>
                <AppleCardContent>
                  <div className="space-y-6">
                    {Object.entries(analysisData.sections).map(([key, section]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <Badge className={`${getStatusColor(section.status)} border-0`}>
                            {getStatusIcon(section.status)}
                            <span className="ml-1 capitalize">{section.status.replace('-', ' ')}</span>
                          </Badge>
                          <div>
                            <h4 className="font-medium text-text-primary capitalize">{key}</h4>
                            <p className="text-sm text-text-secondary">Score: {section.score}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-text-primary">{section.score}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AppleCardContent>
              </AppleCard>

              {/* AI Suggestions */}
              <AppleCard className="bg-white/80 backdrop-blur-sm border-0 shadow-apple-light">
                <AppleCardHeader>
                  <AppleCardTitle className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    AI Improvement Suggestions
                  </AppleCardTitle>
                </AppleCardHeader>
                <AppleCardContent>
                  <div className="space-y-4">
                    {analysisData.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-purple-50/50 rounded-xl">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <p className="text-text-secondary">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </AppleCardContent>
              </AppleCard>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AppleButton size="lg" variant="premium" onClick={() => navigate('/resume-builder/new')}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Optimized Resume
                </AppleButton>
                <AppleButton size="lg" variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </AppleButton>
                <AppleButton size="lg" variant="ghost">
                  <Eye className="w-5 h-5 mr-2" />
                  View Details
                </AppleButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppleResumeChecker;
