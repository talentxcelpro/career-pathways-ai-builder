import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { 
  Search, Brain, Filter, TrendingUp, Building, MapPin, Zap, 
  Star, Heart, Clock, Users, Award, Sparkles, Target, 
  ChevronRight, Play, Mic, Shield, Rocket, Bell, Grid3X3,
  List, RotateCcw, Briefcase, Coins
} from 'lucide-react';
import { z } from 'zod';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useJobsOptimized } from '@/hooks/useJobsOptimized';
import { useJobsCriticalPath } from '@/hooks/useJobsCriticalPath';
import { useRealtimeJobs, useRealtimeJobStats } from '@/hooks/useRealtimeJobs';
import { useStructuredData } from '@/hooks/useStructuredData';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTXCBalance } from '@/hooks/useTXCBalance';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

// Industry Data
import { COMPREHENSIVE_INDUSTRIES, INDUSTRY_CATEGORIES, TRENDING_INDUSTRIES, HIGH_GROWTH_INDUSTRIES } from '@/data/industries';

// New Components for TalentSpark Experience
import { TalentSparkJobCard } from '@/components/jobs/TalentSparkJobCard';
import { SwipeableJobCard } from '@/components/jobs/SwipeableJobCard';
import { GlobalSearch } from '@/components/jobs/GlobalSearch';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { JobCategoriesGrid } from '@/components/jobs/JobCategoriesGrid';
import { HundredsOfIndustriesSection } from '@/components/jobs/HundredsOfIndustriesSection';
import { OptimizedJobCard } from '@/components/jobs/OptimizedJobCard';
import { CompactJobCard } from '@/components/jobs/CompactJobCard';
import { SocialNetworkConversionCTA } from '@/components/network/SocialNetworkConversionCTA';

