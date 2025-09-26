import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Brain, Filter, TrendingUp, Building, MapPin, Zap, 
  Star, Heart, Clock, Users, Award, Sparkles, Target, 
  ChevronRight, Play, Mic, Shield, Rocket, Bell, Grid3X3,
  List, RotateCcw
} from 'lucide-react';
import { z } from 'zod';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useJobsOptimized } from '@/hooks/useJobsOptimized';
import { useRealtimeJobs, useRealtimeJobStats } from '@/hooks/useRealtimeJobs';
import { useStructuredData } from '@/hooks/useStructuredData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Industry Data
import { COMPREHENSIVE_INDUSTRIES, INDUSTRY_CATEGORIES, TRENDING_INDUSTRIES, HIGH_GROWTH_INDUSTRIES } from '@/data/industries';

// New Components for TalentSpark Experience
import { TalentSparkJobCard } from '@/components/jobs/TalentSparkJobCard';
import { SwipeableJobCard } from '@/components/jobs/SwipeableJobCard';
import { GlobalSearch } from '@/components/jobs/GlobalSearch';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { JobCategoriesGrid } from '@/components/jobs/JobCategoriesGrid';
import { HundredsOfIndustriesSection } from '@/components/jobs/HundredsOfIndustriesSection';

// Core job search components only

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
  const [txcCoins, setTxcCoins] = useState(0); // Will be loaded from real user data
  const [viewMode, setViewMode] = useState<'card' | 'swipe' | 'list'>(() => {
    // Default to swipe mode on mobile devices
    return window.innerWidth < 768 ? 'swipe' : 'card';
  });
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Safe filter update function with validation
  const updateFilters = (newFilters: any) => {
    try {
      // Validate the filters before updating
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


  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        // Get user's real TXC coin balance
        const { data } = await supabase
          .from('profiles')
          .select('txc_coins')
          .eq('id', user.id)
          .single();
        
        setTxcCoins(data?.txc_coins || 0);
        
        // Set up real-time coin balance updates
        const coinChannel = supabase
          .channel(`user-coins-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`
            },
            (payload) => {
              const newCoins = payload.new?.txc_coins;
              if (newCoins !== undefined) {
                setTxcCoins(newCoins);
              }
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(coinChannel);
        };
      }
    };
    getCurrentUser();
  }, []);

  // Real-time job data with optimized caching
  const { 
    jobs: allJobs, 
    totalCount,
    hasMore,
    isLoading, 
    refetch 
  } = useJobsOptimized(filters, sortBy);

  // Real-time job statistics
  const { stats: jobStats } = useRealtimeJobStats();

  // Google Jobs Schema
  const jobsSchema = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return null;

    const jobPostings = allJobs.slice(0, 10).map(job => ({
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description?.slice(0, 200) + "...",
      "datePosted": job.posted_at || job.created_at,
      "validThrough": job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": job.employment_type?.toUpperCase() || "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.companies?.name || job.company_name || "Company",
        "logo": job.companies?.logo_url
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location || "Multiple Cities",
          "addressCountry": "IN"
        }
      },
      "baseSalary": job.salary_min && job.salary_max ? {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": "YEAR"
        }
      } : undefined,
      "skills": job.skills_required?.join(", "),
      "url": `${window.location.origin}/jobs/${job.seo_slug || job.id}`,
      "identifier": {
        "@type": "PropertyValue",
        "name": "TalentXcel Job ID",
        "value": job.id
      }
    }));

    return {
      "@context": "https://schema.org/",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "TalentXcel Jobs",
          "url": window.location.origin,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${window.location.origin}/jobs?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "CollectionPage",
          "name": "TalentXcel Job Listings",
          "description": "Find your next career opportunity with AI-powered job matching",
          "url": window.location.href,
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
        
        // Update TXC coins in database with real-time sync
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

    // Quick apply with real TXC coin update
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
      // Submit the application data to the enhanced_job_applications table
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

      // Award TXC coins for the application
      await supabase.rpc('update_user_txc_coins', {
        user_uuid: currentUser.id,
        coin_change: 10,
        reason: 'job_application'
      });

      toast.success('Application submitted successfully! +10 TXC coins earned');
      setSwipeIndex(prev => prev + 1); // Move to next job in swipe mode
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };



  return (
    <>
      <Helmet>
        <title>TalentXcel Jobs - AI-Powered Career Discovery | {totalCount.toLocaleString()} Live Opportunities</title>
        <meta name="description" content={`Discover ${totalCount.toLocaleString()} verified job openings with TalentXcel's AI-powered matching. Instant apply, salary transparency, and TXC coin rewards. Find your dream job today!`} />
        <meta name="keywords" content="jobs india, ai job matching, career opportunities, hiring, employment, job search, talentxcel, txc coins, instant apply" />
        <link rel="canonical" href={`${window.location.origin}/jobs`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`TalentXcel Jobs - ${totalCount.toLocaleString()} AI-Matched Opportunities`} />
        <meta property="og:description" content="Revolutionary job portal with AI matching, instant apply, and TXC coin rewards. Find verified jobs at top companies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentXcel Jobs - AI Career Discovery" />
        <meta name="twitter:description" content={`${totalCount.toLocaleString()} jobs with AI matching and instant apply`} />
        <meta name="twitter:image" content="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        
        {/* Simplified Hero Section - Compact */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-border/10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                  alt="TalentXcel" 
                  className="h-8 w-8 rounded-lg"
                />
                <div>
                  <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    TalentSpark Job Discovery
                  </h1>
                  <p className="text-xs text-muted-foreground">AI-Powered • TXC Rewards</p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/career-dashboard')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10 border-primary/20 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Career Intelligence Hub</span>
                <span className="sm:hidden">AI Hub</span>
              </Button>
            </div>

            {/* Enhanced Global Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
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
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
              <div className="text-center mb-2 sm:mb-3">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">Choose Your View</h3>
                <p className="text-xs text-muted-foreground">Customize how you browse jobs</p>
              </div>
              
              <div className="flex justify-center gap-2">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-full px-4 py-2 text-xs transition-all hover:scale-105"
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Card View
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
              
              {/* View Mode Descriptions */}
              <div className="mt-3 text-center">
                {viewMode === 'card' && (
                  <p className="text-xs text-muted-foreground">
                    📱 Detailed cards with full job information
                  </p>
                )}
                {viewMode === 'swipe' && (
                  <p className="text-xs text-muted-foreground">
                    👆 Swipe left to pass, right to save - like dating for jobs!
                  </p>
                )}
                {viewMode === 'list' && (
                  <p className="text-xs text-muted-foreground">
                    📋 Compact list view for quick scanning
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Layout with Filters at Bottom */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile: Vertical Stack, Desktop: Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
            
            {/* Job Content - Mobile: Top 70%, Desktop: 9/12 columns */}
            <div className="order-1 lg:col-span-9 mb-6 lg:mb-0">
              
              {/* Mobile Job View Area - Takes 2/3 of screen */}
              <div className="min-h-[65vh] lg:min-h-0">
                <ComprehensiveJobFilters
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setFilters(prev => ({ 
                      ...prev, 
                      ...newFilters,
                      // Ensure all required properties are present
                      department: newFilters.department || prev.department,
                      company_type: newFilters.company_type || prev.company_type,
                      work_mode: newFilters.work_mode || prev.work_mode,
                      industry: newFilters.industry || prev.industry,
                      role_category: newFilters.role_category || prev.role_category,
                      education: newFilters.education || prev.education,
                      posted_by: newFilters.posted_by || prev.posted_by,
                      freshness: newFilters.freshness || prev.freshness,
                      company_id: newFilters.company_id || prev.company_id
                    }));
                  }}
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
                
                <JobCategoriesGrid />
              </div>
            </div>

            {/* Jobs Display */}
            <div className="lg:col-span-3" data-widget-id="main-jobs">
              
              {/* Jobs Count */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {totalCount.toLocaleString()} total jobs
                  </Badge>
                </div>
              </div>
              
              {/* Featured Jobs Spotlight */}
              {featuredJobs.length > 0 && (
                <div className="mb-8" data-widget-id="featured-jobs">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-2xl font-bold">🏆 Featured Opportunities</h2>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Premium
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {featuredJobs.slice(0, 4).map((job) => (
                      <TalentSparkJobCard
                        key={job.id}
                        job={job}
                        onSave={handleSaveJob}
                        onQuickApply={handleQuickApply}
                        isSaved={savedJobs.includes(job.id)}
                        txcReward={15}
                        viewMode="featured"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main Jobs Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">AI-Matched Jobs</h2>
                    <Badge variant="outline">
                      {regularJobs.length} opportunities
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="posted_at">Latest First</option>
                      <option value="salary_max">Highest Salary</option>
                      <option value="views_count">Most Viewed</option>
                      <option value="applications_count">Least Competition</option>
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="p-6 animate-pulse">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </Card>
                    ))}
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
                  <div className="space-y-6">
                    {/* View Mode Specific Content */}
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
                        
                        {/* Enhanced Swipe Interface */}
                        <SwipeableJobCard
                          jobs={sortedJobs}
                          currentIndex={swipeIndex}
                          onSwipe={(direction, job) => {
                            if (direction === 'right') {
                              handleSaveJob(job.id);
                            } else if (direction === 'left') {
                              console.log('Rejected job:', job.id);
                              // You can add rejected jobs tracking here
                            }
                            setSwipeIndex(prev => prev + 1);
                          }}
                          onSave={handleSaveJob}
                          onApply={handleJobApplication}
                          savedJobs={savedJobs}
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
                         
                         {/* Quick Job Categories for Mobile - After Swipe Jobs */}
                         <div className="md:hidden mt-8 space-y-4">
                           <h3 className="text-lg font-semibold text-center">Quick Job Categories</h3>
                           <div className="grid grid-cols-2 gap-3 px-4">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ is_remote: true })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🏠 Remote Jobs
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ skills: ['react'] })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               ⚛️ React Developer
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ search: 'data scientist' })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               📊 Data Scientist
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ search: 'product manager' })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🚀 Product Manager
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ search: 'ui ux designer' })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🎨 UI/UX Designer
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ search: 'devops engineer' })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🔧 DevOps Engineer
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ salary_min: 1500000 })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               💰 High Salary
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ experience_level: ['entry-level'] })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🌟 Fresher Jobs
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => updateFilters({ company_type: ['fortune-500'] })}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               🏢 Fortune 500
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 // Navigate to quick apply flow
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               className="flex items-center gap-2 justify-start text-sm"
                             >
                               ⚡ Quick Apply
                             </Button>
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className={
                         viewMode === 'card' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' :
                         viewMode === 'list' ? 'space-y-2' :
                         'space-y-4'
                       }>
                         {regularJobs.map((job) => (
                           <TalentSparkJobCard
                             key={job.id}
                             job={job}
                             onSave={handleSaveJob}
                             onQuickApply={handleQuickApply}
                             isSaved={savedJobs.includes(job.id)}
                             txcReward={10}
                             viewMode={viewMode}
                           />
                         ))}
                       </div>
                     )}

                     {/* Real-time job loading - no pagination needed */}
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-primary to-secondary shadow-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Jobs;