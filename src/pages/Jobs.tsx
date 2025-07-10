
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
import { Search, MapPin, Briefcase, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

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

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    if (aiFilters) {
      // Convert AI filters to our internal filter format
      const newFilters = {
        search: aiFilters.query || query,
        location: aiFilters.location || '',
        employment_type: aiFilters.employment_type || [],
        experience_level: aiFilters.experience_level || [],
        salary_min: aiFilters.min_salary || 0,
        salary_max: aiFilters.max_salary || 0,
        is_remote: aiFilters.remote || false,
        skills: aiFilters.skills || [],
      };
      setFilters(newFilters);
    } else {
      // Fallback to basic search
      setFilters(prev => ({ ...prev, search: query }));
    }
    refetch();
  };

  const handleQuickSearch = () => {
    // Process natural language search and apply filters
    const processedFilters = processNaturalLanguageSearch(filters.search);
    setFilters(processedFilters);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
      <OfflineIndicator />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🚀 Find Your Dream Job
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-2">
              ✨ Personalized by AI • Verified by Experts • Applied by Thousands
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <UniversalSearchBar
                  searchType="jobs"
                  onSearch={handleUniversalSearch}
                  placeholder="Job Title, Skills, Companies..."
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-0"
                  showSuggestions={true}
                  showFilters={false}
                />
              </div>
              <div className="md:w-80">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10 h-12 bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setFilters(prev => ({ ...prev, is_remote: true }))}
              >
                Remote
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => handleUniversalSearch("Ask AI to find best jobs for me")}
              >
                🧠 Ask AI to find best jobs for me
              </Button>
            </div>

            {/* Suggested Searches */}
            <div className="text-center mt-4">
              <p className="text-sm text-primary-foreground/70 mb-2">🌐 Suggested Searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['React Dev', 'SAP Consultant', 'Remote Jobs', 'Noida', '10+ LPA'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleUniversalSearch(suggestion)}
                    className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              🎯 2,430 professionals found jobs this month through TalentXcel AI.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Smart Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg border p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">🧠 Smart Filters</h3>
              </div>
              <EnhancedJobFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
          
          {/* Jobs Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Job Opportunities</h2>
                <p className="text-muted-foreground">Find your perfect match from {allJobs.length} active positions</p>
              </div>
              <div className="flex items-center gap-3">
                <AutoRefreshIndicator 
                  isConnected={isConnected} 
                  lastRefresh={lastRefresh}
                />
                <DataFreshness 
                  lastUpdated={new Date(dataUpdatedAt || Date.now())}
                  onRefresh={() => refetch()}
                  isRefreshing={isLoading}
                />
              </div>
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
    </div>
  );
};

export default Jobs;
