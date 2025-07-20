import React, { useState, useEffect } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { ResumeHeader } from './ResumeHeader';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from '../ResumePreview';
import { ATSScoreChecker } from '../ATSScoreChecker';
import { DataExtractionVerifier } from './DataExtractionVerifier';
import { EnhancedTemplateSelector } from './EnhancedTemplateSelector';
import { JobSpecificOptimizer } from '../optimization/JobSpecificOptimizer';
import { ContentEnhancementLibrary } from '../content/ContentEnhancementLibrary';
import { ResumeExamplesGallery } from '../examples/ResumeExamplesGallery';
import { AdvancedAIFeatures } from '../ai/AdvancedAIFeatures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnifiedResumeInterfaceProps {
  mode: 'edit' | 'create';
  initialData?: EnhancedResumeData;
  onDataChange?: (data: EnhancedResumeData) => void;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode,
  initialData,
  onDataChange
}) => {
  const {
    resumeData,
    updateResumeData,
    isSaving,
    hasChanges,
    saveResume,
    exportResume
  } = useResumeBuilder(initialData);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [originalData, setOriginalData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-minimal');
  const [customizationSettings, setCustomizationSettings] = useState({
    colorScheme: 'professional-blue',
    fontFamily: 'inter',
    fontSize: 11,
    spacing: 'normal' as const,
    sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
    showPhoto: true,
    showBorder: false,
    accentColor: '#2563eb'
  });

  // Store original data when component mounts
  useEffect(() => {
    if (initialData && !originalData) {
      setOriginalData(initialData);
    }
  }, [initialData, originalData]);

  // Sync data changes with parent component
  useEffect(() => {
    if (resumeData && onDataChange) {
      onDataChange(resumeData);
    }
  }, [resumeData, onDataChange]);

  // Extract template recommendation from enhanced data (if available)
  useEffect(() => {
    const enhanced = (resumeData as any)?.enhanced;
    if (enhanced?.templateRecommendation?.recommended) {
      setSelectedTemplate(enhanced.templateRecommendation.recommended);
    }
  }, [resumeData]);

  const handleSave = async () => {
    await saveResume();
    setLastSaved(new Date());
  };

  const handleEnhancementApplied = (enhancedData: any) => {
    updateResumeData(enhancedData);
  };

  const handleExport = async (format: string, settings: any) => {
    try {
      console.log('Exporting resume:', { format, settings });
      await exportResume(format);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  // Show loading state if no resume data
  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing resume builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeHeader
        mode={mode}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasChanges={hasChanges}
        onSave={handleSave}
        resumeData={resumeData}
        onEnhancementApplied={handleEnhancementApplied}
      />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="ai-features">AI Features</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ats">ATS Score</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Resume Editor</h2>
                <p className="text-sm text-muted-foreground">Edit your resume content below</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ResumeEditor
                  data={resumeData}
                  onChange={updateResumeData}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Template & Design</h2>
                <p className="text-sm text-muted-foreground">Choose and customize your resume template</p>
              </div>
              <div className="p-4">
                <EnhancedTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                  customizationSettings={customizationSettings}
                  onCustomizationChange={setCustomizationSettings}
                  resumeData={resumeData}
                  onExport={handleExport}
                  onNext={() => console.log('Next step')}
                  onBack={() => console.log('Back step')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Job-Specific Optimization</h2>
                <p className="text-sm text-muted-foreground">Optimize your resume for specific job postings</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <JobSpecificOptimizer
                  resumeData={resumeData}
                  onOptimization={updateResumeData}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Content Enhancement</h2>
                <p className="text-sm text-muted-foreground">Access our library of proven content and bullet points</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ContentEnhancementLibrary
                  onContentSelect={(content) => console.log('Selected content:', content)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Resume Examples Gallery</h2>
                <p className="text-sm text-muted-foreground">Browse real resume examples from successful candidates</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ResumeExamplesGallery
                  onExampleSelect={(example) => console.log('Selected example:', example)}
                  onTemplateApply={setSelectedTemplate}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-features" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Advanced AI Features</h2>
                <p className="text-sm text-muted-foreground">AI-powered career insights and predictions</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <AdvancedAIFeatures
                  resumeData={resumeData}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <p className="text-sm text-muted-foreground">See how your resume looks</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ResumePreview
                  content={resumeData}
                  fullPage={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ats" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">ATS Score Card</h2>
                <p className="text-sm text-muted-foreground">Analyze and improve your resume's ATS compatibility</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ATSScoreChecker
                  resumeContent={resumeData}
                  currentScore={atsScore}
                  onScoreUpdate={setAtsScore}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
