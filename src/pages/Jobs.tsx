import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Filter, TrendingUp, Building, MapPin } from 'lucide-react';
import { HeroSection } from '@/components/branded/HeroSection';
import { SectionHighlights } from '@/components/branded/SectionHighlights';
import { BenefitsSection } from '@/components/branded/BenefitsSection';
import { BrandedFooter } from '@/components/branded/BrandedFooter';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

const Jobs = () => {
  const navigate = useNavigate();

  // Branded content data
  const highlights = [
    {
      icon: Brain,
      title: "AI Job Matching",
      description: "Get personalized job recommendations based on your skills, experience, and career goals using advanced AI algorithms.",
      aiPowered: true
    },
    {
      icon: Filter,
      title: "Smart Filters",
      description: "Find exactly what you're looking for with intelligent filters for location, salary, company size, and remote options.",
      aiPowered: true
    },
    {
      icon: Building,
      title: "Company Insights",
      description: "Access detailed company profiles, culture insights, salary ranges, and employee reviews before applying."
    },
    {
      icon: TrendingUp,
      title: "Application Tracking",
      description: "Keep track of all your applications with real-time status updates and interview scheduling."
    },
    {
      icon: MapPin,
      title: "Salary Insights",
      description: "Get accurate salary data and market insights to negotiate better offers with confidence.",
      aiPowered: true
    }
  ];

  const benefits = [
    {
      title: "85% Faster Job Discovery",
      description: "AI-powered matching helps you find relevant opportunities 85% faster than traditional job boards."
    },
    {
      title: "Higher Success Rate",
      description: "Our smart matching increases your application success rate by 60% through better job-candidate alignment."
    },
    {
      title: "Real-Time Market Data",
      description: "Access live salary data, hiring trends, and company insights to make informed career decisions."
    },
    {
      title: "Personalized Experience",
      description: "Every job recommendation is tailored to your unique profile, preferences, and career aspirations."
    }
  ];

  const userTypes = [
    "Recent Graduates",
    "Career Changers", 
    "Remote Workers",
    "Senior Professionals",
    "Freelancers",
    "Industry Specialists"
  ];
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

  const handleGetStarted = () => {
    navigate('/jobs');
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* TalentXcel Branded Hero Section */}
      <HeroSection
        title="Find Jobs Faster – Powered by AI Matching"
        subtitle="Discover opportunities that perfectly match your skills and career goals. Our AI technology connects you with the right employers faster than ever before."
        ctaText="Explore Jobs"
        ctaAction={handleGetStarted}
        showAIBadge={true}
      />

      {/* Section Highlights */}
      <SectionHighlights
        title="Why Choose TalentXcel Jobs?"
        highlights={highlights}
      />

      {/* Benefits Section */}
      <BenefitsSection
        title="Accelerate Your Career Journey"
        subtitle="Join thousands of professionals who found their dream jobs through our AI-powered platform"
        benefits={benefits}
        userTypes={userTypes}
      />
      
      {/* 1. Minimalist Header (1/8th size) */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Minimalist Title */}
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 text-center">
            Find Jobs Faster – Powered by AI Matching
          </h1>
          
          {/* 2. Condensed Search Bar (Single Row) */}
          <div className="flex flex-col lg:flex-row gap-2 items-center max-w-5xl mx-auto">
            <div className="flex-1 flex gap-2 w-full overflow-x-auto">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Skills / Designations"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 h-9 text-sm border-gray-200 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="min-w-[140px]">
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="h-9 text-sm border-gray-200">
                    <SelectValue placeholder="Experience ⌄" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="entry">Fresher (0-1y)</SelectItem>
                    <SelectItem value="junior">Junior (1-3y)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-6y)</SelectItem>
                    <SelectItem value="senior">Senior (6+y)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="min-w-[120px]">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-9 h-9 text-sm border-gray-200 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer min-w-[80px]">
                <input
                  type="checkbox"
                  checked={filters.is_remote}
                  onChange={(e) => setFilters(prev => ({ ...prev, is_remote: e.target.checked }))}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">Remote</span>
              </label>
            </div>
            
            <Button 
              size="sm" 
              className="h-9 px-4 bg-primary hover:bg-primary/90 text-sm whitespace-nowrap"
              onClick={() => refetch()}
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
          
          {/* 3. Focused CTA */}
          <div className="text-center mt-3">
            <Button 
              size="sm" 
              variant="outline"
              className="text-sm font-medium border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => handleUniversalSearch("Ask AI to suggest best jobs for me")}
            >
              <Brain className="h-4 w-4 mr-1" />
              🧠 Let AI Match Me to Jobs
            </Button>
          </div>
          
          {/* Floating Job Count */}
          <div className="absolute top-3 right-4 hidden md:block">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
              {allJobs.length} Jobs Found
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Featured Jobs Above the Fold */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Featured Jobs Section - Immediately Visible */}
        {featuredJobs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✨</span>
              <h2 className="text-xl font-bold text-gray-900">Featured Jobs (Top Priority)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job.companies?.logo_url && (
                        <img src={job.companies.logo_url} alt={job.companies.name} className="w-8 h-8 rounded" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                        <p className="text-xs text-gray-600">{job.companies?.name}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{job.location} • {job.employment_type}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-primary">
                      {job.salary_min && job.salary_max ? `₹${job.salary_min/100000}L - ₹${job.salary_max/100000}L` : 'Salary not disclosed'}
                    </span>
                    <Button size="sm" className="text-xs h-7 px-3">Apply</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Smart Filters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base text-gray-900">🧠 Smart Filters</h3>
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
                <h2 className="text-xl font-bold text-gray-900">All Job Opportunities</h2>
                <p className="text-sm text-gray-600">Find your perfect match from {allJobs.length} active positions</p>
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
              jobs={regularJobs}
              featuredJobs={[]}
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

      {/* Top Companies Hiring - Moved up */}
      <TopCompaniesHiring />

      {/* Mock Interview Banner - Moved to bottom */}
      <JobsBanner />

      {/* Browse by Categories */}
      <JobCategories onCategoryClick={handleCategoryClick} />

      {/* Trust & FOMO Section */}
      <TrustSection />

      {/* Floating Apply Widget (Mobile) */}
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

      {/* TalentXcel Branded Footer */}
      <BrandedFooter />
    </div>
  );
};

export default Jobs;