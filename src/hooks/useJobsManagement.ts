
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useJobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['admin-jobs', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          // Use job_status = 'open' AND is_active = true for active jobs
          query = query.eq('job_status', 'open').eq('is_active', true).gte('expires_at', new Date().toISOString());
        } else if (statusFilter === 'inactive') {
          // Use expired status OR past expiry date for inactive jobs
          query = query.or(`status.eq.expired,expires_at.lt.${new Date().toISOString()}`);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Jobs query error:', error);
        throw error;
      }
      return data || [];
    }
  });

  const { data: jobStats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      // Use unified analytics function for consistent data
      const { data: unifiedData, error } = await supabase.rpc('get_unified_analytics');
      
      if (error) {
        console.error('Unified analytics error:', error);
        throw error;
      }

      const now = new Date().toISOString();
      
      // Calculate stats from unified data
      const totalJobs = unifiedData?.length || 0;
      const activeJobs = unifiedData?.filter((job: any) => 
        job.job_status === 'open' && 
        job.is_active === true && 
        job.expires_at > now
      ).length || 0;
      const featuredJobs = unifiedData?.filter((job: any) => job.is_featured).length || 0;
      const expiredJobs = unifiedData?.filter((job: any) => 
        job.expires_at <= now || job.job_status === 'expired'
      ).length || 0;
      const governmentJobs = unifiedData?.filter((job: any) => job.is_government_job).length || 0;
      const privateJobs = unifiedData?.filter((job: any) => !job.is_government_job).length || 0;

      return {
        totalJobs,
        activeJobs,
        featuredJobs,
        expiredJobs,
        governmentJobs,
        privateJobs
      };
    }
  });

  const filteredJobs = jobs || [];

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    jobs,
    isLoading,
    error,
    jobStats,
    filteredJobs
  };
};
