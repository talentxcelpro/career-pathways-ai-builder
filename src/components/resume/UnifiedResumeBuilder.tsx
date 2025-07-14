import React, { useState, useCallback } from 'react';
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

// Configure PDF worker
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
  const { user } = useAuth();
  
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
    if (!file || !user) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Uploading file...');

    try {
      // Step 1: Upload progress
      setProcessingProgress(20);
      setProcessingStatus('Extracting content with AI...');

      // Step 2: Extract with AI
      const processor = new EnhancedResumeProcessor();
      const extractedContent = await processor.processResume(file);

      // Convert extracted content to our format
      const convertedData: ResumeData = {
        personalInfo: {
          fullName: extractedContent.personalInfo?.fullName || '',
          email: extractedContent.personalInfo?.email || '',
          phone: extractedContent.personalInfo?.phone || '',
          location: extractedContent.personalInfo?.location || '',
          summary: extractedContent.personalInfo?.summary || ''
        },
        experience: extractedContent.experience || [],
        education: extractedContent.education || [],
        skills: extractedContent.skills?.technical ? [
          ...(extractedContent.skills.technical.programming || []),
          ...(extractedContent.skills.technical.frameworks || []),
          ...(extractedContent.skills.technical.databases || []),
          ...(extractedContent.skills.technical.tools || []),
          ...(extractedContent.skills.technical.cloud || []),
          ...(extractedContent.skills.soft || []),
          ...(extractedContent.skills.languages?.map(lang => 
            typeof lang === 'string' ? lang : lang.language) || []),
          ...(extractedContent.skills.certifications || [])
        ].filter(Boolean) : [],
        projects: extractedContent.projects || [],
        certifications: extractedContent.certifications || [],
        awards: extractedContent.awards || []
      };

      setProcessingProgress(80);
      setProcessingStatus('Saving resume...');

      // Step 3: Save to database
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

      if (error) throw error;

      setResumeId(savedResume.id);
      setResumeData(convertedData);
      setProcessingProgress(100);
      setProcessingStatus('Extraction complete!');
      
      // Calculate initial ATS score
      const { analyzeATSCompatibility } = await import('@/utils/atsOptimization');
      const atsAnalysis = analyzeATSCompatibility(convertedData);
      setAtsScore(atsAnalysis.overall);

      toast.success('Resume extracted successfully!');
      setCurrentStep('edit');
      
    } catch (error) {
      console.error('Upload/extraction failed:', error);
      toast.error('Failed to process resume. Please try again.');
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

  // Export functions
  const exportPDF = useCallback(async () => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Generating PDF...');
      
      const { exportToPDF } = await import('@/utils/exportResume');
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsProcessing(false);
    }
  }, [resumeData]);

  const exportDOCX = useCallback(async () => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Generating DOCX...');
      
      const { exportToDOCX } = await import('@/utils/exportResume');
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName || 'resume'}.docx`);
      toast.success('DOCX downloaded!');
    } catch (error) {
      toast.error('Failed to generate DOCX');
    } finally {
      setIsProcessing(false);
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Upload Your Resume</CardTitle>
              <p className="text-muted-foreground">Upload your existing resume and we'll extract all content with AI</p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your resume here</p>
                <p className="text-muted-foreground mb-4">Supports PDF, DOCX, and TXT files up to 10MB</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                  <Button disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
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