import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { buildJobPostingSchema } from '@/lib/seo/jobPostingSchema';

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
});

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

  // Critical path loading for faster initial render
  const { 
    jobs: allJobs, 
    totalCount,
    hasMore,
    isLoading, 
    isEnhancing,
    refetch
  } = useJobsCriticalPath(filters, sortBy);

  // Real-time job statistics
  const { stats: jobStats } = useRealtimeJobStats();

  // Google Jobs Schema
  const jobsSchema = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return null;

    const jobPostings = allJobs
      .slice(0, 10)
      .map(job => buildJobPostingSchema(job))
      .filter(Boolean);

    return {
      "@context": "https://schema.org/",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "TalentXcel Jobs",
          "url": "https://talentxcel.in",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://talentxcel.in/jobs?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "CollectionPage",
          "name": "TalentXcel Job Listings",
          "description": "Find your next career opportunity with AI-powered job matching",
          "url": "https://talentxcel.in/jobs",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalCount,
            "itemListElement": jobPostings.map((job, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": job
            }))
          }
        },
        ...jobPostings
      ]
    };
  }, [allJobs, totalCount]);

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
      <Helmet>
        <title>Search Verified Jobs in India | AI-Matched Career Opportunities — TalentXcel</title>
        <meta name="description" content="Discover thousands of verified tech, engineering, sales, and executive job openings across India with TalentXcel AI matching. Instant apply, transparent salary data, and direct recruiter connections." />
        <meta name="keywords" content="jobs india, verified tech jobs, ai job matching, fresher jobs, remote jobs india, bangalore jobs, hyderabad jobs, talentxcel hiring" />
        <link rel="canonical" href="https://talentxcel.in/jobs" />
        
        <meta property="og:title" content="Search Verified Jobs in India | TalentXcel AI Career Platform" />
        <meta property="og:description" content="Discover thousands of verified tech, engineering, and business job openings across India with AI-powered candidate matching." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/jobs" />
        <meta property="og:image" content="https://talentxcel.in/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Verified Jobs in India | TalentXcel" />
        <meta name="twitter:description" content="Discover thousands of verified job openings across India with AI matching and instant apply on TalentXcel." />
        <meta name="twitter:image" content="https://talentxcel.in/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 mobile-optimized">
        
        {/* Mobile-First Navigation with Quick Filters */}
        <div className="border-b border-border/10 bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Mobile-First Quick Filter Categories */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide touch-pan-x">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ is_remote: true })}
                className="whitespace-nowrap flex items-center gap-1 min-h-[44px] touch-target"
              >
                🏠 Remote Jobs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ skills: ['react'] })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                ⚛️ React Developer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ search: 'data scientist' })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                📊 Data Scientist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ search: 'product manager' })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                🚀 Product Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ search: 'ui ux designer' })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                🎨 UI/UX Designer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ search: 'devops engineer' })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                🔧 DevOps Engineer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ salary_min: 1500000 })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                💰 High Salary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ experience_level: ['entry-level'] })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                🌟 Fresher Jobs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ company_type: ['fortune-500'] })}
                className="whitespace-nowrap flex items-center gap-1"
              >
                🏢 Fortune 500
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap flex items-center gap-1"
              >
                ⚡ Quick Apply
              </Button>
              
              {/* Additional AI Hub CTA */}
              <Button
                onClick={() => navigate('/career-dashboard')}
                variant="default"
                size="sm"
                className="whitespace-nowrap flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
              >
                <Brain className="h-3 w-3" />
                AI Hub
              </Button>
            </div>

            {/* Semantic Page Header for Google & Users */}
            <div className="max-w-4xl mx-auto mb-3 text-center sm:text-left">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Search Verified Jobs in India
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Explore AI-matched career opportunities across top tech companies, startups, and enterprises.
              </p>
            </div>

            {/* Mobile-First Global Search Bar */}
            <div className="max-w-4xl mx-auto mb-3 sm:mb-4">
              <GlobalSearch
                value={filters.search}
                onChange={(value) => updateFilters({ search: value })}
                onSearch={() => refetch()}
                onFiltersChange={(newFilters) => {
                  updateFilters(newFilters);
                  refetch();
                }}
                placeholder="Search jobs, skills, companies, locations..."
                recentJobs={regularJobs.slice(0, 5)}
              />
            </div>

            {/* View Mode Selector */}
            <div className="text-center">
              <div className="mb-2">
                <h3 className="font-semibold text-sm text-foreground">Choose Your View</h3>
                <p className="text-xs text-muted-foreground">Customize how you browse jobs</p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-full px-3 sm:px-4 py-2 text-xs transition-all hover:scale-105 min-h-[44px] touch-target"
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Card View</span>
                  <span className="sm:hidden">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'swipe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('swipe');
                    setSwipeIndex(0);
                  }}
                  className="rounded-full px-4 py-2 text-xs transition-all hover:scale-105"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Swipe Mode
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-full px-4 py-2 text-xs transition-all hover:scale-105"
                >
                  <List className="h-3 w-3 mr-1" />
                  List View
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {viewMode === 'card' ? 'Detailed cards with full job information' :
                 viewMode === 'swipe' ? 'Mobile-style swiping for quick browsing' :
                 'Compact list format for rapid scanning'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            
            {/* Left Sidebar - Job Filters */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="bg-card rounded-xl border border-border/20 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Job Filters</h2>
                </div>
                
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
                />
              </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 min-w-0">
              {/* Featured Jobs Section */}
              {featuredJobs.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-bold">Featured Opportunities</h2>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Premium</Badge>
                  </div>
                  <div className={
                    viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' :
                    viewMode === 'list' ? 'space-y-2' :
                    'space-y-4'
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">All Jobs</h2>
                    <Badge variant="outline">{totalCount} total jobs</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-border rounded-md px-2 py-1 bg-background"
                    >
                      <option value="posted_at">Latest First</option>
                      <option value="salary_max">Highest Salary</option>
                      <option value="views_count">Most Popular</option>
                      <option value="applications_count">Easy Apply</option>
                    </select>
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
                ) : regularJobs.length === 0 ? (
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