
import React, { useState, useEffect } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useResumeBuilder } from '@/hooks/useResumeBuilder';
import { ResumeHeader } from './ResumeHeader';

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
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Resume Editor</h2>
              <p className="text-muted-foreground">
                Resume editor interface will be implemented here.
              </p>
              
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Debug Info:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Mode: {mode}</li>
                    <li>Has Changes: {hasChanges ? 'Yes' : 'No'}</li>
                    <li>Is Saving: {isSaving ? 'Yes' : 'No'}</li>
                    <li>Name: {resumeData.personalInfo.fullName || 'Empty'}</li>
                    <li>Sections: {resumeData.sectionOrder.length}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
              <p className="text-muted-foreground">
                Resume preview will be shown here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
