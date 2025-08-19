
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
      const [
        { count: totalJobs },
        { count: activeJobs },
        { count: featuredJobs },
        { count: expiredJobs },
        { count: governmentJobs },
        { count: privateJobs }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true })
          .eq('job_status', 'open').eq('is_active', true).gte('expires_at', new Date().toISOString()),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true })
          .or(`status.eq.expired,expires_at.lt.${new Date().toISOString()}`),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_government_job', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_government_job', false)
      ]);

      return {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        featuredJobs: featuredJobs || 0,
        expiredJobs: expiredJobs || 0,
        governmentJobs: governmentJobs || 0,
        privateJobs: privateJobs || 0
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
