import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ApplicationFormWizard } from './application-form/ApplicationFormWizard';
import { JobInfo } from './application-form/types';

interface EnhancedJobApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInfo;
}

export const EnhancedJobApplicationDialog: React.FC<EnhancedJobApplicationDialogProps> = ({
  open,
  onOpenChange,
  job
}) => {
  const handleComplete = (formData: any) => {
    // Application submitted successfully
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <ApplicationFormWizard
            job={job}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};