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
import { Search, MapPin, Briefcase, Sparkles, Filter, Zap, ChevronDown, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const handleCategoryClick = (categoryName: string) => {
    setFilters(prev => ({ ...prev, search: categoryName }));
    refetch();
  };

  // Tag suggestions based on real-time trends
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 font-sans">
      <OfflineIndicator />
      
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-display mb-6">
              Find your dream job now
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Discover verified jobs, AI-matched roles, and top companies hiring.
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-5xl mx-auto mb-8">
            {/* Main Search Bar */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Skills / Designations / Companies"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-12 h-14 text-lg border-0 focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="lg:w-60">
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-14 border-0 bg-gray-50">
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
                
                <div className="lg:w-72">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Location or 'Remote only'"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-12 h-14 text-lg border-0 bg-gray-50"
                    />
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="h-14 px-8 bg-primary hover:bg-primary/90 shadow-lg"
                  onClick={handleQuickSearch}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            {/* Tag Suggestions */}
            <div className="text-center mb-6">
              <p className="text-white/80 mb-3">📍 Trending Searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleUniversalSearch(tag)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm transition-colors backdrop-blur-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Button */}
            <div className="text-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                onClick={() => handleUniversalSearch("Ask AI to suggest best jobs for me")}
              >
                <Brain className="h-5 w-5 mr-2" />
                🎯 Ask AI to suggest best jobs for me
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner Section */}
      <JobsBanner />

      {/* 3. Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Smart Filters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">🧠 Smart Filters</h3>
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
                <h2 className="text-3xl font-bold text-foreground font-display">Job Opportunities</h2>
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