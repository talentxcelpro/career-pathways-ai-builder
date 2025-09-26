import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Brain, Filter, TrendingUp, Building, MapPin, Zap, 
  Star, Heart, Clock, Users, Award, Sparkles, Target, 
  ChevronRight, Play, Mic, Shield, Rocket, Bell
} from 'lucide-react';

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
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { PersonalCareerDashboard } from '@/components/jobs/PersonalCareerDashboard';
import { SmartJobMatchingBar } from '@/components/jobs/SmartJobMatchingBar';
import { JobCategoriesGrid } from '@/components/jobs/JobCategoriesGrid';
import { TXCCoinBalance } from '@/components/jobs/TXCCoinBalance';
import { QuickApplyWidget } from '@/components/jobs/QuickApplyWidget';
import { SalaryTransparencyWidget } from '@/components/jobs/SalaryTransparencyWidget';
import { HundredsOfIndustriesSection } from '@/components/jobs/HundredsOfIndustriesSection';
import { TopCompaniesSalaries } from '@/components/jobs/TopCompaniesSalaries';

// Enhanced UX Components
import { JobComparisonPanel } from '@/components/jobs/JobComparisonPanel';
import { EnhancedCompanyProfile } from '@/components/jobs/EnhancedCompanyProfile';
import { ApplicationTracker } from '@/components/jobs/ApplicationTracker';
import { ProgressiveDisclosure } from '@/components/jobs/ProgressiveDisclosure';
import { FilterDiscoveryWidget } from '@/components/jobs/FilterDiscoveryWidget';

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
  const [viewMode, setViewMode] = useState<'card' | 'swipe' | 'list'>('card');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Enhanced UX State
  const [comparisonJobs, setComparisonJobs] = useState<any[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isApplicationTrackerOpen, setIsApplicationTrackerOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

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

  // Real-time job data with live updates
  const { 
    jobs: allJobs, 
    totalCount, 
    hasMore,
    isLoading, 
    isConnected,
    refetch 
  } = useRealtimeJobs(filters, sortBy);

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

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsVoiceSearching(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFilters(prev => ({ ...prev, search: transcript }));
        setIsVoiceSearching(false);
        refetch();
      };

      recognition.onerror = () => {
        setIsVoiceSearching(false);
        toast.error('Voice search failed');
      };
    } else {
      toast.error('Voice search not supported');
    }
  };

  // Enhanced UX Functions
  const addToComparison = (job: any) => {
    if (comparisonJobs.length >= 3) {
      toast.error('You can only compare up to 3 jobs at once');
      return;
    }
    
    if (comparisonJobs.find(j => j.id === job.id)) {
      toast.error('Job already in comparison');
      return;
    }
    
    setComparisonJobs(prev => [...prev, job]);
    toast.success('Job added to comparison');
  };

  const removeFromComparison = (jobId: string) => {
    setComparisonJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const clearComparison = () => {
    setComparisonJobs([]);
    setIsComparisonOpen(false);
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
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    TalentSpark Job Discovery
                  </h1>
                  <p className="text-sm text-muted-foreground">AI-Powered • TXC Rewards</p>
                </div>
              </div>
              
            </div>

            {/* Compact Search Bar */}
            <div className="max-w-3xl mx-auto mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, skills, companies..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && refetch()}
                    className="pl-10 pr-4 h-10 border border-primary/20 focus:border-primary/50 rounded-lg bg-white/80"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleVoiceSearch}
                  disabled={isVoiceSearching}
                  variant="outline"
                  className="h-10 px-3"
                >
                  <Mic className={`h-4 w-4 ${isVoiceSearching ? 'animate-pulse text-red-400' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  onClick={() => refetch()}
                  className="h-10 px-6"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Search Tags - All Clickable */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Remote Jobs', filter: { is_remote: true } },
                { label: 'React Developer', filter: { search: 'React Developer' } },
                { label: 'Data Scientist', filter: { search: 'Data Scientist' } },
                { label: 'Product Manager', filter: { search: 'Product Manager' } },
                { label: 'UI/UX Designer', filter: { search: 'UI/UX Designer' } },
                { label: 'DevOps Engineer', filter: { search: 'DevOps Engineer' } }
              ].map((tag) => (
                <Button
                  key={tag.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, ...tag.filter }));
                    refetch();
                  }}
                  className="rounded-full bg-white/60 backdrop-blur-sm hover:bg-primary hover:text-white transition-all text-xs"
                >
                  {tag.label}
                </Button>
              ))}
            </div>

            {/* View Mode Selector */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-full"
              >
                <Building className="h-4 w-4 mr-2" />
                Card View
              </Button>
              <Button
                variant={viewMode === 'swipe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('swipe')}
                className="rounded-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Swipe Mode
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-full"
              >
                <Users className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <ProgressiveDisclosure isNewUser={isNewUser}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-widget-id="job-search">
          
          {/* Filter Discovery Widget */}
          <div className="mb-8">
            <FilterDiscoveryWidget
              activeFilters={filters}
              onFilterChange={setFilters}
              totalJobs={totalCount}
              isMobile={false}
            />
          </div>
          
          {/* Personal Dashboard for logged-in users */}
          {currentUser && (
            <div className="mb-8" data-widget-id="personal-dashboard">
              <PersonalCareerDashboard />
            </div>
          )}

          {/* AI Job Matching Bar */}
          {currentUser && (
            <div className="mb-8" data-widget-id="ai-matching">
              <SmartJobMatchingBar 
                onFiltersChange={(aiFilters) => {
                  setFilters(prev => ({ 
                    ...prev, 
                    search: aiFilters.search || prev.search,
                    location: aiFilters.location || prev.location,
                    employment_type: aiFilters.employment_type || prev.employment_type,
                    experience_level: aiFilters.experience_level || prev.experience_level,
                    salary_min: aiFilters.salary_min || prev.salary_min,
                    salary_max: aiFilters.salary_max || prev.salary_max,
                    is_remote: aiFilters.is_remote !== undefined ? aiFilters.is_remote : prev.is_remote,
                    skills: aiFilters.skills || prev.skills
                  }));
                }}
                onSearch={refetch}
              />
            </div>
          )}

          {/* Quick Apply Widget */}
          {currentUser && (
            <div className="mb-8" data-widget-id="quick-apply">
              <QuickApplyWidget />
            </div>
          )}

          {/* Salary Transparency Widget */}
          <div className="mb-8" data-widget-id="salary-widget">
            <SalaryTransparencyWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Advanced Filters Sidebar */}
            <div className="lg:col-span-1" data-filter-sidebar>
              <div className="sticky top-6 space-y-6">
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
                
                {/* Top Companies Salaries */}
                <div className="mt-8" data-widget-id="top-companies">
                  <TopCompaniesSalaries />
                </div>
              </div>
            </div>

            {/* Jobs Display */}
            <div className="lg:col-span-3" data-widget-id="main-jobs">
              
              {/* Enhanced Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsApplicationTrackerOpen(true)}
                    className="gap-2"
                  >
                    📊 My Applications
                  </Button>
                  {comparisonJobs.length > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsComparisonOpen(true)}
                      className="gap-2"
                    >
                      📋 Compare Jobs ({comparisonJobs.length})
                    </Button>
                  )}
                </div>
                
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
                        onCompare={addToComparison}
                        isSaved={savedJobs.includes(job.id)}
                        isInComparison={comparisonJobs.some(j => j.id === job.id)}
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
                  <div className={
                      viewMode === 'card' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' :
                      viewMode === 'swipe' ? 'space-y-4' :
                      'space-y-4'
                    }>
                      {regularJobs.map((job) => (
                        <TalentSparkJobCard
                          key={job.id}
                          job={job}
                          onSave={handleSaveJob}
                          onQuickApply={handleQuickApply}
                          onCompare={addToComparison}
                          isSaved={savedJobs.includes(job.id)}
                          isInComparison={comparisonJobs.some(j => j.id === job.id)}
                          txcReward={10}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>

                    {/* Real-time job loading - no pagination needed */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </ProgressiveDisclosure>

        {/* Enhanced Features */}
        <JobComparisonPanel
          jobs={comparisonJobs}
          onRemoveJob={removeFromComparison}
          onClearAll={clearComparison}
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
        />

        <ApplicationTracker
          isOpen={isApplicationTrackerOpen}
          onClose={() => setIsApplicationTrackerOpen(false)}
        />

        {/* Hundreds of Industries Section */}
        <div className="max-w-7xl mx-auto px-4 py-16" data-widget-id="industries">
          <HundredsOfIndustriesSection />
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