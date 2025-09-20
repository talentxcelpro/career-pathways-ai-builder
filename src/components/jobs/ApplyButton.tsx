
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useCreateJobApplication } from '@/hooks/useJobApplications';
import ComprehensiveJobApplicationForm from './ComprehensiveJobApplicationForm';
import { toast } from 'sonner';

interface ApplyButtonProps {
  job: {
    id: string;
    title: string;
    source_url?: string;
    posted_by_bot?: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    skills_required?: string[];
  };
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function ApplyButton({ job, variant = "default", size = "default", className }: ApplyButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const createApplication = useCreateJobApplication();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  const handleApplyClick = () => {
    if (!currentUser) {
      // Redirect to login page
      window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    setShowForm(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      await createApplication.mutateAsync({
        job_id: job.id,
        bot_id: job.posted_by_bot,
        resume_url: applicationData.resumeUrl,
        redirect_url: job.source_url,
        application_data: applicationData
      });

      // Close form
      setShowForm(false);

      // Redirect to original job listing if available
      if (job.source_url) {
        setTimeout(() => {
          window.open(job.source_url, '_blank');
        }, 1000);
        toast.success('Application submitted! Redirecting to original job listing...');
      } else {
        toast.success('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Application failed:', error);
      toast.error('Failed to submit application');
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleApplyClick}
        variant={variant}
        size={size}
        className={className}
      >
        <Send className="h-4 w-4 mr-2" />
        {currentUser ? 'Apply Now' : 'Login to Apply'}
      </Button>

      {job.source_url && (
        <Button
          variant="outline"
          size={size}
          className="ml-2"
          onClick={() => window.open(job.source_url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Original
        </Button>
      )}

      <ComprehensiveJobApplicationForm
        open={showForm}
        onOpenChange={setShowForm}
        job={job}
      />
    </>
  );
}
