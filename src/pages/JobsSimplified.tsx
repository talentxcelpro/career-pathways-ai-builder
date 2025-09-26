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

import { useAuth } from '@/contexts/AuthContext';

const JobsSimplified = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // State Management
  const [filters, setFilters] = useState(() => {
    return {
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      employment_type: searchParams.get('employment_type')?.split(',').filter(Boolean) || [],
      experience_level: searchParams.get('experience_level') || '',
      salary_min: searchParams.get('salary_min') || '',
      salary_max: searchParams.get('salary_max') || '',
      is_remote: searchParams.get('is_remote') === 'true',
      companies: searchParams.get('companies')?.split(',').filter(Boolean) || [],
      industry: searchParams.get('industry') || '',
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc',
      skills: []
    };
  });

  const [viewMode, setViewMode] = useState<'card' | 'swipe' | 'list'>('card');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Job fetching with optimized hook
  const { 
    jobs, 
    isLoading, 
    refetch
  } = useJobsOptimized(filters);

  const { stats: jobStats } = useRealtimeJobStats();

  // Voice search
  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    setIsVoiceSearching(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFilters(prev => ({ ...prev, search: transcript }));
      toast.success(`Searching for: "${transcript}"`);
    };

    recognition.onerror = () => {
      toast.error('Voice search failed. Please try again.');
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.start();
  };

  // Structured data for SEO
  useStructuredData({
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    "name": "Job Search | Find Your Dream Career",
    "description": "Discover thousands of job opportunities with AI-powered matching, salary insights, and career guidance.",
    "url": window.location.href,
    "hasPart": jobs.slice(0, 5).map(job => ({
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company_name
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location
        }
      },
      "datePosted": job.created_at,
      "validThrough": job.application_deadline,
      "employmentType": job.employment_type?.toUpperCase(),
      "baseSalary": job.salary_min && job.salary_max ? {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": "YEAR"
        }
      } : undefined
    }))
  });

  // Filter change handlers
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Jobs | Find Your Dream Career | TalentXcel</title>
        <meta name="description" content="Discover thousands of job opportunities with AI-powered matching and intelligent career guidance. Find remote jobs, tech roles, and career growth opportunities." />
        <meta name="keywords" content="jobs, careers, remote jobs, tech jobs, job search, career opportunities, employment, hiring, job listings" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        {/* Hero Section - Simplified */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-apple-bold mb-6 tracking-tight">
                Find Your Dream Job
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-apple-medium">
                Discover {jobStats?.total_jobs || '10,000+'} opportunities with intelligent matching
              </p>

              {/* Career Dashboard CTA */}
              <div className="mb-8">
                <Button 
                  onClick={() => navigate('/career-dashboard')}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-apple-bold text-lg px-8 py-4 shadow-lg"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Open Career Dashboard
                </Button>
              </div>

              {/* Search Bar */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="Search jobs, companies, or skills..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange({ search: e.target.value })}
                      className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg h-12"
                    />
                  </div>
                  
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <Input
                      placeholder="Location (e.g., Mumbai, Remote)"
                      value={filters.location}
                      onChange={(e) => handleFilterChange({ location: e.target.value })}
                      className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg h-12"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleVoiceSearch}
                      disabled={isVoiceSearching}
                      variant="outline"
                      className="h-12 px-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Mic className={`h-4 w-4 ${isVoiceSearching ? 'animate-pulse text-red-400' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => refetch()}
                      className="h-12 px-6 bg-white text-primary hover:bg-white/90 font-apple-medium"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Quick Search Tags */}
                <div className="flex flex-wrap gap-2 justify-center mt-6">
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
                        handleFilterChange(tag.filter);
                        refetch();
                      }}
                      className="rounded-full bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all text-sm font-apple-medium"
                    >
                      {tag.label}
                    </Button>
                  ))}
                </div>

                {/* View Mode Selector - Simplified to just Card View */}
                <div className="flex justify-center mt-6">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full bg-white text-primary hover:bg-white/90 font-apple-bold px-8"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Card View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Job Listings Only */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Filters */}
          <div className="mb-8">
            <ComprehensiveJobFilters 
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>

          {/* Jobs List */}
          <div className="space-y-6">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-16 bg-muted rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && jobs.length === 0 && (
              <div className="text-center py-16">
                <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-apple-bold mb-2">No jobs found</h3>
                <p className="text-muted-foreground font-apple-medium">Try adjusting your search criteria or check back later for new opportunities.</p>
                <Button 
                  onClick={() => navigate('/career-dashboard')}
                  className="mt-4 font-apple-medium"
                >
                  Get AI Job Recommendations
                </Button>
              </div>
            )}

            {!isLoading && jobs.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job, index) => (
                    <TalentSparkJobCard 
                      key={job.id} 
                      job={job}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasNextPage && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      size="lg"
                      className="font-apple-medium"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Jobs'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsSimplified;