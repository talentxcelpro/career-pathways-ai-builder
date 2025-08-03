import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Filter, TrendingUp, Building, MapPin } from 'lucide-react';
import { BrandedFooter } from '@/components/branded/BrandedFooter';
import { JobsBanner } from '@/components/jobs/JobsBanner';
import { TopCompaniesHiring } from '@/components/jobs/TopCompaniesHiring';
import { JobCategories } from '@/components/jobs/JobCategories';
import { TrustSection } from '@/components/jobs/TrustSection';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { JobsList } from '@/components/jobs/JobsList';
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

  // Use pagination hook for jobs
  const { 
    jobs: allJobs, 
    totalCount, 
    isLoading, 
    refetch, 
    currentPage,
    totalPages,
    goToPage
  } = useJobsWithPagination(filters, sortBy);

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
                  Find Jobs Faster – Powered by TalentXcel AI Matching
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4 text-[#28C76F]" />
                  <span>AI Filters</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-[#28C76F]" />
                  <span>Top Companies</span>
                </div>
              </div>
            </div>
            <div className="bg-[#28C76F]/10 text-[#28C76F] px-3 py-1 rounded-full text-sm font-medium">
              {totalCount} Jobs
            </div>
          </div>
          
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
              className="h-9 px-4 bg-[#1E2A78] hover:bg-[#1E2A78]/90 text-white text-sm whitespace-nowrap"
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
              className="text-sm font-medium border-[#28C76F] text-[#28C76F] hover:bg-[#28C76F] hover:text-white"
              onClick={() => handleUniversalSearch("Ask AI to suggest best jobs for me")}
            >
              <Brain className="h-4 w-4 mr-1" />
              🧠 Let AI Match Me to Jobs
            </Button>
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

        {/* Location Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-base text-gray-900">🌍 Job Location</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filters.location === '' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
            >
              🌐 All Jobs
            </Button>
            <Button
              variant={filters.location === 'India' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, location: 'India' }))}
            >
              🇮🇳 India Jobs
            </Button>
            <Button
              variant={filters.location === 'International' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, location: 'International' }))}
            >
              🌎 International Jobs
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ComprehensiveJobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              className="sticky top-6"
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

      {/* Top Companies Hiring - Moved up */}
      <TopCompaniesHiring />

      {/* Mock Interview Banner - Moved to bottom */}
      <JobsBanner />

      {/* Browse by Categories */}
      <JobCategories onCategoryClick={handleCategoryClick} />

      {/* Trust & FOMO Section */}
      <TrustSection />

          {/* Footer Note */}
          <div className="text-center py-8 mt-12">
            <p className="text-sm text-gray-600">
              Powered by TalentXcel AI – India's Intelligent Career Platform
            </p>
          </div>

          {/* Floating Apply Widget (Mobile) */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
        <div className="bg-[#1E2A78] text-white rounded-2xl p-4 shadow-2xl">
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