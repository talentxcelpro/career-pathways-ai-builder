
import React, { useState, useEffect } from 'react';
import { JobSearch } from '@/components/jobs/JobSearch';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsCategories } from '@/components/jobs/JobsCategories';
import { JobsList } from '@/components/jobs/JobsList';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Jobs() {
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 500000,
    is_remote: false,
    skills: [] as string[],
    category_id: ''
  });

  // Fetch job categories
  const { data: categories = [] } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch jobs with filters
  const { data: jobs = [], isLoading, refetch } = useQuery({
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
            industry,
            location
          ),
          job_categories (
            name,
            slug
          )
        `)
        .eq('is_active', true);

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
      
      if (filters.salary_min > 0) {
        query = query.gte('salary_min', filters.salary_min);
      }
      
      if (filters.salary_max < 500000) {
        query = query.lte('salary_max', filters.salary_max);
      }
      
      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }
      
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.skills.length > 0) {
        query = query.overlaps('skills_required', filters.skills);
      }

      // Apply sorting
      switch (sortBy) {
        case 'posted_at':
          query = query.order('posted_at', { ascending: false });
          break;
        case 'salary_max':
          query = query.order('salary_max', { ascending: false });
          break;
        case 'views_count':
          query = query.order('views_count', { ascending: false });
          break;
        case 'applications_count':
          query = query.order('applications_count', { ascending: true });
          break;
        default:
          query = query.order('posted_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (data) {
        setSavedJobs(data.map(item => item.job_id));
      }
    };

    fetchSavedJobs();
  }, []);

  // Save/unsave job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isSaved = savedJobs.includes(jobId);
      
      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        if (error) throw error;
        return { action: 'removed', jobId };
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            job_id: jobId
          });
        if (error) throw error;
        return { action: 'saved', jobId };
      }
    },
    onSuccess: ({ action, jobId }) => {
      if (action === 'saved') {
        setSavedJobs(prev => [...prev, jobId]);
        toast.success('Job saved successfully');
      } else {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      }
    },
    onError: (error) => {
      toast.error('Failed to save job');
      console.error('Save job error:', error);
    }
  });

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      location: location
    }));
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: 0,
      salary_max: 500000,
      is_remote: false,
      skills: [],
      category_id: ''
    });
    setSearchTerm('');
    setLocation('');
  };

  const handleSaveJob = (jobId: string) => {
    saveJobMutation.mutate(jobId);
  };

  const featuredJobs = jobs.filter(job => job.is_featured);
  const regularJobs = jobs.filter(job => !job.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <JobsHeader
          jobsCount={jobs.length}
          remoteJobsCount={jobs.filter(j => j.is_remote).length}
          featuredJobsCount={featuredJobs.length}
          categoriesCount={categories.length}
        />

        <JobSearch
          searchTerm={searchTerm}
          location={location}
          onSearchChange={setSearchTerm}
          onLocationChange={setLocation}
          onSearch={handleSearch}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        <JobsCategories categories={categories} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              categories={categories}
            />
          </div>

          <JobsList
            jobs={jobs}
            featuredJobs={featuredJobs}
            regularJobs={regularJobs}
            savedJobs={savedJobs}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoading}
            onSaveJob={handleSaveJob}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}
