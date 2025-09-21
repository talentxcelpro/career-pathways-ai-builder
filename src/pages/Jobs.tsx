import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Filter, TrendingUp, Building, MapPin, Zap, FileText } from 'lucide-react';
import { BrandedFooter } from '@/components/branded/BrandedFooter';
import { JobsBanner } from '@/components/jobs/JobsBanner';
import { TopCompaniesHiring } from '@/components/jobs/TopCompaniesHiring';
import { JobCategories } from '@/components/jobs/JobCategories';
import { TrustSection } from '@/components/jobs/TrustSection';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { LiveJobFilters } from '@/components/jobs/LiveJobFilters';
import { JobsListOptimized } from '@/components/jobs/JobsListOptimized';
import { useJobsOptimized } from '@/hooks/useJobsOptimized';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { useJobsRealtime, useAutoRefreshJobs } from '@/hooks/useRealtimeData';
import { useJobsWithPagination } from '@/hooks/useJobsWithPagination';
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
import { SocialPagination } from '@/components/ui/social-pagination';
import { PersonalCareerDashboard } from '@/components/jobs/PersonalCareerDashboard';
import { SmartJobMatchingBar } from '@/components/jobs/SmartJobMatchingBar';
import { AppleJobCard } from '@/components/jobs/AppleJobCard';
import { QuickActions } from '@/components/jobs/QuickActions';

