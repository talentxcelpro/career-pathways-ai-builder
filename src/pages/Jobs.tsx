import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { JobsBanner } from '@/components/jobs/JobsBanner';
import { TopCompaniesHiring } from '@/components/jobs/TopCompaniesHiring';
import { JobCategories } from '@/components/jobs/JobCategories';
import { TrustSection } from '@/components/jobs/TrustSection';
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
import { Search, MapPin, Filter, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [experienceLevel, setExperienceLevel] = useState('');
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
      title: 'Find Your Dream Job Now | TalentXcel Jobs',
      description: 'Discover verified jobs, AI-matched roles, and top companies hiring. Join thousands who found their perfect job with TalentXcel.',
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

      const { data, error } = await query
        .order('posted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Auto-refresh jobs data
  useSmartAutoRefresh(() => {
    refetch();
  }, REFRESH_INTERVALS.JOBS);

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

  // Sort jobs
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
        default:
          return new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime();
      }
    });
  }, [allJobs, sortBy]);

  const featuredJobs = sortedJobs.filter(job => job.is_featured);
  const regularJobs = sortedJobs.filter(job => !job.is_featured);

  const handleSaveJob = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('job_id', jobId);
        
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast.success('Job removed from saved');
      } else {
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
      setFilters(prev => ({ ...prev, search: query }));
    }
    refetch();
  };

  const handleCategoryClick = (categoryName: string) => {
    setFilters(prev => ({ ...prev, search: categoryName }));
    refetch();
  };

  const tagSuggestions = [
    'Remote Jobs',
    '10+ LPA',
    'MNCs',
    'Top Startups',
    'Walk-ins Today',
    'React Developer',
    'Data Scientist',
    'Product Manager'
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <OfflineIndicator />
      
      {/* 1. Hero Section - Compact */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              Find your dream job now
            </h1>
            <p className="text-sm md:text-base text-white/90 mb-4 max-w-2xl mx-auto">
              Discover verified jobs, AI-matched roles, and top companies hiring.
            </p>
          </div>

          {/* Enhanced Search Section - Compact */}
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Skills / Designations / Companies"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 h-10 text-sm border-0 focus:ring-2 focus:ring-primary/20 bg-gray-50 text-gray-800 font-medium"
                    />
                  </div>
                </div>
                
                <div className="lg:w-48">
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-10 border-0 bg-gray-50 text-gray-800 text-sm">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Fresher (0-1 years)</SelectItem>
                      <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                      <SelectItem value="mid">Mid-level (3-6 years)</SelectItem>
                      <SelectItem value="senior">Senior (6+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="lg:w-56">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Location"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10 h-10 text-sm border-0 bg-gray-50 text-gray-800 font-medium"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setFilters(prev => ({ ...prev, is_remote: !prev.is_remote }))}
                  className={`px-4 h-10 text-sm font-medium rounded-lg transition-colors border-0 ${
                    filters.is_remote 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Remote
                </button>
                
                <Button 
                  size="sm" 
                  className="h-10 px-6 bg-primary hover:bg-primary/90 text-sm"
                  onClick={() => refetch()}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>
            
            {/* Tag Suggestions - Compact */}
            <div className="text-center mb-3">
              <p className="text-white/80 mb-2 text-sm">🌐 Suggested Searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['React Dev', 'SAP Consultant', 'Remote Jobs', 'Noida', '10+ LPA'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleUniversalSearch(tag)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs transition-colors backdrop-blur-sm font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-sm font-medium"
                onClick={() => handleUniversalSearch("Ask AI to suggest best jobs for me")}
              >
                <Brain className="h-4 w-4 mr-2" />
                🧠 Ask AI to find best jobs for me
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner Section */}
      <JobsBanner />

      {/* 3. Main Content - Compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Smart Filters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base text-foreground">🧠 Smart Filters</h3>
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Job Opportunities</h2>
                <p className="text-sm text-muted-foreground">Find your perfect match from {allJobs.length} active positions</p>
              </div>
              <div className="flex items-center gap-2">
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

      {/* 6. Top Companies Hiring */}
      <TopCompaniesHiring />

      {/* 7. Browse by Categories */}
      <JobCategories onCategoryClick={handleCategoryClick} />

      {/* 8. Trust & FOMO Section */}
      <TrustSection />

      {/* 9. Floating Apply Widget (Mobile) */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
        <div className="bg-primary text-white rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">🔎 {allJobs.length} Jobs Matched</p>
              <p className="text-sm text-white/80">Find your perfect role</p>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;