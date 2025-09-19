import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ApplicationFormWizard } from './application-form/ApplicationFormWizard';
import { JobInfo } from './application-form/types';
import { useMobileDetection } from '@/hooks/useMobileDetection';

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
  const { isMobile } = useMobileDetection();

  const handleComplete = (formData: any) => {
    // Application submitted successfully
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Mobile-first: Use drawer on mobile, dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[60vh] p-0 mobile-optimized">
          <div className="relative h-full flex flex-col">
            <DrawerHeader className="flex-shrink-0 py-1 px-2 border-b safe-top">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xs font-medium">Apply</DrawerTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCancel}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </DrawerHeader>
            
            <div className="flex-1 overflow-hidden">
              <ApplicationFormWizard
                job={job}
                onComplete={handleComplete}
                onCancel={handleCancel}
                isMobile={true}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop version
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[70vh] p-0 overflow-hidden">
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
            isMobile={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};