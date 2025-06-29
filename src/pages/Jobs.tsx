
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsCategories } from '@/components/jobs/JobsCategories';
import { EnhancedJobFilters } from '@/components/jobs/EnhancedJobFilters';
import EnhancedJobCard from '@/components/jobs/EnhancedJobCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useJobsAutoRefresh } from '@/hooks/useAutoRefresh';
import { useRealtimeJobs } from '@/hooks/useRealtimeData';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { realDataService } from '@/utils/realDataService';
import { aiJobService } from '@/utils/aiJobService';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrendingUp } from "lucide-react";

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
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<Record<string, any>>({});

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
        // Filter jobs that have at least one matching skill
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

  // Get applied jobs
  const { data: appliedJobsData = [] } = useQuery({
    queryKey: ['applied_jobs', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('job_applications')
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

  useEffect(() => {
    setAppliedJobs(appliedJobsData);
  }, [appliedJobsData]);

  // Calculate job matches for current user
  useEffect(() => {
    if (currentUser && allJobs.length > 0) {
      const calculateMatches = async () => {
        const matches: Record<string, any> = {};
        
        // Calculate matches for first 10 jobs to avoid overwhelming the system
        const jobsToMatch = allJobs.slice(0, 10);
        
        for (const job of jobsToMatch) {
          try {
            const match = await aiJobService.calculateJobMatch(job.id, currentUser.id);
            matches[job.id] = match;
          } catch (error) {
            console.error(`Error calculating match for job ${job.id}:`, error);
          }
        }
        
        setJobMatches(matches);
      };

      calculateMatches();
    }
  }, [currentUser, allJobs]);

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
        case 'match_score':
          if (currentUser) {
            const aMatch = jobMatches[a.id]?.matchScore || 0;
            const bMatch = jobMatches[b.id]?.matchScore || 0;
            return bMatch - aMatch;
          }
          return 0;
        default: // posted_at
          return new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime();
      }
    });
  }, [allJobs, sortBy, jobMatches, currentUser]);

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

  const handleApplyJob = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs(prev => [...prev, jobId]);
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
          
          <div className="lg:col-span-3">
            {/* Sort and Results */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : `${sortedJobs.length} jobs found`}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted_at">Newest First</SelectItem>
                  <SelectItem value="salary_max">Highest Salary</SelectItem>
                  <SelectItem value="views_count">Most Viewed</SelectItem>
                  <SelectItem value="applications_count">Least Competition</SelectItem>
                  {currentUser && (
                    <SelectItem value="match_score">Best Match</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Jobs
                </h2>
                <div className="space-y-4">
                  {featuredJobs.map((job) => (
                    <EnhancedJobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      onApply={handleApplyJob}
                      isSaved={savedJobs.includes(job.id)}
                      isApplied={appliedJobs.includes(job.id)}
                      matchScore={jobMatches[job.id]?.matchScore}
                      matchingSkills={jobMatches[job.id]?.matchingSkills}
                      showMatchScore={!!currentUser}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            {regularJobs.length > 0 && (
              <div>
                {featuredJobs.length > 0 && (
                  <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
                )}
                <div className="space-y-4">
                  {regularJobs.map((job) => (
                    <EnhancedJobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      onApply={handleApplyJob}
                      isSaved={savedJobs.includes(job.id)}
                      isApplied={appliedJobs.includes(job.id)}
                      matchScore={jobMatches[job.id]?.matchScore}
                      matchingSkills={jobMatches[job.id]?.matchingSkills}
                      showMatchScore={!!currentUser}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedJobs.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-lg border p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
