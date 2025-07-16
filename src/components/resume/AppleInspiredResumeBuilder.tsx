import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Wand2, 
  Download, 
  CheckCircle,
  Plus,
  Eye,
  Save,
  Sparkles,
  Target,
  Brain,
  ArrowRight,
  Globe,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { EnhancedResumeProcessor } from '@/services/enhancedResumeProcessor';
import { useNavigate } from 'react-router-dom';
import { AppleInspiredFileUpload } from './AppleInspiredFileUpload';
import { AppleInspiredProcessing } from './AppleInspiredProcessing';
import { AppleInspiredTemplateGallery } from './AppleInspiredTemplateGallery';
import { MobileResumeViewer, MobileTouchFileUpload } from './MobileOptimizedComponents';
import { AdvancedExportFeatures } from './AdvancedExportFeatures';
import { ProfessionalPortfolioBuilder } from './ProfessionalPortfolioBuilder';
import { RealTimeCollaboration } from './RealTimeCollaboration';
import { ResumeAnalytics } from './ResumeAnalytics';
import { CareerGuidance } from './CareerGuidance';
import { InterviewPrep } from './InterviewPrep';
import { useEnhancedResumeUpload } from '@/hooks/useEnhancedResumeUpload';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: any[];
  education: any[];
  skills: string[];
  projects: any[];
  certifications: any[];
  awards: any[];
}

