
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Sparkles } from "lucide-react";
import { AIResumeEnhancer } from "@/components/resume/AIResumeEnhancer";

interface ResumeHeaderProps {
  mode: 'edit' | 'create';
  isSaving: boolean;
  lastSaved: Date | null;
  hasChanges: boolean;
  onSave: () => void;
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
  mode,
  isSaving,
  lastSaved,
  hasChanges,
  onSave,
  resumeData,
  onEnhancementApplied
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">
                {mode === 'edit' ? 'Edit Resume' : 'Create Resume'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {!isSaving && lastSaved && (
                  <span>Last saved: {formatLastSaved(lastSaved)}</span>
                )}
                {hasChanges && !isSaving && (
                  <Badge variant="outline" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AIResumeEnhancer 
              resumeData={resumeData}
              onEnhancementApplied={onEnhancementApplied}
            />
            
            {mode === 'edit' && (
              <Button
                onClick={onSave}
                disabled={isSaving || !hasChanges}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
