/**
 * Real-time Job Status Updates
 * Live tracking of job applications, views, and matches
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface JobUpdate {
  job_id: string;
  type: 'application' | 'view' | 'match' | 'deadline' | 'filled';
  title: string;
  company: string;
  status?: string;
  timestamp: number;
}

export function useRealtimeJobStatus() {
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const setupJobTracking = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track job applications
      const applicationsChannel = supabase
        .channel(`job_applications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_applications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old?.status) {
              // Application status changed
              const { data: job } = await supabase
                .from('jobs')
                .select('title, company_name')
                .eq('id', payload.new.job_id)
                .single();

              if (job) {
                const update: JobUpdate = {
                  job_id: payload.new.job_id,
                  type: 'application',
                  title: job.title,
                  company: job.company_name,
                  status: payload.new.status,
                  timestamp: Date.now(),
                };

                setJobUpdates(prev => [update, ...prev.slice(0, 9)]);

                // Show notification
                toast.success('Application Update', {
                  description: `Your application for ${job.title} at ${job.company_name} is now ${payload.new.status}`,
                  action: {
                    label: 'View',
                    onClick: () => window.location.href = '/applications',
                  },
                });

                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ['job_applications'] });
              }
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      // Track AI job matches
      const matchesChannel = supabase
        .channel(`job_matches:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ai_job_matches',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            if (payload.new.match_score >= 80) {
              const { data: job } = await supabase
                .from('jobs')
                .select('title, company_name')
                .eq('id', payload.new.job_id)
                .single();

              if (job) {
                toast.success('🎯 New Job Match!', {
                  description: `${payload.new.match_score}% match: ${job.title} at ${job.company_name}`,
                  action: {
                    label: 'View Job',
                    onClick: () => window.location.href = `/jobs/${payload.new.job_id}`,
                  },
                  duration: 8000,
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(applicationsChannel);
        supabase.removeChannel(matchesChannel);
      };
    };

    setupJobTracking();
  }, [queryClient]);

  const clearUpdates = useCallback(() => {
    setJobUpdates([]);
  }, []);

  return {
    jobUpdates,
    isConnected,
    clearUpdates,
  };
}
