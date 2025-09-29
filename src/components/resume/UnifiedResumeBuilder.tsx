import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Wand2, 
  Download, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Save,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { EnhancedResumeProcessor } from '@/services/enhancedResumeProcessor';
import { ATSOptimizationPanel } from './ATSOptimizationPanel';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FileUploadZone } from './upload/FileUploadZone';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// PDF.js loaded dynamically to prevent memory issues
import { configurePDFWorker } from '@/utils/pdfWorkerConfig';

// Initialize PDF worker
configurePDFWorker().catch(console.error);

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

export const UnifiedResumeBuilder = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  
  // State management
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'enhance' | 'export'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
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
  const [atsScore, setAtsScore] = useState<number>(0);

  // File upload and extraction
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  // Button click handler
  const handleChooseFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Enhanced drag and drop handlers
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setUploadError('');
    }
  }, []);

  // File selection handler
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setUploadError('');
    }
  }, []);

  // Remove file handler
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Process resume handler
  const handleProcessResume = useCallback(async () => {
    if (uploadedFile) {
      await processFile(uploadedFile);
    }
  }, [uploadedFile]);

  const processFile = useCallback(async (file: File) => {
    console.log('Starting file processing for:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Phase 1: Authentication & User Feedback
    if (!user) {
      toast.error('Please sign in to upload a resume');
      return;
    }

    // Phase 2: File Validation with detailed logging
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    console.log('File validation - Type:', file.type, 'Size:', file.size, 'Allowed:', allowedTypes.includes(file.type));

    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      toast.error(`Please upload a PDF, DOCX, or TXT file. Current type: ${file.type}`);
      return;
    }

    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      toast.error(`File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (file.size < 100) {
      console.error('File too small:', file.size);
      toast.error('File appears to be empty');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Validating file...');

    try {
      // Step 1: File validation complete
      setProcessingProgress(10);
      setProcessingStatus('Initializing processor...');
      console.log('File validation passed, starting processor');

      // Step 2: Initialize processor with enhanced error handling
      let extractedContent;
      try {
        setProcessingProgress(20);
        setProcessingStatus('Extracting content with AI...');

        console.log('Creating EnhancedResumeProcessor...');
        const processor = new EnhancedResumeProcessor();
        console.log('Processor created, starting processResume...');
        
        extractedContent = await processor.processResume(file);
        console.log('AI extraction result:', extractedContent);
        
        if (!extractedContent || !extractedContent.success) {
          throw new Error('AI extraction did not return valid content');
        }

        setProcessingProgress(60);
        setProcessingStatus('Processing extracted content...');

      } catch (processingError) {
        console.warn('AI processing failed, using fallback extraction:', processingError);
        setProcessingStatus('Using fallback extraction method...');
        setProcessingProgress(40);
        
        // Phase 4: Enhanced fallback extraction
        const fallbackName = file.name.replace(/\.(pdf|docx?|txt)$/i, '').replace(/^(resume|cv)[\s\-_]*/i, '').trim();
        
        extractedContent = {
          personalInfo: { 
            fullName: fallbackName || 'Your Name', 
            email: user.email || '', 
            phone: '', 
            location: '', 
            summary: 'Professional summary will be added here. Please update with your experience and skills.',
            confidence: 0.3 
          },
          experience: [{
            title: 'Job Title',
            company: 'Company Name',
            location: 'City, State',
            startDate: new Date().getFullYear().toString(),
            endDate: 'Present',
            description: 'Add your job responsibilities and achievements here.',
            achievements: [],
            technologies: [],
            keywords: [],
            confidence: 0.3
          }],
          education: [{
            degree: 'Degree',
            school: 'University Name',
            location: 'City, State',
            startDate: (new Date().getFullYear() - 4).toString(),
            endDate: new Date().getFullYear().toString(),
            gpa: '',
            honors: '',
            relevantCoursework: [],
            confidence: 0.3
          }],
          skills: { 
            technical: { 
              programming: ['Add your programming languages'], 
              frameworks: ['Add frameworks you know'], 
              databases: ['Add databases you work with'], 
              tools: ['Add tools you use'], 
              cloud: ['Add cloud platforms'], 
              confidence: 0.3 
            }, 
            soft: ['Communication', 'Leadership', 'Problem Solving'], 
            languages: [{ language: 'English', proficiency: 'Native' }], 
            certifications: [] 
          },
          projects: [],
          certifications: [],
          awards: [],
          success: true,
          metadata: { fileName: file.name, extractionMethod: 'fallback', processingVersion: '2.0' }
        };
        
        toast.warning('Could not extract content automatically. Template created for manual entry.');
      }

      setProcessingProgress(70);
      setProcessingStatus('Converting to resume format...');

      // Step 3: Convert to our format with robust validation
      const convertedData: ResumeData = {
        personalInfo: {
          fullName: extractedContent.personalInfo?.fullName || '',
          email: extractedContent.personalInfo?.email || user.email || '',
          phone: extractedContent.personalInfo?.phone || '',
          location: extractedContent.personalInfo?.location || '',
          summary: extractedContent.personalInfo?.summary || ''
        },
        experience: Array.isArray(extractedContent.experience) ? extractedContent.experience.map(exp => ({
          id: exp.id || Date.now().toString() + Math.random(),
          company: exp.company || '',
          position: exp.title || exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          description: exp.description || '',
          achievements: exp.achievements || []
        })) : [],
        education: Array.isArray(extractedContent.education) ? extractedContent.education.map(edu => ({
          id: edu.id || Date.now().toString() + Math.random(),
          school: edu.school || '',
          degree: edu.degree || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || ''
        })) : [],
        skills: extractedContent.skills?.technical ? [
          ...(extractedContent.skills.technical.programming || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.technical.frameworks || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.technical.databases || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.technical.tools || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.technical.cloud || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.soft || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean),
          ...(extractedContent.skills.languages?.map(lang => 
            typeof lang === 'string' ? lang : lang?.language || lang?.skill || lang?.name || '') || []).filter(Boolean),
          ...(extractedContent.skills.certifications || []).map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean)
        ].filter(Boolean) : Array.isArray(extractedContent.skills) 
          ? extractedContent.skills.map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '').filter(Boolean) 
          : [],
        projects: Array.isArray(extractedContent.projects) ? extractedContent.projects : [],
        certifications: Array.isArray(extractedContent.certifications) ? extractedContent.certifications : [],
        awards: Array.isArray(extractedContent.awards) ? extractedContent.awards : []
      };

      console.log('Converted data:', convertedData);
      setProcessingProgress(80);
      setProcessingStatus('Saving resume to your account...');

      // Step 4: Save to database with error handling
      const { data: savedResume, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume - ${new Date().toLocaleDateString()}`,
          content: convertedData as any,
          is_primary: false
        })
        .select()
        .single();

      if (error) {
        console.error('Database save error:', error);
        throw new Error(`Failed to save resume: ${error.message}`);
      }

      console.log('Resume saved to database:', savedResume.id);
      setResumeId(savedResume.id);
      setResumeData(convertedData);
      setProcessingProgress(90);
      setProcessingStatus('Calculating ATS score...');
      
      // Step 5: Calculate initial ATS score with error handling
      try {
        const { analyzeATSCompatibility } = await import('@/utils/atsOptimization');
        const atsAnalysis = analyzeATSCompatibility(convertedData);
        setAtsScore(atsAnalysis.overall);
        console.log('ATS score calculated:', atsAnalysis.overall);
      } catch (atsError) {
        console.warn('ATS analysis failed:', atsError);
        setAtsScore(65); // Default score
      }

      setProcessingProgress(100);
      setProcessingStatus('Complete!');
      
      // Phase 5: Success feedback
      const hasContent = convertedData.personalInfo.fullName || 
                        convertedData.experience.length > 0 || 
                        convertedData.skills.length > 0;
      
      if (hasContent) {
        toast.success('Resume uploaded and processed successfully!');
      } else {
        toast.success('Resume uploaded! Please add your information in the editor.');
      }
      
      // Move to edit step
      setTimeout(() => {
        console.log('Moving to edit step');
        setCurrentStep('edit');
      }, 1000);
      
    } catch (error) {
      console.error('Upload/extraction failed:', error);
      setProcessingStatus('Failed to process file');
      
      // Phase 3: Enhanced Error Handling
      let errorMessage = 'Failed to process resume. ';
      
      if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        errorMessage += 'Please try signing in again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('file') || error.message?.includes('extract')) {
        errorMessage += 'The file might be corrupted or in an unsupported format.';
      } else if (error.message?.includes('Database')) {
        errorMessage += 'Database error occurred. Please try again.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      toast.error(errorMessage);
      
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // AI Enhancement
  const enhanceResume = useCallback(async (type: 'ats' | 'professional' | 'achievements') => {
    if (!resumeData || !resumeId) return;

    setIsProcessing(true);
    setProcessingStatus(`Enhancing resume for ${type}...`);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          summary: resumeData.personalInfo.summary,
          experience: resumeData.experience,
          skills: resumeData.skills,
          education: resumeData.education,
          enhancementType: type
        }
      });

      if (error) throw error;

      // Update resume data
      const enhancedData = {
        ...resumeData,
        personalInfo: { ...resumeData.personalInfo, summary: data.summary || resumeData.personalInfo.summary },
        experience: data.experience || resumeData.experience,
        skills: data.skills || resumeData.skills,
        education: data.education || resumeData.education
      };

      setResumeData(enhancedData);

      // Update in database
      await supabase
        .from('ai_resumes')
        .update({ content: enhancedData as any })
        .eq('id', resumeId);

      // Recalculate ATS score
      const { analyzeATSCompatibility } = await import('@/utils/atsOptimization');
      const atsAnalysis = analyzeATSCompatibility(enhancedData);
      setAtsScore(atsAnalysis.overall);

      toast.success(`Resume enhanced for ${type}!`);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Failed to enhance resume');
    } finally {
      setIsProcessing(false);
    }
  }, [resumeData, resumeId]);

  // Enhanced export functions with better error handling
  const exportPDF = useCallback(async () => {
    if (!resumeData || !resumeData.personalInfo) {
      toast.error('No resume data available for export');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus('Preparing PDF export...');
      setProcessingProgress(10);

      // Check if resume preview element exists
      const previewElement = document.getElementById('resume-preview');
      if (!previewElement) {
        toast.error('Resume preview not found. Please switch to Preview tab first.');
        return;
      }

      setProcessingStatus('Generating PDF...');
      setProcessingProgress(50);
      
      const { exportToPDF } = await import('@/utils/exportResume');
      const filename = `${(resumeData.personalInfo.fullName || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      setProcessingProgress(80);
      await exportToPDF('resume-preview', filename);
      
      setProcessingProgress(100);
      setProcessingStatus('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      const errorMessage = error.message || 'Failed to generate PDF';
      toast.error(errorMessage);
      setProcessingStatus('PDF export failed');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingStatus('');
      }, 2000);
    }
  }, [resumeData]);

  const exportDOCX = useCallback(async () => {
    if (!resumeData || !resumeData.personalInfo) {
      toast.error('No resume data available for export');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus('Preparing DOCX export...');
      setProcessingProgress(10);
      
      setProcessingStatus('Generating DOCX...');
      setProcessingProgress(50);
      
      const { exportToDOCX } = await import('@/utils/exportResume');
      const filename = `${(resumeData.personalInfo.fullName || 'resume').replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
      
      setProcessingProgress(80);
      await exportToDOCX(resumeData, filename);
      
      setProcessingProgress(100);
      setProcessingStatus('DOCX exported successfully!');
      
    } catch (error) {
      console.error('DOCX export error:', error);
      const errorMessage = error.message || 'Failed to generate DOCX';
      toast.error(errorMessage);
      setProcessingStatus('DOCX export failed');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingStatus('');
      }, 2000);
    }
  }, [resumeData]);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!resumeId) return;

    try {
      const { error } = await supabase
        .from('ai_resumes')
        .update({ content: resumeData as any })
        .eq('id', resumeId);

      if (error) throw error;
      toast.success('Changes saved!');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  }, [resumeData, resumeId]);

  // Update functions
  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateSkills = (skillsText: string) => {
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s);
    setResumeData(prev => ({ ...prev, skills: skillsArray }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: []
    };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Debug authentication
  console.log('UnifiedResumeBuilder - User:', user, 'Loading state from auth:', loading);
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" />
              <div>
                <h3 className="font-medium">Loading Resume Builder</h3>
                <p className="text-muted-foreground text-sm">Please wait while we initialize your workspace...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">AI Resume Builder</h1>
          <p className="text-muted-foreground text-center">Upload, enhance, and export your resume with AI</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center space-x-8">
            {[
              { key: 'upload', label: 'Upload', icon: Upload },
              { key: 'edit', label: 'Edit', icon: FileText },
              { key: 'enhance', label: 'Enhance', icon: Wand2 },
              { key: 'export', label: 'Export', icon: Download }
            ].map(({ key, label, icon: Icon }, index) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep === key || (index < ['upload', 'edit', 'enhance', 'export'].indexOf(currentStep)) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${
                  currentStep === key ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{processingStatus}</span>
                  <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        {currentStep === 'upload' && (
          <ErrorBoundary>
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Upload Your Resume</CardTitle>
                <p className="text-muted-foreground">Upload your existing resume and we'll extract all content with AI</p>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  onFileSelect={handleFileSelect}
                  uploadedFile={uploadedFile}
                  onRemoveFile={handleRemoveFile}
                  onProcessResume={handleProcessResume}
                  isProcessing={isProcessing}
                  dragActive={dragActive}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  error={uploadError}
                  processingProgress={processingProgress}
                  processingStatus={processingStatus}
                />
              </CardContent>
            </Card>
          </ErrorBoundary>
        )}

        {currentStep === 'edit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  />
                  <Textarea
                    placeholder="Professional Summary"
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Experience</CardTitle>
                    <Button size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id || index} className="border rounded p-4 space-y-3">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeExperience(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Company"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        />
                        <Input
                          placeholder="Position"
                          value={exp.position || ''}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        />
                        <Input
                          placeholder="Start Date"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        />
                        <Input
                          placeholder="End Date"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        />
                      </div>
                      <Textarea
                        placeholder="Description and achievements"
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your skills separated by commas"
                    value={resumeData.skills.join(', ')}
                    onChange={(e) => updateSkills(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={saveChanges} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setCurrentStep('enhance')} 
                  variant="outline"
                  className="flex-1"
                >
                  Next: Enhance
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Preview</span>
                    <Badge variant={atsScore >= 80 ? 'default' : atsScore >= 60 ? 'secondary' : 'destructive'}>
                      ATS Score: {atsScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div id="resume-preview" className="bg-white p-6 rounded border shadow-sm text-black space-y-4 text-sm">
                    {/* Personal Info */}
                    <div className="text-center border-b pb-4">
                      <h1 className="text-xl font-bold">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                      <div className="flex justify-center space-x-4 text-gray-600 mt-2">
                        <span>{resumeData.personalInfo.email}</span>
                        <span>{resumeData.personalInfo.phone}</span>
                        <span>{resumeData.personalInfo.location}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    {resumeData.personalInfo.summary && (
                      <div>
                        <h2 className="font-bold text-lg mb-2">Professional Summary</h2>
                        <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h2 className="font-bold text-lg mb-2">Experience</h2>
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="mb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{exp.position}</h3>
                                <p className="text-gray-600">{exp.company}</p>
                              </div>
                              <span className="text-gray-500 text-sm">
                                {exp.startDate} - {exp.endDate}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 mt-1">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills.length > 0 && (
                      <div>
                        <h2 className="font-bold text-lg mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'enhance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhancement Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Enhancement Options
                  </CardTitle>
                  <p className="text-muted-foreground">Optimize your resume with AI assistance</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => enhanceResume('ats')} 
                    disabled={isProcessing}
                    className="w-full justify-start"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    ATS Optimization
                    <span className="ml-auto text-xs">Recommended</span>
                  </Button>
                  
                  <Button 
                    onClick={() => enhanceResume('professional')} 
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Professional Polish
                  </Button>
                  
                  <Button 
                    onClick={() => enhanceResume('achievements')} 
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Achievement Focus
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('edit')} 
                  variant="outline"
                  className="flex-1"
                >
                  Back to Edit
                </Button>
                <Button 
                  onClick={() => setCurrentStep('export')} 
                  className="flex-1"
                >
                  Next: Export
                </Button>
              </div>
            </div>

            {/* ATS Analysis */}
            <div>
              <ATSOptimizationPanel resumeData={resumeData} />
            </div>
          </div>
        )}

        {currentStep === 'export' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Download className="h-6 w-6" />
                  Export Your Resume
                </CardTitle>
                <p className="text-muted-foreground">Download your optimized resume in your preferred format</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={exportPDF} 
                    disabled={isProcessing}
                    className="h-20 flex-col"
                  >
                    <FileText className="h-8 w-8 mb-2" />
                    Export as PDF
                  </Button>
                  
                  <Button 
                    onClick={exportDOCX} 
                    disabled={isProcessing}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <FileText className="h-8 w-8 mb-2" />
                    Export as DOCX
                  </Button>
                </div>

                <Separator />

                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setCurrentStep('enhance')} 
                    variant="outline"
                  >
                    Back to Enhance
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};