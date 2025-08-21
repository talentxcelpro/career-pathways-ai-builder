import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Use Supabase auth directly since we don't have a useUser hook yet
import { useToast } from '@/hooks/use-toast';

export interface JobEngagement {
  id: string;
  job_id: string;
  user_id: string;
  engagement_type: 'view' | 'save' | 'apply' | 'share';
  metadata?: any;
  created_at: string;
}

export const useJobsEngagement = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user's saved and applied jobs on mount
  useEffect(() => {
    if (user) {
      loadUserJobEngagements();
      subscribeToJobEngagements();
    }
  }, [user]);

  const loadUserJobEngagements = async () => {
    if (!user) return;

    try {
      const { data: engagements } = await supabase
        .from('content_engagement')
        .select('content_id, engagement_type')
        .eq('user_id', user.id)
        .eq('content_type', 'job')
        .in('engagement_type', ['save', 'apply']);

      const saved = engagements?.filter(e => e.engagement_type === 'save').map(e => e.content_id) || [];
      const applied = engagements?.filter(e => e.engagement_type === 'apply').map(e => e.content_id) || [];

      setSavedJobs(saved);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error loading job engagements:', error);
    }
  };

  const subscribeToJobEngagements = () => {
    if (!user) return;

    const channel = supabase
      .channel('job-engagements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_engagement',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord?.content_type === 'job') {
            handleEngagementUpdate(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleEngagementUpdate = (payload: any) => {
    const engagement = payload.new;
    const jobId = engagement.content_id;

    switch (engagement.engagement_type) {
      case 'save':
        if (payload.eventType === 'INSERT') {
          setSavedJobs(prev => [...prev, jobId]);
        } else if (payload.eventType === 'DELETE') {
          setSavedJobs(prev => prev.filter(id => id !== jobId));
        }
        break;
      case 'apply':
        if (payload.eventType === 'INSERT') {
          setAppliedJobs(prev => [...prev, jobId]);
        }
        break;
    }
  };

  const engageWithJob = async (
    jobId: string,
    engagementType: 'view' | 'save' | 'apply' | 'share',
    metadata?: any
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to interact with jobs.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // For save/unsave actions, check if already exists
      if (engagementType === 'save') {
        const isCurrentlySaved = savedJobs.includes(jobId);
        
        if (isCurrentlySaved) {
          // Unsave the job
          await supabase
            .from('content_engagement')
            .delete()
            .eq('user_id', user.id)
            .eq('content_id', jobId)
            .eq('content_type', 'job')
            .eq('engagement_type', 'save');

          setSavedJobs(prev => prev.filter(id => id !== jobId));
          
          toast({
            title: 'Job Removed',
            description: 'Job removed from your saved list.',
          });
          
          return false; // Indicates unsaved
        }
      }

      // Create engagement record
      const { error } = await supabase
        .from('content_engagement')
        .insert({
          user_id: user.id,
          content_id: jobId,
          content_type: 'job',
          engagement_type: engagementType,
          metadata: metadata || {},
        });

      if (error) throw error;

      // Update local state
      switch (engagementType) {
        case 'save':
          setSavedJobs(prev => [...prev, jobId]);
          toast({
            title: 'Job Saved',
            description: 'Job added to your saved list.',
          });
          break;
        case 'apply':
          setAppliedJobs(prev => [...prev, jobId]);
          toast({
            title: 'Application Submitted',
            description: 'Your application has been submitted successfully.',
          });
          break;
        case 'share':
          toast({
            title: 'Job Shared',
            description: 'Job link copied to clipboard.',
          });
          break;
      }

      return true;
    } catch (error) {
      console.error('Error engaging with job:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const trackJobView = async (jobId: string) => {
    if (!user) return;

    // Throttle views - only track one view per job per session
    const viewedKey = `job_viewed_${jobId}`;
    if (sessionStorage.getItem(viewedKey)) return;

    try {
      await engageWithJob(jobId, 'view', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      });
      
      sessionStorage.setItem(viewedKey, 'true');
    } catch (error) {
      console.error('Error tracking job view:', error);
    }
  };

  const saveJob = async (jobId: string) => {
    return await engageWithJob(jobId, 'save');
  };

  const applyToJob = async (jobId: string, applicationData?: any) => {
    return await engageWithJob(jobId, 'apply', applicationData);
  };

  const shareJob = async (jobId: string, shareMethod?: string) => {
    const shareUrl = `${window.location.origin}/jobs/${jobId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      await engageWithJob(jobId, 'share', { method: shareMethod || 'clipboard' });
      return true;
    } catch (error) {
      console.error('Error sharing job:', error);
      return false;
    }
  };

  return {
    savedJobs,
    appliedJobs,
    trackJobView,
    saveJob,
    applyToJob,
    shareJob,
    isJobSaved: (jobId: string) => savedJobs.includes(jobId),
    isJobApplied: (jobId: string) => appliedJobs.includes(jobId),
  };
};