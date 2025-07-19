
import React, { useState, useEffect } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { ResumeHeader } from './ResumeHeader';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from '../ResumePreview';
import { ATSScoreChecker } from '../ATSScoreChecker';
import { DataExtractionVerifier } from './DataExtractionVerifier';
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('chronological');
  const [templateRecommendation, setTemplateRecommendation] = useState<any>(null);

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
    if (enhanced?.templateRecommendation) {
      setTemplateRecommendation(enhanced.templateRecommendation);
      if (enhanced.templateRecommendation.recommended) {
        setSelectedTemplate(enhanced.templateRecommendation.recommended);
      }
    }
  }, [resumeData]);

  const handleSave = async () => {
    await saveResume();
    setLastSaved(new Date());
  };

  const handleEnhancementApplied = (enhancedData: any) => {
    updateResumeData(enhancedData);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ats">ATS Score Card</TabsTrigger>
            <TabsTrigger value="verification">Data Verification</TabsTrigger>
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

          <TabsContent value="verification" className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Data Extraction Verification</h2>
                <p className="text-sm text-muted-foreground">Verify that all resume data was extracted correctly from the original source</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <DataExtractionVerifier
                  originalData={originalData}
                  processedData={resumeData}
                  onRefresh={() => window.location.reload()}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
