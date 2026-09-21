import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Send, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useCreateJobApplication } from '@/hooks/useJobApplications';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { toast } from 'sonner';
import { incrementJobApplications } from '@/utils/supabaseHelpers';
import { GuestJobApplyModal } from './GuestJobApplyModal';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';

interface QuickApplyButtonProps {
  job: {
    id: string;
    title: string;
    company_name?: string;
    companies?: {
      name: string;
    } | null;
  };
  onApplicationSuccess?: () => void;
  className?: string;
}

export default function QuickApplyButton({ job, onApplicationSuccess, className }: QuickApplyButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [primaryResume, setPrimaryResume] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const createApplication = useCreateJobApplication();
  const { triggerJobApplied } = useTXCIntegration();

  useEffect(() => {
    checkUserDataAndApplication();
  }, [job.id]);

  const checkUserDataAndApplication = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('job_id', job.id)
        .maybeSingle();

      if (existingApplication) {
        setHasApplied(true);
        setIsLoading(false);
        return;
      }

      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      setProfile(userProfile);

      // Get primary resume
      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .limit(1);

      if (resumes && resumes.length > 0) {
        setPrimaryResume(resumes[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user data:', error);
      setIsLoading(false);
    }
  };

  const handleQuickApply = async () => {
    if (!user || !profile || !primaryResume) {
      toast.error('Please complete your profile and upload a resume first');
      return;
    }

    if (hasApplied) {
      toast.error('You have already applied to this job');
      return;
    }

    try {
      toast.loading('Applying with your saved resume...', { id: 'quick-apply' });

      await createApplication.mutateAsync({
        job_id: job.id,
        resume_url: primaryResume.file_url,
        application_data: {
          fullName: profile.full_name || '',
          email: profile.email || '',
          phoneNumber: profile.phone || '',
          location: profile.location || '',
          linkedinProfile: profile.linkedin_url || '',
          portfolioWebsite: profile.portfolio_url || '',
          quickApply: true
        }
      });

      // Update application count
      incrementJobApplications(job.id).catch(console.error);

      // Award TXC for job application
      try {
        await triggerJobApplied();
        toast.success('Application submitted! You earned TXC rewards! 🎉', { id: 'quick-apply' });
      } catch (error) {
        toast.success('Application submitted successfully!', { id: 'quick-apply' });
      }

      setHasApplied(true);
      
      if (onApplicationSuccess) {
        onApplicationSuccess();
      }

    } catch (error: any) {
      console.error('Quick apply error:', error);
      toast.error(error.message || 'Failed to submit application', { id: 'quick-apply' });
    }
  };

  const [showGuestModal, setShowGuestModal] = useState(false);

  if (isLoading) {
    return (
      <Button disabled variant="outline" className={className}>
        <Send className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button disabled variant="outline" className={`${className} bg-success/10 border-success/20 text-success`}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Applied ✓
      </Button>
    );
  }

  // If user is not logged in OR does not have a saved resume, allow 1-click apply modal
  if (!user || !profile || !primaryResume) {
    return (
      <>
        <Button 
          onClick={() => {
            GrowthFunnelTracker.track('apply_cta_clicked', {
              job_id: job.id,
              job_title: job.title,
              source_button: 'quick_apply',
            });
            setShowGuestModal(true);
          }} 
          className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white ${className}`}
        >
          <Zap className="h-4 w-4 mr-2 text-amber-300 fill-amber-300" />
          Quick Apply
        </Button>
        <GuestJobApplyModal
          open={showGuestModal}
          onOpenChange={setShowGuestModal}
          job={job}
          onSuccess={() => {
            setHasApplied(true);
            onApplicationSuccess?.();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Button 
        onClick={handleQuickApply}
        disabled={createApplication.isPending}
        className={className}
      >
        <Zap className="h-4 w-4 mr-2" />
        Quick Apply
      </Button>
      <GuestJobApplyModal
        open={showGuestModal}
        onOpenChange={setShowGuestModal}
        job={job}
        onSuccess={() => {
          setHasApplied(true);
          onApplicationSuccess?.();
        }}
      />
    </>
  );
}