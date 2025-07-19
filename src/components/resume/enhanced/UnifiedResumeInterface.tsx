
import React, { useState, useEffect } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { ResumeHeader } from './ResumeHeader';
import { ResumeEditor } from '../ResumeEditor';
import { ResumePreview } from '../ResumePreview';

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

  // Sync data changes with parent component
  useEffect(() => {
    if (resumeData && onDataChange) {
      onDataChange(resumeData);
    }
  }, [resumeData, onDataChange]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Resume Editor</h2>
                <p className="text-sm text-muted-foreground">Edit your resume content below</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <ResumeEditor
                  content={resumeData}
                  onChange={updateResumeData}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};
