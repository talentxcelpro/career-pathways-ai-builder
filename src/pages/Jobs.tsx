import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Filter, TrendingUp, Building, MapPin, Zap } from 'lucide-react';
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
import { JobCard } from '@/components/jobs/JobCard';
import { QuickActions } from '@/components/jobs/QuickActions';

const Jobs = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 0,
    is_remote: false,
    skills: [] as string[],
    department: [] as string[],
    company_type: [] as string[],
    work_mode: [] as string[],
    industry: [] as string[],
    role_category: [] as string[],
    education: [] as string[],
    posted_by: [] as string[],
    freshness: [] as string[],
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

  const TagButton = ({ label, isActive = false }: { label: string; isActive?: boolean }) => (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
        isActive 
          ? 'bg-[#1E2A78] text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => handleCategoryClick(label.split(' ')[1] || label)}
    >
      {label}
    </button>
  );

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
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      

      {/* Header with TalentXcel branding */}
      <div className="bg-gradient-to-r from-[#1E2A78]/10 to-[#28C76F]/10 border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-12 w-12 rounded-lg"
              />
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#1E2A78]" />
                <h1 className="text-xl font-bold text-[#1E2A78] font-display">
                  Your AI Career Companion – Smart Job Discovery
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4 text-[#28C76F]" />
                  <span>AI Matching</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-[#28C76F]" />
                  <span>Smart Recommendations</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#28C76F]/10 to-[#1E2A78]/10 text-[#1E2A78] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#28C76F]" />
              {totalCount.toLocaleString()} Jobs • AI-Matched
            </div>
          </div>
          
          {/* 2. Condensed Search Bar (Single Row) */}
          <div className="flex flex-col lg:flex-row gap-2 items-center max-w-5xl mx-auto">
            <div className="flex-1 flex gap-2 w-full overflow-x-auto">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Skills / Designations / Companies"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, search: e.target.value }));
                      // Auto-search on typing for better UX
                      if (e.target.value.length > 2) {
                        setTimeout(() => refetch(), 500);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        refetch();
                      }
                    }}
                    className="pl-9 h-9 text-sm border-gray-200 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="min-w-[140px]">
                <Select 
                  value={experienceLevel} 
                  onValueChange={(value) => {
                    setExperienceLevel(value);
                    setFilters(prev => ({ 
                      ...prev, 
                      experience_level: value === 'all' ? [] : [value] 
                    }));
                    setTimeout(() => refetch(), 100);
                  }}
                >
                  <SelectTrigger className="h-9 text-sm border-gray-200">
                    <SelectValue placeholder="Experience ⌄" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="all">All Experience</SelectItem>
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
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, location: e.target.value }));
                      // Auto-search on typing for better UX
                      if (e.target.value.length > 2) {
                        setTimeout(() => refetch(), 500);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        refetch();
                      }
                    }}
                    className="pl-9 h-9 text-sm border-gray-200 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer min-w-[80px]">
                <input
                  type="checkbox"
                  checked={filters.is_remote}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, is_remote: e.target.checked }));
                    setTimeout(() => refetch(), 100);
                  }}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <span className="text-sm text-gray-700">Remote</span>
              </label>
            </div>
            
            <Button 
              size="sm" 
              className="h-9 px-4 bg-[#1E2A78] hover:bg-[#1E2A78]/90 text-white text-sm whitespace-nowrap"
              onClick={() => {
                console.log('Search clicked, current filters:', filters);
                refetch();
                toast.success('🔍 Searching for jobs...');
              }}
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
              className="text-sm font-medium border-[#28C76F] text-[#28C76F] hover:bg-[#28C76F] hover:text-white transition-all duration-200"
              onClick={() => {
                if (!currentUser) {
                  toast.error('Please login to use AI matching');
                  return;
                }
                // Enhanced AI matching
                setFilters(prev => ({
                  ...prev,
                  search: 'AI recommended jobs for me',
                  skills: [],
                  department: [],
                  role_category: []
                }));
                refetch();
                toast.success('🧠 AI is finding your perfect matches!');
              }}
            >
              <Brain className="h-4 w-4 mr-1" />
              🧠 Let AI Match Me to Jobs
            </Button>
          </div>
          
        </div>
      </div>

      {/* Main Content - Clean Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Personal Career Dashboard for logged-in users - Only show if user wants it */}
        {currentUser && (
          <div className="mb-6">
            <PersonalCareerDashboard 
              user={currentUser}
              savedJobsCount={savedJobs.length}
              appliedJobsCount={0}
              profileViews={0} 
            />
          </div>
        )}
        
        {/* Smart AI Job Matching Bar - Keep this */}
        <div className="mb-6">
          <SmartJobMatchingBar 
            currentUser={currentUser}
            onFiltersChange={handleFiltersChange}
            onSearch={refetch}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions currentUser={currentUser} />

        {/* Featured Jobs Section with Enhanced Cards */}
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
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobs.includes(job.id)}
                />
              ))}
            </div>
          </div>
        )}


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <LiveJobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalJobs={totalCount}
            />
          </div>

          {/* Jobs Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">All Job Opportunities</h2>
                <p className="text-sm text-gray-600">Find your perfect match from {totalCount} active positions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{totalCount} jobs found</span>
              </div>
            </div>

            {/* Enhanced Job Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {regularJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSaveJob}
                  isSaved={savedJobs.includes(job.id)}
                />
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && regularJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs match your criteria
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more opportunities
                </p>
                <Button onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <SocialPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={goToPage}
            />
          </div>
        )}
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