// Input validation schema for security
const filtersSchema = z.object({
  search: z.string().trim().max(200, "Search query must be less than 200 characters").optional(),
  location: z.string().trim().max(100, "Location must be less than 100 characters").optional(),
  company_name: z.string().trim().max(100, "Company name must be less than 100 characters").optional(),
  employment_type: z.array(z.string()).optional(),
  experience_level: z.array(z.string()).optional(),
  salary_min: z.number().min(0).max(10000000).optional(),
  salary_max: z.number().min(0).max(10000000).optional(),
  is_remote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  department: z.array(z.string()).optional(),
  company_type: z.array(z.string()).optional(),
  work_mode: z.array(z.string()).optional(),
  industry: z.array(z.string()).optional(),
  role_category: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  posted_by: z.array(z.string()).optional(),
  freshness: z.array(z.string()).optional(),
  company_id: z.string().optional(),
}).passthrough();

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // State Management
  const [filters, setFilters] = useState(() => {
    return {
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      employment_type: searchParams.get('employment_type')?.split(',').filter(Boolean) || [],
      experience_level: searchParams.get('experience_level')?.split(',').filter(Boolean) || [],
      salary_min: parseInt(searchParams.get('salary_min') || '0'),
      salary_max: parseInt(searchParams.get('salary_max') || '0'),
      is_remote: searchParams.get('is_remote') === 'true',
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
      department: [],
      company_type: [],
      work_mode: [],
      industry: [],
      role_category: [],
      education: [],
      posted_by: [],
      freshness: [],
      company_id: searchParams.get('company') || '',
    };
  });

  const [sortBy, setSortBy] = useState('posted_at');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'swipe' | 'list'>(() => {
    return window.innerWidth < 768 ? 'swipe' : 'card';
  });
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Real TXC Integration
  const { earnTXC } = useTXCIntegration();

  // Safe filter update function with validation
  const updateFilters = (newFilters: any) => {
    try {
      const validatedFilters = filtersSchema.parse(newFilters);
      setFilters(prev => ({ ...prev, ...validatedFilters }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('Invalid filter input:', error.errors);
        toast.error('Invalid search input. Please check your search terms.');
        return;
      }
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
  };

  // Get current user and TXC balance
  const { txcBalance } = useTXCBalance();
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // 300ms Debounce on search and location inputs to prevent keystroke query storms
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedLocation = useDebounce(filters.location, 300);

  const effectiveFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
    location: debouncedLocation
  }), [filters, debouncedSearch, debouncedLocation]);

  // Critical path loading for faster initial render via SearchService
  const { 
    jobs: allJobs, 
    totalCount,
    hasMore,
    isLoading, 
    isLoadingMore,
    loadMore,
    isEnhancing,
    refetch
  } = useJobsCriticalPath(effectiveFilters, sortBy);

  // Real-time job statistics
  const { stats: jobStats } = useRealtimeJobStats();

  // Google Compliant Listing Schema — WebSite & CollectionPage (No individual JobPosting on listing page)
  const isJobsSubdomain = typeof window !== 'undefined' && window.location.hostname.includes('jobs.');
  const canonicalUrl = isJobsSubdomain ? 'https://jobs.talentxcel.in/' : 'https://talentxcel.in/jobs';

  const jobsSchema = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return null;

    const domainOrigin = isJobsSubdomain ? 'https://jobs.talentxcel.in' : 'https://talentxcel.in';
    const pageUrl = isJobsSubdomain ? 'https://jobs.talentxcel.in/' : 'https://talentxcel.in/jobs';

    return {
      "@context": "https://schema.org/",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "TalentXcel Jobs",
          "url": domainOrigin,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${domainOrigin}/jobs?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "CollectionPage",
          "name": "TalentXcel Job Listings",
          "description": "Find your next career opportunity with AI-powered job matching",
          "url": pageUrl,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalCount,
            "itemListElement": allJobs.slice(0, 10).map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://jobs.talentxcel.in/jobs/${job.id}`,
              "name": job.title || 'Career Opportunity'
            }))
          }
        }
      ]
    };
  }, [allJobs, totalCount, isJobsSubdomain]);

  useStructuredData({ 
    schema: JSON.stringify(jobsSchema), 
    id: 'jobs-structured-data' 
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

  // Sort and categorize jobs
  const { featuredJobs, regularJobs, sortedJobs } = useMemo(() => {
    if (!allJobs) return { featuredJobs: [], regularJobs: [], sortedJobs: [] };
    
    const sorted = [...allJobs].sort((a, b) => {
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

    return {
      featuredJobs: sorted.filter(job => job.is_featured),
      regularJobs: sorted.filter(job => !job.is_featured),
      sortedJobs: sorted
    };
  }, [allJobs, sortBy]);

  // Handle job actions
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
        
        await supabase.rpc('update_user_txc_coins', {
          user_uuid: currentUser.id,
          coin_change: 5,
          reason: 'job_saved'
        });
        
        toast.success('Job saved! +5 TXC coins earned');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  };

  const handleQuickApply = async (jobId: string) => {
    if (!currentUser) {
      toast.error('Please login to apply');
      return;
    }

    await supabase.rpc('update_user_txc_coins', {
      user_uuid: currentUser.id,
      coin_change: 10,
      reason: 'job_application'
    });
    
    toast.success('Quick Apply submitted! +10 TXC coins earned');
  };

  const handleJobApplication = async (jobId: string, applicationData: any) => {
    if (!currentUser) {
      toast.error('Please login to apply');
      return;
    }

    try {
      const { error } = await supabase
        .from('enhanced_job_applications')
        .insert({
          user_id: currentUser.id,
          job_id: jobId,
          status: 'applied',
          current_role: applicationData.currentRole,
          current_ctc: applicationData.currentCTC ? parseFloat(applicationData.currentCTC) * 100000 : null,
          expected_ctc: applicationData.expectedCTC ? parseFloat(applicationData.expectedCTC) * 100000 : null,
          notice_period: applicationData.noticePeriod,
          preferred_location: applicationData.location,
          resume_url: applicationData.resumeUrl,
          additional_files: [],
          application_data: {
            fullName: applicationData.fullName,
            email: applicationData.email,
            phoneNumber: applicationData.phoneNumber,
            yearsOfExperience: applicationData.yearsOfExperience,
            readyToRelocate: applicationData.readyToRelocate,
            coverLetter: applicationData.coverLetter,
            linkedinProfile: applicationData.linkedinProfile,
            portfolioWebsite: applicationData.portfolioWebsite,
            appliedAt: applicationData.appliedAt
          }
        });

      if (error) throw error;

      await supabase.rpc('update_user_txc_coins', {
        user_uuid: currentUser.id,
        coin_change: 10,
        reason: 'job_application'
      });

      toast.success('Application submitted successfully! +10 TXC coins earned');
      setSwipeIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <>
      <SEOHead 
        title="TalentXcel Jobs — Discover Jobs That Match Your Ambition" 
        description="Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career. Verified employers and direct 1-click ATS applications." 
        canonical={canonicalUrl} 
        type="website" 
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        
        {/* Compact, High-Efficiency Sticky Search & Filter Header */}
        <div className="border-b border-border/10 bg-background/95 backdrop-blur-md sticky top-0 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 space-y-1.5">
            
            {/* Top Row: Compact Title + Global Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Briefcase className="h-3 w-3" />
                    TalentXcel Jobs
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">• Active Jobseekers & Professionals</span>
                </div>
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>Discover Jobs That Match Your Ambition</span>
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">
                  Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career.
                </p>
              </div>

              {/* Compact Global Search Bar */}
              <div className="w-full md:max-w-xl">
                <GlobalSearch
                  value={filters.search}
                  onChange={(value) => updateFilters({ search: value })}
                  onSearch={() => refetch()}
                  onFiltersChange={(newFilters) => {
                    updateFilters(newFilters);
                    refetch();
                  }}
                  placeholder="Search jobs by role, skills, location, experience..."
                  buttonText="Search Jobs"
                  recentJobs={regularJobs.slice(0, 5)}
                />
              </div>
            </div>

            {/* Bottom Row: Sleek Horizontal Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5 touch-pan-x text-xs">
              <Button
                variant={filters.is_remote ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ is_remote: !filters.is_remote })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0 font-medium"
              >
                🌐 Remote
              </Button>
              <Button
                variant={filters.search === 'AI' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'AI' ? '' : 'AI' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                ⚡ AI & ML
              </Button>
              <Button
                variant={filters.search === 'Engineer' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'Engineer' ? '' : 'Engineer' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                💻 Tech & Engineering
              </Button>
              <Button
                variant={filters.search === 'Finance' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'Finance' ? '' : 'Finance' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                💳 FinTech
              </Button>
              <Button
                variant={filters.search === 'Product' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'Product' ? '' : 'Product' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                🎯 Product & Design
              </Button>
              <Button
                variant={filters.search === 'Cloud' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'Cloud' ? '' : 'Cloud' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                🏗️ Cloud & DevOps
              </Button>
              <Button
                variant={filters.search === 'Marketing' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ search: filters.search === 'Marketing' ? '' : 'Marketing' })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                📈 Marketing
              </Button>
              <Button
                variant={filters.experience_level?.some((l: string) => ['fresher', 'entry-level', '0-1 years'].includes(l.toLowerCase())) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const isFiltered = filters.experience_level?.some((l: string) => ['fresher', 'entry-level', '0-1 years'].includes(l.toLowerCase()));
                  updateFilters({ experience_level: isFiltered ? [] : ['fresher'] });
                }}
                className={`whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0 font-medium transition-all ${
                  filters.experience_level?.some((l: string) => ['fresher', 'entry-level', '0-1 years'].includes(l.toLowerCase()))
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                🎓 Freshers (0-1 yrs)
              </Button>
              <Button
                variant={filters.company_type?.includes('mnc') ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ company_type: filters.company_type?.includes('mnc') ? [] : ['mnc'] })}
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0"
              >
                🏢 Fortune 500
              </Button>
              <Button
                onClick={() => navigate('/career-dashboard')}
                variant="default"
                size="sm"
                className="whitespace-nowrap h-6 px-2.5 text-[11px] rounded-full shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                Copilot
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-8">
          <div className="flex gap-6">
            
            {/* Left Sidebar - Job Filters (Direct non-blocking card, 0 duplicate headers) */}
            <aside className="w-72 flex-shrink-0 hidden lg:block" aria-label="Job Filters">
              <ComprehensiveJobFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={() => {
                  setFilters({
                    search: '', location: '', employment_type: [], experience_level: [],
                    salary_min: 0, salary_max: 0, is_remote: false, skills: [],
                    department: [], company_type: [], work_mode: [], industry: [],
                    role_category: [], education: [], posted_by: [], freshness: [], company_id: ''
                  });
                  refetch();
                }}
                className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin shadow-xs border-border/40"
              />
            </aside>

            {/* Right Main Content */}
            <div className="flex-1 min-w-0">
              
              {/* Compact Value Proposition Banner */}
              <div className="mb-3 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-foreground truncate text-xs">
                    <strong className="font-semibold">Optimize Your Application:</strong> Free instant ATS match score against any role.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    conversionTelemetry.track('signup_cta_click', { source: 'jobs' });
                    conversionTelemetry.setAcquisitionContext('jobs', '/jobs');
                    navigate('/resume/ats-check?source=jobs');
                  }}
                  className="h-6 px-2.5 text-[11px] shrink-0 font-semibold border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                >
                  Free ATS Audit →
                </Button>
              </div>

              {/* Featured Jobs Section */}
              {featuredJobs.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <h2 className="text-sm sm:text-base font-bold">Featured Opportunities</h2>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0">Premium</Badge>
                  </div>
                  <div className={
                    viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-3.5' :
                    viewMode === 'list' ? 'space-y-2' :
                    'space-y-3.5'
                  }>
                    {featuredJobs.map((job) => (
                      <TalentSparkJobCard
                        key={job.id}
                        job={job}
                        onSave={handleSaveJob}
                        onQuickApply={handleQuickApply}
                        isSaved={savedJobs.includes(job.id)}
                        txcReward={15}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Jobs Section */}
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-border/20 flex-wrap gap-2.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h2 className="text-base sm:text-lg font-bold">All Verified Openings</h2>
                    <Badge variant="outline" className="text-xs font-mono">{totalCount} total</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* View Switcher: Cards / List / Swipe */}
                    <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40">
                      <button
                        type="button"
                        onClick={() => setViewMode('card')}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          viewMode === 'card' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Card View"
                      >
                        <Grid3X3 className="h-3 w-3" />
                        <span className="hidden sm:inline">Cards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          viewMode === 'list' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="List View"
                      >
                        <List className="h-3 w-3" />
                        <span className="hidden sm:inline">List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setViewMode('swipe'); setSwipeIndex(0); }}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          viewMode === 'swipe' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Swipe Mode"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="hidden sm:inline">Swipe</span>
                      </button>
                    </div>

                    {/* Sort by dropdown */}
                    <div className="flex items-center gap-1">
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground h-7"
                      >
                        <option value="posted_at">Latest First</option>
                        <option value="salary_max">Highest Salary</option>
                        <option value="views_count">Most Popular</option>
                        <option value="applications_count">Easy Apply</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job Content Based on Loading State */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-muted-foreground">Finding perfect job matches...</p>
                    </div>
                  </div>
                ) : allJobs.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="text-6xl">🔍</div>
                      <h3 className="text-2xl font-bold">No jobs found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Try adjusting your filters or search terms to find more opportunities.
                      </p>
                      <Button onClick={() => {
                        setFilters({
                          search: '', location: '', employment_type: [], experience_level: [],
                          salary_min: 0, salary_max: 0, is_remote: false, skills: [],
                          department: [], company_type: [], work_mode: [], industry: [],
                          role_category: [], education: [], posted_by: [], freshness: [], company_id: ''
                        });
                        refetch();
                      }}>
                        Clear All Filters
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Swipe Mode */}
                    {viewMode === 'swipe' ? (
                      <div className="max-w-md mx-auto">
                        <div className="text-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <RotateCcw className="h-5 w-5 text-purple-600" />
                            <span className="font-bold text-purple-800">Swipe Mode Active</span>
                          </div>
                          <p className="text-sm text-purple-700 mb-2">
                            Find your perfect job match with intelligent swiping
                          </p>
                          <div className="flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>Reject</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>Super Apply</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>Save</span>
                            </div>
                          </div>
                        </div>
                        
                        <SwipeableJobCard
                          jobs={sortedJobs}
                          currentIndex={swipeIndex}
                          onSave={handleSaveJob}
                          onQuickApply={handleQuickApply}
                          onReject={async (jobId) => {
                            if (currentUser) {
                              await supabase.rpc('update_user_txc_coins', {
                                user_uuid: currentUser.id,
                                coin_change: 2,
                                reason: 'job_rejected'
                              });
                              toast.success('Job rejected! +2 TXC coins for engagement');
                            }
                            setSwipeIndex(prev => prev + 1);
                          }}
                          onApplication={handleJobApplication}
                          isLoggedIn={!!currentUser}
                        />
                        
                        {swipeIndex >= regularJobs.length && (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              You've seen all available jobs. Check back later for new opportunities.
                            </p>
                            <Button onClick={() => setSwipeIndex(0)}>
                              Start Over
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Card and List Views */
                      <div className={
                        viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' :
                        viewMode === 'list' ? 'space-y-2' :
                        'space-y-4'
                      }>
                        {regularJobs.map((job) => (
                          viewMode === 'list' ? (
                            <CompactJobCard
                              key={job.id}
                              job={job}
                              onSave={handleSaveJob}
                              onApply={handleQuickApply}
                              isSaved={savedJobs.includes(job.id)}
                            />
                          ) : (
                            <OptimizedJobCard
                              key={job.id}
                              job={job}
                              onSave={handleSaveJob}
                            onApply={handleQuickApply}
                            isSaved={savedJobs.includes(job.id)}
                          />
                          )
                        ))}
                      </div>
                    )}

                    {/* Progressive Load More Opportunities */}
                    {hasMore && (
                      <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-3">
                        <div className="text-xs text-muted-foreground font-mono">
                          Showing {allJobs.length} of {totalCount} active verified opportunities
                        </div>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={loadMore}
                          disabled={isLoadingMore}
                          className="px-8 py-3 text-sm font-bold bg-card hover:bg-primary hover:text-primary-foreground border-primary/30 shadow-md transition-all gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Loading more opportunities...</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span>Load More Jobs (+{Math.min(24, totalCount - allJobs.length)})</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    {!hasMore && allJobs.length > 0 && totalCount > 24 && (
                      <div className="text-center py-6 text-xs text-muted-foreground border-t border-border/30 mt-6">
                        ✓ You have viewed all {totalCount} active verified opportunities.
                      </div>
                    )}

                    {/* Viral Social Network Conversion Flywheel Banner */}
                    <SocialNetworkConversionCTA
                      roleTitle={filters.search}
                      location={filters.location}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating AI Career Intelligence Hub Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => navigate('/ai-career-hub')}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
          >
            <Brain className="h-6 w-6 group-hover:animate-pulse" />
          </Button>
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Career Hub
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 lg:h-0" />
    </>
  );
};

export default Jobs;
