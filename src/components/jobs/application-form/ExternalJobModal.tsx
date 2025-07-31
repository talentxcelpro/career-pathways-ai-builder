import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, MapPin, Clock } from "lucide-react";
import { trackExternalJobClick } from "@/utils/trackExternalJobClick";

interface ExternalJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    title: string;
    company_name: string;
    location?: string;
    external_url: string;
    salary_range?: string;
    employment_type?: string;
  };
}

export const ExternalJobModal: React.FC<ExternalJobModalProps> = ({
  open,
  onOpenChange,
  job
}) => {
  const handleExternalRedirect = async () => {
    // Track external job click
    await trackExternalJobClick(job.title, job.external_url);
    
    // Open external URL in new tab
    window.open(job.external_url, '_blank', 'noopener,noreferrer');
    
    // Close modal
    onOpenChange(false);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'the company website';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Continue on External Site
          </DialogTitle>
          <DialogDescription>
            This job is hosted on an external platform. You'll be redirected to complete your application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">{job.title}</h4>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{job.company_name}</span>
              </div>
              
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              
              {job.employment_type && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{job.employment_type}</span>
                  {job.salary_range && <span>• {job.salary_range}</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  External Application Required
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll be redirected to <strong>{getDomainFromUrl(job.external_url)}</strong> to complete your application directly with the employer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExternalRedirect}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Continue to Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};