
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { JobsCategories } from '@/components/jobs/JobsCategories';
import { EnhancedJobFilters } from '@/components/jobs/EnhancedJobFilters';
import { JobsList } from '@/components/jobs/JobsList';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { useJobsRealtime, useAutoRefreshJobs } from '@/hooks/useRealtimeData';
import { AutoRefreshIndicator } from '@/components/shared/AutoRefreshIndicator';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const queryClient = useQueryClient();

  // Auto-refresh with realtime updates
  const { lastRefresh } = useAutoRefreshJobs();
  const { isConnected } = useJobsRealtime(
    (payload) => {
      console.log('Job updated:', payload);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    (payload) => {
      console.log('Application updated:', payload);
      queryClient.invalidateQueries({ queryKey: ['job_applications'] });
    }
  );

  // Get current user (optional for job viewing)
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

  // Enhanced search function that handles natural language (backend only)
  const processNaturalLanguageSearch = (searchTerm: string) => {
    const lowerTerm = searchTerm.toLowerCase();
    let processedFilters = { ...filters };
    
    // Handle remote work keywords
    if (lowerTerm.includes('remote') || lowerTerm.includes('work from home') || lowerTerm.includes('wfh')) {
      processedFilters.is_remote = true;
    }
    
    // Handle experience level keywords
    if (lowerTerm.includes('entry level') || lowerTerm.includes('fresher') || lowerTerm.includes('junior')) {
      processedFilters.experience_level = ['entry'];
    } else if (lowerTerm.includes('senior') || lowerTerm.includes('lead')) {
      processedFilters.experience_level = ['senior'];
    } else if (lowerTerm.includes('mid level') || lowerTerm.includes('intermediate')) {
      processedFilters.experience_level = ['mid'];
    }
    
    // Handle employment type keywords
    if (lowerTerm.includes('full time') || lowerTerm.includes('full-time')) {
      processedFilters.employment_type = ['full-time'];
    } else if (lowerTerm.includes('part time') || lowerTerm.includes('part-time')) {
      processedFilters.employment_type = ['part-time'];
    } else if (lowerTerm.includes('contract') || lowerTerm.includes('freelance')) {
      processedFilters.employment_type = ['contract'];
    }
    
    // Clean the search term by removing processed keywords
    let cleanedSearch = searchTerm
      .replace(/\b(remote|work from home|wfh|entry level|fresher|junior|senior|lead|mid level|intermediate|full time|full-time|part time|part-time|contract|freelance)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    processedFilters.search = cleanedSearch;
    
    return processedFilters;
  };

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

  // Auto-refresh jobs data every 20 seconds
  useSmartAutoRefresh(() => {
    refetch();
  }, REFRESH_INTERVALS.JOBS);

  // Set up realtime for jobs updates
  useJobsRealtime(
    () => refetch(),
    () => refetch()
  );

  // Get saved jobs (only if user is logged in)
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

  const handleQuickSearch = () => {
    // Process natural language search and apply filters
    const processedFilters = processNaturalLanguageSearch(filters.search);
    setFilters(processedFilters);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <OfflineIndicator />
      
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-center mb-2">
            <h1 className="text-lg md:text-xl font-bold mb-1">
              Find Your Dream Job
            </h1>
            <p className="text-blue-100 text-xs">
              Discover thousands of opportunities from top companies
            </p>
          </div>

          {/* Compact Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-1.5 shadow-lg">
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Job title, keywords, or company"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8 h-8 text-sm text-gray-900"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-8 h-8 w-28 text-sm text-gray-900"
                />
              </div>
              <Button 
                onClick={handleQuickSearch}
                className="h-8 px-4 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-1.5 rounded-full mb-1">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{allJobs.length}</div>
              <div className="text-xs text-gray-600">Total Jobs</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-1.5 rounded-full mb-1">
                <Sparkles className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{featuredJobs.length}</div>
              <div className="text-xs text-gray-600">Featured</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-1.5 rounded-full mb-1">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{remoteJobs.length}</div>
              <div className="text-xs text-gray-600">Remote</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-1.5 rounded-full mb-1">
                <Briefcase className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{categories.length}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </div>

      <JobsCategories categories={categories} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Job Opportunities</h2>
            <p className="text-sm text-gray-600 mt-0.5">Find your perfect match from {allJobs.length} active positions</p>
          </div>
          <div className="flex items-center gap-3">
            <AutoRefreshIndicator 
              isConnected={isConnected} 
              lastRefresh={lastRefresh}
            />
            <DataFreshness 
              lastUpdated={new Date(dataUpdatedAt || Date.now())}
              onRefresh={() => {
                refetch();
              }}
              isRefreshing={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-3 sticky top-4">
              <EnhancedJobFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
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
    </div>
  );
};

export default Jobs;
