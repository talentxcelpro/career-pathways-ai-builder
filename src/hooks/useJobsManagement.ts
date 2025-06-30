
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useJobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url),
          profiles!jobs_posted_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          query = query.eq('is_active', true);
        } else if (statusFilter === 'inactive') {
          query = query.eq('is_active', false);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: jobStats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      const [
        { count: totalJobs },
        { count: activeJobs },
        { count: featuredJobs },
        { count: expiredJobs }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).lt('expires_at', new Date().toISOString())
      ]);

      return {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        featuredJobs: featuredJobs || 0,
        expiredJobs: expiredJobs || 0
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
    jobStats,
    filteredJobs
  };
};
