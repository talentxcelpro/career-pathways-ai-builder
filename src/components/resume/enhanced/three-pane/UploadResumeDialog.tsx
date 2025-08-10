import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResumeUploader } from '@/components/resume/enhanced/ResumeUploader';
import { EditorResume } from '@/types/editor-resume';

interface UploadResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeUploaded: (data: EditorResume) => void;
}

export const UploadResumeDialog: React.FC<UploadResumeDialogProps> = ({
  open,
  onOpenChange,
  onResumeUploaded
}) => {
  const handleResumeExtracted = (extractedData: EditorResume) => {
    onResumeUploaded(extractedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            Upload your existing resume (PDF, DOCX, or TXT) and we'll extract the information to populate your resume builder.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <ResumeUploader 
            onResumeExtracted={handleResumeExtracted}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};