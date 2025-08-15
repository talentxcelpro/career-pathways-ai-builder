import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Filter, TrendingUp, Building, MapPin, Users, Plus, BookOpen, Eye } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { SocialPagination } from '@/components/ui/social-pagination';
import { useAuth } from '@/contexts/AuthContext';

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Get profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      return profileData;
    },
    enabled: !!user?.id
  });

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

  // Use optimized pagination hook for jobs
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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Mock data for "People you may know" and "Trending skills"
  const peopleYouMayKnow = [
    { 
      name: "Akash Verma", 
      title: "Senior Data Scientist", 
      company: "Microsoft",
      connections: "6 mutual connections",
      avatar: "/lovable-uploads/f873a6b0-6b3b-4b61-8d92-f992fc8a5051.png"
    },
    { 
      name: "Ritu Khanna", 
      title: "Software Engineer", 
      company: "Google",
      connections: "5 mutual connections",
      avatar: "/lovable-uploads/f873a6b0-6b3b-4b61-8d92-f992fc8a5051.png"
    }
  ];

  const trendingSkills = [
    { name: "Product Management", followers: "20,550 followers" },
    { name: "Data Science", followers: "15,240 followers" },
    { name: "Python", followers: "10,430 followers" }
  ];

  const learningCourses = [
    { 
      title: "Introduction to Python", 
      progress: "80% completed",
      image: "/lovable-uploads/f873a6b0-6b3b-4b61-8d92-f992fc8a5051.png"
    },
    { 
      title: "Design Thinking", 
      progress: "50% completed",
      image: "/lovable-uploads/f873a6b0-6b3b-4b61-8d92-f992fc8a5051.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* LinkedIn-style Three Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Profile & Quick Links */}
          <div className="lg:col-span-3 space-y-4">
            {/* User Profile Card */}
            {user && (
              <Card className="bg-card border border-border">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {profile?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {profile?.headline || 'Senior Software Engineer'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {profile?.location || 'San Francisco, CA'}
                  </p>
                  <Button className="w-full" size="sm">
                    Update profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Quick links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                  <div>My Items</div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                  <div>Saved jobs</div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-8" asChild>
                  <div>Create job</div>
                </Button>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Recommended jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Product Manager</p>
                  <p className="text-xs text-muted-foreground">Google</p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">UI/UX Designer</p>
                  <p className="text-xs text-muted-foreground">Microsoft</p>
                  <p className="text-xs text-muted-foreground">New York, NY</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Jobs Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Header with Tagline */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Jobs</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Find Jobs Faster – Powered by TalentXcel AI Matching
              </p>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Keywords"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry level</SelectItem>
                      <SelectItem value="mid">Mid level</SelectItem>
                      <SelectItem value="senior">Senior level</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Date posted" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past week</SelectItem>
                      <SelectItem value="month">Past month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex gap-6 mt-4 border-b border-border">
                <button className="text-sm font-medium pb-2 border-b-2 border-primary text-primary">
                  All content
                </button>
                <button className="text-sm font-medium pb-2 text-muted-foreground hover:text-foreground">
                  My network
                </button>
                <button className="text-sm font-medium pb-2 text-muted-foreground hover:text-foreground">
                  Jobs
                </button>
                <button className="text-sm font-medium pb-2 text-muted-foreground hover:text-foreground">
                  Learning
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                sortedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {job.companies?.logo_url ? (
                            <img 
                              src={job.companies.logo_url} 
                              alt={job.companies.name} 
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Building className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-sm hover:text-primary cursor-pointer">
                                {job.title}
                              </h3>
                              <p className="text-sm text-foreground font-medium mt-1">
                                {job.companies?.name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {job.location}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {job.description}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span>{job.salary_min && job.salary_max ? `₹${job.salary_min/100000}L - ₹${job.salary_max/100000}L` : 'Salary not disclosed'}</span>
                                <span>1 hour ago</span>
                              </div>
                            </div>
                            
                            {job.is_featured && (
                              <Badge variant="secondary" className="ml-2">
                                600K+
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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

          {/* Right Sidebar - People & Trending */}
          <div className="lg:col-span-3 space-y-4">
            {/* People you may know */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">People you may know</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {peopleYouMayKnow.map((person, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.title}</p>
                      <p className="text-xs text-muted-foreground">{person.connections}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Connect
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending skills */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Trending skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.followers}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs h-7">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningCourses.map((course, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-12 h-8 bg-muted rounded flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.progress}</p>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4" size="sm">
                  Post
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Keep existing functionality components hidden but functional */}
      <div style={{ display: 'none' }}>
        <TopCompaniesHiring />
        <JobsBanner />
        <TrustSection />
        <BrandedFooter />
      </div>
    </div>
  );
};

export default Jobs;
