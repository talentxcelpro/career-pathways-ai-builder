import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, ArrowRight } from "lucide-react";
import { JobInfo } from './types';
import { trackExternalJobClick } from "@/utils/trackExternalJobClick";

interface ScrapedJobSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInfo;
}

export const ScrapedJobSuccessModal: React.FC<ScrapedJobSuccessModalProps> = ({
  open,
  onOpenChange,
  job
}) => {
  const handleExternalRedirect = async () => {
    // Track external job click with enhanced analytics
    if (job.external_url) {
      await trackExternalJobClick(job.id, job.external_url, 'application_success_modal');
    }
    
    if (job.external_url) {
      // Add delay to ensure tracking completes
      setTimeout(() => {
        window.open(job.external_url, '_blank', 'noopener,noreferrer');
      }, 100);
    }
    onOpenChange(false);
  };

  const companyName = job.companies?.name || job.company_name || 'the company';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {job.companies?.logo_url && (
              <img 
                src={job.companies.logo_url} 
                alt={companyName}
                className="w-8 h-8 rounded"
              />
            )}
            <div>
              <span>Application Submitted!</span>
              <p className="text-sm text-gray-600 font-normal">for {job.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Success!</h3>
            <p className="text-sm text-gray-600">
              Your application has been recorded in TalentXcel.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                📍 Next Step Required
              </p>
              <p className="text-sm text-blue-700">
                Since this is a job from {companyName}, you need to complete your application on their official careers page.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleExternalRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Complete Application on {companyName}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              I'll do this later
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            We recommend completing the application within 24 hours for the best chance of consideration.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};