export const AppleInspiredResumeBuilder = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Enhanced upload hook
  const {
    isProcessing,
    processingProgress,
    processingStatus,
    extractedData,
    livePreview,
    processResume,
    resetUpload
  } = useEnhancedResumeUpload();

  const [currentStep, setCurrentStep] = useState<'welcome' | 'upload' | 'processing' | 'templates' | 'export' | 'portfolio' | 'collaborate' | 'analytics' | 'career' | 'interview' | 'complete'>('welcome');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: []
  });
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // File upload handlers
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadedFile(file);
    setCurrentStep('processing');
    
    try {
      await processResume(files);
      
      // Move to template selection after processing
      setTimeout(() => {
        setCurrentStep('templates');
      }, 2000);
      
    } catch (error) {
      console.error('Resume processing failed:', error);
      setCurrentStep('upload');
    }
  }, [processResume]);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    if (!extractedData || !user) return;
    
    setSelectedTemplate(templateId);
    toast.loading('Creating your resume...', { id: 'create-resume' });
    
    try {
      // Save resume to database
      const { data: savedResume, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume - ${extractedData.personalInfo?.fullName || new Date().toLocaleDateString()}`,
          content: extractedData as any,
          template_id: templateId,
          is_primary: false
        })
        .select()
        .single();

      if (error) throw error;

      setResumeId(savedResume.id);
      setCurrentStep('complete');
      toast.success('Resume created successfully!', { id: 'create-resume' });
      
      // Navigate to editor after 2 seconds
      setTimeout(() => {
        navigate(`/resume-builder/edit/${savedResume.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to create resume', { id: 'create-resume' });
    }
  }, [extractedData, user, navigate]);

  // Auto-advance from welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 'welcome') {
        setCurrentStep('upload');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to use the resume builder</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {currentStep === 'welcome' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fadeInScale">
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center animate-slideInUp">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  AI Resume Builder
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                  Transform your career with our intelligent resume builder. Upload your existing resume or start fresh.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: <Upload className="h-6 w-6" />, title: "Smart Upload", desc: "AI extracts content from any format" },
                  { icon: <Wand2 className="h-6 w-6" />, title: "AI Enhancement", desc: "Intelligent optimization for ATS" },
                  { icon: <Eye className="h-6 w-6" />, title: "Live Preview", desc: "See changes in real-time" }
                ].map((feature, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button
                onClick={() => setCurrentStep('upload')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-medium shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'upload' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Upload your existing resume in any format, or start from scratch. Our AI will extract and enhance your content automatically.
                </p>
              </div>
              
              {isMobile ? (
                <MobileTouchFileUpload
                  onFileSelect={handleFileUpload}
                  className="animate-fadeInScale"
                />
              ) : (
                <AppleInspiredFileUpload
                  onFileSelect={handleFileUpload}
                  uploadedFile={uploadedFile}
                  onRemoveFile={() => setUploadedFile(null)}
                  className="animate-fadeInScale"
                />
              )}
              
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/resume-builder/new')}
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start from Scratch
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <AppleInspiredProcessing
              isProcessing={isProcessing}
              progress={processingProgress}
              status={processingStatus}
              file={uploadedFile}
              livePreview={livePreview}
              className="animate-fadeInScale"
            />
          </div>
        )}

        {currentStep === 'templates' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select a professional template that matches your industry and personal style. All templates are ATS-optimized.
                </p>
              </div>
              
              <AppleInspiredTemplateGallery
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
                resumeData={extractedData}
                className="animate-fadeInScale"
              />
            </div>
          </div>
        )}

        {currentStep === 'export' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Export Your Resume</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose from multiple export formats and sharing options to get your resume to employers.
                </p>
              </div>
              
              <AdvancedExportFeatures
                resumeData={resumeData}
                resumeId={resumeId || 'resume'}
                className="animate-fadeInScale"
              />
              
              <div className="mt-8 text-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('portfolio')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Build Portfolio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('collaborate')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Share & Collaborate
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'portfolio' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Build Your Portfolio</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Showcase your projects and create an interactive portfolio that complements your resume.
                </p>
              </div>
              
              <ProfessionalPortfolioBuilder
                resumeData={resumeData}
                onUpdate={(portfolioData) => {
                  console.log('Portfolio updated:', portfolioData);
                  toast.success('Portfolio updated successfully!');
                }}
                className="animate-fadeInScale"
              />
              
              <div className="mt-8 text-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('export')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Options
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('collaborate')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Share & Collaborate
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'collaborate' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Share & Collaborate</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Invite others to review your resume, get feedback, and collaborate in real-time.
                </p>
              </div>
              
              <RealTimeCollaboration
                resumeId={resumeId || 'resume'}
                isOwner={true}
                className="animate-fadeInScale"
              />
              
              <div className="mt-8 text-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('analytics')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  📊 Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('career')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  🎯 Career Guidance
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('interview')}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  🎤 Interview Prep
                </Button>
                <Button
                  onClick={() => setCurrentStep('complete')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Resume
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'analytics' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Resume Analytics</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Track your resume performance and get insights to improve your job search success.
                </p>
              </div>
              
              <ResumeAnalytics
                resumeId={resumeId || 'resume'}
                className="animate-fadeInScale"
              />
            </div>
          </div>
        )}

        {currentStep === 'career' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Guidance</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get AI-powered career path recommendations and skill gap analysis.
                </p>
              </div>
              
              <CareerGuidance
                resumeData={resumeData}
                className="animate-fadeInScale"
              />
            </div>
          </div>
        )}

        {currentStep === 'interview' && (
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 animate-slideInUp">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Preparation</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Practice with AI-powered mock interviews and get ready for your dream job.
                </p>
              </div>
              
              <InterviewPrep className="animate-fadeInScale" />
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fadeInScale">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center animate-slideInUp">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Resume Complete!</h2>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Your professional resume with portfolio and collaboration features is ready to help you land your dream job.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: <Target className="h-5 w-5" />, label: "ATS Optimized", value: "98%" },
                  { icon: <Brain className="h-5 w-5" />, label: "AI Enhanced", value: "100%" },
                  { icon: <Briefcase className="h-5 w-5" />, label: "Portfolio Ready", value: "✓" },
                  { icon: <Globe className="h-5 w-5" />, label: "Collaboration", value: "✓" }
                ].map((stat, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="mx-auto w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-2">
                        {stat.icon}
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/resume-builder/dashboard')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('export')}
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};