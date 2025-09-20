
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useCreateJobApplication } from '@/hooks/useJobApplications';
import ComprehensiveJobApplicationForm from './ComprehensiveJobApplicationForm';
import QuickApplyButton from './QuickApplyButton';
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
  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const createApplication = useCreateJobApplication();

  useEffect(() => {
    const checkUserAndResume = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if user has a resume
        const { data: resumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1);
        
        setHasResume(resumes && resumes.length > 0);
      }
      
      setLoading(false);
    };
    
    checkUserAndResume();
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
        resume_url: applicationData.resumeUrl,
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
      <div className="flex gap-2">
        {currentUser && hasResume ? (
          <QuickApplyButton 
            job={job} 
            className={className}
            onApplicationSuccess={() => toast.success('Applied successfully!')}
          />
        ) : null}
        
        <Button
          onClick={handleApplyClick}
          variant={currentUser && hasResume ? "outline" : variant}
          size={size}
          className={currentUser && hasResume ? undefined : className}
        >
          <Send className="h-4 w-4 mr-2" />
          {currentUser ? (hasResume ? 'Full Application' : 'Apply Now') : 'Login to Apply'}
        </Button>
      </div>

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
