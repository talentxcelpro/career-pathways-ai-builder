import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Download, 
  Save, 
  Eye, 
  Settings,
  Wand2,
  ArrowLeft,
  Target,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileUploadZone } from '../upload/FileUploadZone';
import { ResumeEditor } from '../ResumeEditor';
import { ResumePreview } from '../ResumePreview';
import { AIEnhancementPanel } from './AIEnhancementPanel';
import { useResumeDataProcessor, ProcessedResumeData } from './ResumeDataProcessor';
import { ExtractionQualityIndicator } from '../ExtractionQualityIndicator';
import { analyzeATSCompatibility } from '@/utils/atsOptimization';

interface UnifiedResumeInterfaceProps {
  mode?: 'edit' | 'create' | 'upload';
  resumeId?: string;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode = 'edit',
  resumeId
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { processRawResumeData, validateResumeData, getEmptyResumeData } = useResumeDataProcessor();
  
  const [currentTab, setCurrentTab] = useState<'upload' | 'edit' | 'enhance' | 'preview'>('edit');
  const [resumeData, setResumeData] = useState<ProcessedResumeData>(getEmptyResumeData());
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [atsScore, setAtsScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const activeResumeId = resumeId || id;

  // Fetch resume data
  const { data: resume, isLoading: resumeLoading, error } = useQuery({
    queryKey: ['resume', activeResumeId],
    queryFn: async () => {
      if (!activeResumeId || !user) return null;
      
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', activeResumeId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeResumeId && !!user && mode === 'edit'
  });

  // Process resume data when loaded
  useEffect(() => {
    if (resume?.content) {
      const processed = processRawResumeData(resume.content);
      setResumeData(processed);
      
      if (resume.template_id) {
        setSelectedTemplate(resume.template_id);
      }
      
      // Calculate ATS score
      try {
        const atsAnalysis = analyzeATSCompatibility(processed);
        setAtsScore(atsAnalysis.overall);
      } catch (error) {
        console.error('ATS analysis failed:', error);
        setAtsScore(65); // Default score
      }
    }
  }, [resume, processRawResumeData]);

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProcessedResumeData) => {
      if (!activeResumeId || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ 
          content: data as any,
          template_id: selectedTemplate,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeResumeId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', activeResumeId] });
      toast.success('Resume saved successfully!');
    },
    onError: (error) => {
      console.error('Save failed:', error);
      toast.error('Failed to save resume');
    }
  });

  // Handle data updates
  const handleDataUpdate = useCallback((updatedData: ProcessedResumeData) => {
    setResumeData(updatedData);
    
    // Recalculate ATS score
    try {
      const atsAnalysis = analyzeATSCompatibility(updatedData);
      setAtsScore(atsAnalysis.overall);
    } catch (error) {
      console.error('ATS analysis failed:', error);
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!resumeData.personalInfo.fullName || !activeResumeId) return;
    
    const timer = setTimeout(() => {
      if (validateResumeData(resumeData)) {
        saveMutation.mutate(resumeData);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [resumeData, saveMutation, validateResumeData, activeResumeId]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (!validateResumeData(resumeData)) {
      toast.error('Please add some content before saving');
      return;
    }

    setIsSaving(true);
    try {
      await saveMutation.mutateAsync(resumeData);
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, saveMutation, validateResumeData]);

  // Export functions
  const handleExportPDF = useCallback(async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });
      const { exportToPDF } = await import('@/utils/exportResume');
      await exportToPDF('resume-preview', `${resumeData.personalInfo.fullName || 'resume'}.pdf`);
      toast.success('PDF downloaded!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    }
  }, [resumeData.personalInfo.fullName]);

  const handleExportDOCX = useCallback(async () => {
    try {
      toast.loading('Generating DOCX...', { id: 'docx-export' });
      const { exportToDOCX } = await import('@/utils/exportResume');
      await exportToDOCX(resumeData, `${resumeData.personalInfo.fullName || 'resume'}.docx`);
      toast.success('DOCX downloaded!', { id: 'docx-export' });
    } catch (error) {
      console.error('DOCX export failed:', error);
      toast.error('Failed to generate DOCX', { id: 'docx-export' });
    }
  }, [resumeData]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    setCurrentTab('upload');
    
    try {
      toast.loading('Processing uploaded resume...', { id: 'upload' });
      
      // Process file with enhanced resume processor
      const { EnhancedResumeProcessor } = await import('@/services/enhancedResumeProcessor');
      const processor = new EnhancedResumeProcessor();
      const extractedData = await processor.processResume(file);
      
      if (extractedData) {
        const processed = processRawResumeData(extractedData);
        setResumeData(processed);
        setCurrentTab('edit');
        toast.success('Resume uploaded and processed!', { id: 'upload' });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to process uploaded file', { id: 'upload' });
    }
  }, [processRawResumeData]);

  // Loading states
  if (authLoading || (resumeLoading && mode === 'edit')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">Failed to load resume</p>
          <Button onClick={() => navigate('/resume-builder')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Builder
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <p className="mb-4">Please sign in to access the resume builder</p>
          <Button onClick={() => navigate('/auth')} variant="default">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/resume-builder')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Resume Builder</h1>
                <p className="text-muted-foreground">
                  {mode === 'create' ? 'Create a new resume' : 'Edit your resume'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={atsScore >= 80 ? 'default' : atsScore >= 60 ? 'secondary' : 'destructive'}>
                ATS Score: {atsScore}%
              </Badge>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <Button
                onClick={handleExportPDF}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              
              <Button
                onClick={handleExportDOCX}
                size="sm"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                DOCX
              </Button>
            </div>
          </div>

          {/* Main Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Editor/Upload */}
            <div className="lg:col-span-2">
              <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="enhance" className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Enhance
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium mb-2">Upload your resume</p>
                          <p className="text-muted-foreground">Drag and drop or click to select</p>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="edit" className="mt-6">
                  <ResumeEditor
                    content={resumeData}
                    onChange={handleDataUpdate}
                  />
                </TabsContent>

                <TabsContent value="enhance" className="mt-6">
                  <AIEnhancementPanel
                    resumeData={resumeData}
                    onDataUpdate={handleDataUpdate}
                    atsScore={atsScore}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-6">
                  <Card>
                    <CardContent className="p-0">
                      <div id="resume-preview">
                        <ResumePreview
                          content={resumeData}
                          template={{ css_config: { primaryColor: '#2563eb' } }}
                          fullPage={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div 
                      id="resume-preview-sidebar"
                      className="transform scale-50 origin-top-left overflow-hidden"
                      style={{ width: '200%', height: '100%' }}
                    >
                      <ResumePreview
                        content={resumeData}
                        template={{ css_config: { primaryColor: '#2563eb' } }}
                        fullPage={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};