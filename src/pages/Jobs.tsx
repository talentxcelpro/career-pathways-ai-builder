
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsCategories } from '@/components/jobs/JobsCategories';
import { EnhancedJobFilters } from '@/components/jobs/EnhancedJobFilters';
import { JobsList } from '@/components/jobs/JobsList';
import { useJobsAutoRefresh } from '@/hooks/useAutoRefresh';
import { useRealtimeJobs } from '@/hooks/useRealtimeData';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Jobs = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 0,
    is_remote: false,
    skills: [] as string[],
  });
  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auto-refresh and real-time updates
  const { manualRefresh } = useJobsAutoRefresh();
  useRealtimeJobs();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Meta tags for SEO
  useEffect(() => {
    updateMetaTags({
      title: 'Find Your Dream Job | TalentXcel Jobs',
      description: 'Discover thousands of job opportunities across India. Find remote jobs, full-time positions, and career opportunities that match your skills.',
      url: `${window.location.origin}/jobs`,
    });
  }, []);

  // Fetch jobs with enhanced filtering
  const { data: allJobs = [], isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['jobs', filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open');

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      }
      if (filters.experience_level.length > 0) {
        query = query.in('experience_level', filters.experience_level);
      }
      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }
      if (filters.salary_min > 0) {
        query = query.gte('salary_min', filters.salary_min);
      }
      if (filters.salary_max > 0) {
        query = query.lte('salary_max', filters.salary_max);
      }
      if (filters.skills.length > 0) {
        const skillFilters = filters.skills.map(skill => `skills_required.cs.{"${skill}"}`);
        query = query.or(skillFilters.join(','));
      }

      const { data, error } = await query
        .order('posted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get saved jobs
  const { data: savedJobsData = [] } = useQuery({
    queryKey: ['saved_jobs', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      return data.map(item => item.job_id);
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    setSavedJobs(savedJobsData);
  }, [savedJobsData]);

  // Sort jobs based on sortBy
  const sortedJobs = React.useMemo(() => {
    if (!allJobs) return [];
    
    return [...allJobs].sort((a, b) => {
      switch (sortBy) {
        case 'salary_max':
          return (b.salary_max || 0) - (a.salary_max || 0);
        case 'views_count':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'applications_count':
          return (a.applications_count || 0) - (b.applications_count || 0);
        default: // posted_at
          return new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime();
      }
    });
  }, [allJobs, sortBy]);

  const featuredJobs = sortedJobs.filter(job => job.is_featured);
  const regularJobs = sortedJobs.filter(job => !job.is_featured);
  const remoteJobs = sortedJobs.filter(job => job.is_remote);

  // Categories with proper structure including slug
  const categories = [
    { id: '1', name: 'Technology', slug: 'technology' },
    { id: '2', name: 'Marketing', slug: 'marketing' },
    { id: '3', name: 'Design', slug: 'design' },
    { id: '4', name: 'Sales', slug: 'sales' },
    { id: '5', name: 'Finance', slug: 'finance' },
  ];

  const handleSaveJob = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        // Unsave job
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('job_id', jobId);
        
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      } else {
        // Save job
        await supabase
          .from('saved_jobs')
          .insert({ user_id: currentUser.id, job_id: jobId });
        
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: 0,
      salary_max: 0,
      is_remote: false,
      skills: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <JobsHeader 
        jobsCount={allJobs.length}
        remoteJobsCount={remoteJobs.length}
        featuredJobsCount={featuredJobs.length}
        categoriesCount={categories.length}
      />
      <JobsCategories categories={categories} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
          <DataFreshness 
            lastUpdated={new Date(dataUpdatedAt || Date.now())}
            onRefresh={() => {
              manualRefresh();
              refetch();
            }}
            isRefreshing={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <EnhancedJobFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          <JobsList
            jobs={sortedJobs}
            featuredJobs={featuredJobs}
            regularJobs={regularJobs}
            savedJobs={savedJobs}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoading}
            onSaveJob={handleSaveJob}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Jobs;