const Jobs = () => {
  const navigate = useNavigate();

  // Initialize filters from URL params and get company name if company ID is provided
  const [filters, setFilters] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      search: urlParams.get('search') || '',
      location: urlParams.get('location') || '',
      employment_type: urlParams.get('employment_type')?.split(',').filter(Boolean) || [] as string[],
      experience_level: urlParams.get('experience_level')?.split(',').filter(Boolean) || [] as string[],
      salary_min: parseInt(urlParams.get('salary_min') || '0'),
      salary_max: parseInt(urlParams.get('salary_max') || '0'),
      is_remote: urlParams.get('is_remote') === 'true',
      skills: urlParams.get('skills')?.split(',').filter(Boolean) || [] as string[],
      department: urlParams.get('department')?.split(',').filter(Boolean) || [] as string[],
      company_type: urlParams.get('company_type')?.split(',').filter(Boolean) || [] as string[],
      work_mode: urlParams.get('work_mode')?.split(',').filter(Boolean) || [] as string[],
      industry: urlParams.get('industry')?.split(',').filter(Boolean) || [] as string[],
      company_id: urlParams.get('company') || '', // Add company filter
      role_category: urlParams.get('role_category')?.split(',').filter(Boolean) || [] as string[],
      education: urlParams.get('education')?.split(',').filter(Boolean) || [] as string[],
      posted_by: urlParams.get('posted_by')?.split(',').filter(Boolean) || [] as string[],
      freshness: urlParams.get('freshness')?.split(',').filter(Boolean) || [] as string[],
    };
  });

  // Get company name if filtering by company
  const { data: companyData } = useQuery({
    queryKey: ['company-for-filter', filters.company_id],
    queryFn: async () => {
      if (!filters.company_id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', filters.company_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching company:', error);
        return null;
      }
      return data;
    },
    enabled: !!filters.company_id
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
      console.log('🔄 Job updated:', payload);
      queryClient.invalidateQueries({ queryKey: ['jobs-paginated'] });
    },
    (payload) => {
      console.log('🔄 Application updated:', payload);
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

  // Meta tags and structured data for SEO
  useEffect(() => {
    updateMetaTags({
      title: 'Latest Jobs in India | Find Your Dream Career | TalentXcel Jobs',
      description: 'Discover 10,000+ verified job openings in India. AI-powered job matching, top companies hiring, and instant applications. Find jobs in tech, finance, healthcare, and more.',
      url: `${window.location.origin}/jobs`,
      keywords: ['jobs in india', 'job search', 'career opportunities', 'hiring', 'employment', 'job openings', 'recruitment', 'AI job matching', 'career growth'],
      type: 'website',
      image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    });

    // Add JobPosting structured data with all required fields
    const currentDate = new Date().toISOString();
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
    
    const jobPostingSchema = {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      "name": "Jobs at TalentXcel",
      "description": "Find your next career opportunity with thousands of verified job listings",
      "url": `${window.location.origin}/jobs`,
      "mainEntity": {
        "@type": "JobPosting",
        "title": "Various Job Opportunities",
        "description": "Explore thousands of job opportunities across India with AI-powered matching, competitive salaries, and growth opportunities in technology, finance, healthcare, and more industries.",
        "datePosted": currentDate,
        "validThrough": expiryDate,
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "TalentXcel",
          "url": "https://talentxcel.in",
          "logo": "https://talentxcel.in/logo.png"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Multiple Cities",
            "addressRegion": "All States",
            "addressCountry": "IN",
            "postalCode": "000000"
          }
        },
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": 300000,
            "maxValue": 2500000,
            "unitText": "YEAR"
          }
        },
        "skills": "Technology, Engineering, Finance, Healthcare, Marketing, Sales, Operations, Management",
        "workHours": "40 hours per week",
        "benefits": "Health insurance, Professional development, Flexible working hours, Competitive salary, Career advancement",
        "url": `${window.location.origin}/jobs`,
        "applicationContact": {
          "@type": "ContactPoint",
          "url": `${window.location.origin}/jobs`,
          "contactType": "Application Portal"
        },
        "industry": "Multiple Industries",
        "jobBenefits": [
          "Health insurance",
          "Professional development opportunities",
          "Flexible working hours",
          "Competitive salary packages",
          "Career advancement programs"
        ]
      }
    };

    // Inject structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jobPostingSchema);
    script.id = 'jobs-schema';
    
    // Remove existing schema
    const existing = document.getElementById('jobs-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('jobs-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  // Use real data service for jobs
  const { 
    jobs: allJobs, 
    totalCount, 
    hasMore,
    isLoading, 
    refetch, 
    currentPage,
    totalPages,
    goToPage
  } = useJobsOptimized(filters, sortBy, 'pagination');

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

  // Debug logging for both issues
  console.log('📊 Jobs Data Debug:', {
    totalCount,
    allJobsLength: allJobs?.length,
    sortedJobsLength: sortedJobs?.length,
    regularJobsLength: regularJobs?.length,
    isLoading,
    currentPage,
    sampleJob: sortedJobs[0]
  });

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

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    refetch();
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
      department: [],
      company_type: [],
      work_mode: [],
      industry: [],
      role_category: [],
      education: [],
      posted_by: [],
      freshness: [],
      company_id: '',
    });
    refetch();
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
        department: [],
        company_type: [],
        work_mode: [],
        industry: [],
        role_category: [],
        education: [],
        posted_by: [],
        freshness: [],
        company_id: '',
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

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* Apple-style header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-8 w-8 rounded-lg"
              />
              <div className="flex items-center gap-2">
                <Brain className="icon-apple-sm text-primary" />
                <h1 className="text-apple-body font-apple-semibold text-foreground">
                  AI Career Discovery
                </h1>
              </div>
            </div>
            <div className="bg-muted/50 text-foreground px-3 py-1 rounded-full text-apple-small font-apple-medium flex items-center gap-1">
              <Zap className="icon-apple-xs text-primary" />
              {totalCount.toLocaleString()} Jobs
            </div>
          </div>
          
          {/* Compact search */}
          <div className="flex gap-2 items-center max-w-4xl mx-auto mt-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-apple-xs text-muted-foreground" />
                <Input
                  placeholder="Search jobs, skills, companies"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    if (e.target.value.length > 2) {
                      setTimeout(() => refetch(), 500);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      refetch();
                    }
                  }}
                  className="pl-8 h-9 text-apple-caption border-border/30 focus:ring-1 focus:ring-primary/30 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Personal Career Dashboard for logged-in users - Only show if user wants it */}
        {currentUser && (
          <div className="mb-6">
            <PersonalCareerDashboard />
          </div>
        )}

        {/* Smart Job Matching Bar */}
        {currentUser && (
          <div className="mb-6">
            <SmartJobMatchingBar 
              onFiltersChange={handleFiltersChange}
              onSearch={refetch}
            />
          </div>
        )}

        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">⭐</span>
              <h2 className="text-2xl font-bold text-gray-900">Featured Opportunities</h2>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Handpicked for You
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredJobs.slice(0, 4).map((job) => (
                <AppleJobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobs.includes(job.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="mb-6">
          <ComprehensiveJobFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Main Jobs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Quick Actions and Live Filters */}
          <div className="lg:col-span-1 space-y-6">
            <QuickActions />
            <LiveJobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalJobs={totalCount}
            />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {companyData?.name ? `Jobs at ${companyData.name}` : 'All Jobs'}
                </h2>
                <Badge variant="secondary" className="text-sm font-medium">
                  {totalCount.toLocaleString()} jobs
                </Badge>
              </div>
            </div>

            {/* Enhanced Job Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {regularJobs.map((job) => (
                <AppleJobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobs.includes(job.id)}
                />
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <SocialPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={goToPage}
                />
              </div>
            )}

            {/* No jobs found state */}
            {!isLoading && sortedJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                <Button 
                  onClick={handleClearFilters}
                  variant="outline"
                  className="bg-white"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <AutoRefreshIndicator 
          lastRefresh={lastRefresh} 
          isConnected={isConnected}
        />

        {/* Data Freshness indicator */}
        <DataFreshness 
          lastUpdated={lastRefresh}
        />
      </div>

      {/* Bottom Content */}
      <TopCompaniesHiring />
      <JobsBanner />
      <TrustSection />

      {/* Footer Note */}
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">
          Powered by TalentXcel AI – India's Intelligent Career Platform
        </p>
      </div>

      {/* TalentXcel Branded Footer */}
      <BrandedFooter />
    </div>
  );
};

export default Jobs;