import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Job } from '@/services/jobService';

export interface JobFilters {
  search?: string;
  location?: string;
  employment_types?: string[];
  experience_levels?: string[];
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  skills?: string[];
}

export const useRealtimeJobs = (filters: JobFilters = {}, sortBy: string = 'created_at') => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Real-time job data query
  const { 
    data: jobsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['realtime-jobs', filters, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
        p_page: 1,
        p_limit: 50,
        p_search: filters.search || '',
        p_location: filters.location || '',
        p_employment_types: filters.employment_types || [],
        p_experience_levels: filters.experience_levels || [],
        p_min_salary: filters.min_salary || 0,
        p_max_salary: filters.max_salary || 0,
        p_is_remote: filters.is_remote || false,
        p_skills: filters.skills || [],
        p_sort_by: sortBy
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up real-time job subscription...');
    
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('📡 Real-time job update received:', payload);
          
          // Invalidate and refetch job queries
          queryClient.invalidateQueries({ queryKey: ['realtime-jobs'] });
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          queryClient.invalidateQueries({ queryKey: ['featured-jobs'] });
          queryClient.invalidateQueries({ queryKey: ['trending-jobs'] });
          
          // Trigger immediate refetch
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        (payload) => {
          console.log('🏢 Real-time company update received:', payload);
          // Invalidate job queries as company data affects job display
          queryClient.invalidateQueries({ queryKey: ['realtime-jobs'] });
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🔌 Cleaning up real-time job subscription');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [queryClient, refetch]);

  // Real-time user presence tracking
  useEffect(() => {
    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('update_user_presence', {
          user_uuid: user.id,
          is_online_status: true
        });
      }
    };

    updatePresence();

    // Update presence every 5 minutes
    const presenceInterval = setInterval(updatePresence, 5 * 60 * 1000);

    return () => {
      clearInterval(presenceInterval);
    };
  }, []);

  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.total_count || 0;
  const hasMore = jobsData?.has_more || false;

  return {
    jobs,
    totalCount,
    hasMore,
    isLoading,
    error,
    isConnected,
    refetch
  };
};

// Real-time job statistics hook
export const useRealtimeJobStats = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['job-stats-realtime'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, is_featured, job_status, created_at, company_name')
        .eq('is_active', true);

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      return {
        totalJobs: data.length,
        featuredJobs: data.filter(job => job.is_featured).length,
        openJobs: data.filter(job => job.job_status === 'open').length,
        jobsToday: data.filter(job => new Date(job.created_at) >= today).length,
        jobsThisWeek: data.filter(job => new Date(job.created_at) >= thisWeek).length,
        topCompanies: Object.entries(
          data.reduce((acc, job) => {
            acc[job.company_name] = (acc[job.company_name] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([company, count]) => ({ company, count }))
      };
    },
    refetchInterval: 60000, // Update every minute
  });

  // Real-time stats subscription
  useEffect(() => {
    const channel = supabase
      .channel('job-stats-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['job-stats-realtime'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    stats,
    isLoading
  };
};